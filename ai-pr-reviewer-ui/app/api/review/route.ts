import { NextResponse } from 'next/server';
import { Octokit } from "@octokit/rest";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60; 

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- REUSABLE SCHEMAS & PROMPTS ---
const issueSchema = {
    type: "ARRAY",
    description: "A list of issues found during the code review.",
    items: {
        type: "OBJECT",
        properties: {
            file: { type: "STRING" },
            line_range: { type: "STRING" },
            severity: { type: "STRING" },
            finding: { type: "STRING" },
            recommendation: { type: "STRING" }
        },
        required: ["file", "line_range", "severity", "finding", "recommendation"]
    }
};

const securityPrompt = `You are an elite application security engineer. Review the provided code diff for vulnerabilities. CRITICAL INSTRUCTION: If no frontend/relevant code is found, return [].`;
const performancePrompt = `You are an expert performance engineer optimizing full-stack architectures. Review the code for bottlenecks and memory leaks. CRITICAL INSTRUCTION: If no frontend/relevant code is found, return [].`;
const designPrompt = `You are a lead UI/UX engineer. Review the code for styling best practices and accessibility. CRITICAL INSTRUCTION: If no frontend/relevant code is found, return [].`;
const testingPrompt = `You are a strict Quality Assurance engineer. Review the diff to ensure adequate test coverage. CRITICAL INSTRUCTION: If no frontend/relevant code is found, return [].`;

// --- HELPER FUNCTIONS ---
function parseGitHubUrl(url: string) {
    const regex = /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/;
    const match = url.match(regex);
    if (!match) throw new Error("Invalid GitHub PR URL");
    return { owner: match[1], repo: match[2], pullNumber: parseInt(match[3], 10) };
}

// ✅ FIXED FUNCTION
async function getPRDiff(
    owner: string,
    repo: string,
    pullNumber: number
): Promise<string> {
    const response = await octokit.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
        mediaType: { format: "diff" },
    });

    // ✅ TypeScript escape hatch
    return response.data as unknown as string;
}

async function runSpecialistAgent(
    agentName: string,
    systemInstruction: string,
    diff: string
) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Review this diff:\n${diff}`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: issueSchema
            }
        });

        const rawIssues = JSON.parse(response.text || "[]");

        return rawIssues.map((issue: any) => ({
            ...issue,
            agent: agentName
        }));
    } catch (error) {
        console.error(`Error in ${agentName} Agent:`, error);
        return [];
    }
}

// --- MAIN API ROUTE ---
export async function POST(request: Request) {
    try {
        const { prUrl } = await request.json();

        if (!prUrl) {
            return NextResponse.json(
                { error: 'PR URL is required' },
                { status: 400 }
            );
        }

        console.log(`Starting review for: ${prUrl}`);
        const { owner, repo, pullNumber } = parseGitHubUrl(prUrl);

        // 1. Fetch Diff
        const diff = await getPRDiff(owner, repo, pullNumber);

        if (!diff) {
            return NextResponse.json(
                { error: 'Could not fetch PR diff. Check permissions or URL.' },
                { status: 404 }
            );
        }

        // ✅ CLEANED AGENT CALLS (no more `as string`)
        const [security, performance, design, testing] = await Promise.all([
            runSpecialistAgent("Security", securityPrompt, diff),
            runSpecialistAgent("Performance", performancePrompt, diff),
            runSpecialistAgent("Design", designPrompt, diff),
            runSpecialistAgent("Testing", testingPrompt, diff)
        ]);

        const allIssues = [
            ...security,
            ...performance,
            ...design,
            ...testing
        ];

        console.log(`Review complete. Found ${allIssues.length} issues.`);

        return NextResponse.json({ issues: allIssues });

    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}