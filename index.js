import "dotenv/config";
import { Octokit } from "@octokit/rest";
import { GoogleGenAI, Type } from "@google/genai";
import { program } from "commander";
import chalk from "chalk";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --------------------
// CLI setup
// --------------------
program
  .name("ai-reviewer")
  .description("Automated AI Code Reviewer for GitHub PRs")
  .version("1.0.0")
  .requiredOption("--pr-url <url>", "The full URL of the GitHub Pull Request");

program.parse(process.argv);
const options = program.opts();

// --------------------
// Helpers
// --------------------
function parseGitHubUrl(url) {
  const regex = /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/;
  const match = String(url).match(regex);

  if (!match) {
    console.error(chalk.red.bold("\n❌ Invalid GitHub PR URL provided."));
    process.exit(1);
  }

  return {
    owner: match[1],
    repo: match[2],
    pullNumber: parseInt(match[3], 10),
  };
}

// Helper to turn "12-15" into { start: 12, end: 15 }
function parseLineRange(rangeStr) {
  const parts = String(rangeStr).split("-");
  const start = parseInt(parts[0], 10);
  const end = parts.length > 1 ? parseInt(parts[1], 10) : start;
  return { start, end };
}

// Helper to check if two ranges overlap
function isOverlapping(rangeA, rangeB) {
  const rA = parseLineRange(rangeA);
  const rB = parseLineRange(rangeB);
  return Math.max(rA.start, rB.start) <= Math.min(rA.end, rB.end);
}

// --------------------
// Schema
// --------------------
const issueSchema = {
  type: Type.ARRAY,
  description: "A list of issues found during the code review.",
  items: {
    type: Type.OBJECT,
    properties: {
      file: { type: Type.STRING, description: "The name of the file" },
      line_range: {
        type: Type.STRING,
        description: "The affected lines, e.g., 12-15",
      },
      severity: { type: Type.STRING, description: "low, medium, or high" },
      finding: { type: Type.STRING, description: "What the issue is" },
      recommendation: { type: Type.STRING, description: "How to fix it" },
    },
    required: ["file", "line_range", "severity", "finding", "recommendation"],
  },
};

// --------------------
// GitHub / LLM utilities
// --------------------
async function getPRDiff(owner, repo, pullNumber) {
  try {
    console.log(chalk.cyan(`\nFetching PR #${pullNumber} from ${owner}/${repo}...`));

    const response = await octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
      mediaType: {
        format: "diff",
      },
    });

    return String(response.data);
  } catch (error) {
    console.error(chalk.red("Error fetching PR from GitHub:"), error.message || error);
    return null;
  }
}

async function runSpecialistAgent(agentName, systemInstruction, diff) {
  console.log(`\n🕵️  Running ${agentName} Agent...`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Review this diff:\n${diff}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: issueSchema,
      },
    });

    if (!response.text) {
      console.log(`✅ [${agentName}] No issues found.`);
      return [];
    }

    const issues = JSON.parse(response.text);

    if (!Array.isArray(issues) || issues.length === 0) {
      console.log(`✅ [${agentName}] No issues found.`);
      return [];
    }

    issues.forEach((issue) => {
      console.log(
        `⚠️  [${agentName}] [${String(issue.severity).toUpperCase()}] ${issue.file} (${issue.line_range})`
      );
      console.log(`   - Finding: ${issue.finding}`);
      console.log(`   - Fix: ${issue.recommendation}`);
    });

    return issues;
  } catch (error) {
    console.error(`Error running ${agentName} Agent:`, error.message || error);
    return [];
  }
}

async function resolveConflictWithAI(issue1, issue2) {
  console.log(
    `\n🧠 Coordinator analyzing overlap in ${issue1.file} (Lines ${issue1.line_range} & ${issue2.line_range})...`
  );

  const prompt = `You are the Lead Senior Engineer coordinating an automated code review. 
Two specialist agents left feedback on the exact same (or overlapping) lines of code.

Issue A: ${JSON.stringify(issue1)}
Issue B: ${JSON.stringify(issue2)}

Do these two pieces of feedback contradict each other?
- If they contradict, choose the most critical one.
- If they do NOT contradict, merge them into a single, cohesive piece of feedback.

Return your finalized decision using the required JSON schema.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: issueSchema,
      },
    });

    if (!response.text) return issue1;

    const resolvedIssues = JSON.parse(response.text);
    if (Array.isArray(resolvedIssues) && resolvedIssues.length > 0) {
      return resolvedIssues[0];
    }

    return issue1;
  } catch (error) {
    console.error("Coordinator AI failed, defaulting to Issue 1:", error.message || error);
    return issue1;
  }
}

async function runCoordinatorPass(allIssues) {
  const groupedByFile = {};

  allIssues.forEach((issue) => {
    if (!groupedByFile[issue.file]) {
      groupedByFile[issue.file] = [];
    }
    groupedByFile[issue.file].push(issue);
  });

  const finalizedIssues = [];

  for (const file in groupedByFile) {
    const issuesInFile = groupedByFile[file];

    let i = 0;
    while (i < issuesInFile.length) {
      let currentIssue = issuesInFile[i];
      let conflictFound = false;

      for (let j = i + 1; j < issuesInFile.length; j++) {
        const compareIssue = issuesInFile[j];

        if (isOverlapping(currentIssue.line_range, compareIssue.line_range)) {
          const resolvedIssue = await resolveConflictWithAI(currentIssue, compareIssue);
          currentIssue = resolvedIssue;
          issuesInFile.splice(j, 1);
          conflictFound = true;
          break;
        }
      }

      finalizedIssues.push(currentIssue);
      i++;
    }
  }

  return finalizedIssues;
}

// --------------------
// Formatters
// --------------------
function formatReviewAsMarkdown(issues) {
  if (!issues || issues.length === 0) {
    return "## Code Review\n\nNo issues found.";
  }

  const grouped = {};

  for (const issue of issues) {
    if (!grouped[issue.file]) grouped[issue.file] = [];
    grouped[issue.file].push(issue);
  }

  let md = "## Code Review\n\n";

  for (const file of Object.keys(grouped)) {
    md += `### ${file}\n\n`;
    for (const issue of grouped[file]) {
      md += `- **Severity:** ${issue.severity}\n`;
      md += `  - **Lines:** ${issue.line_range}\n`;
      md += `  - **Finding:** ${issue.finding}\n`;
      md += `  - **Recommendation:** ${issue.recommendation}\n\n`;
    }
  }

  return md;
}

function printColoredConsoleReport(issues) {
  console.log(chalk.bold.blue("\n========================================="));
  console.log(chalk.bold.blue("🤖 AI REVIEW SQUAD TERMINAL REPORT"));
  console.log(chalk.bold.blue("=========================================\n"));

  if (!issues || issues.length === 0) {
    console.log(chalk.green.bold("✅ No major issues found! Ready to merge."));
    return;
  }

  issues.forEach((issue) => {
    let severityBadge;
    const sev = String(issue.severity || "").toLowerCase();

    if (sev === "high") {
      severityBadge = chalk.bgRed.white.bold(` [HIGH] `);
    } else if (sev === "medium") {
      severityBadge = chalk.bgYellow.black.bold(` [MEDIUM] `);
    } else {
      severityBadge = chalk.bgBlue.white.bold(` [LOW] `);
    }

    console.log(
      `${severityBadge} ${chalk.bold(issue.file)} ${chalk.gray(`(Lines: ${issue.line_range})`)}`
    );
    console.log(chalk.white(`   ↳ ${issue.finding}`));
    console.log(chalk.green(`   💡 Fix: ${issue.recommendation}\n`));
  });
}

async function postCommentToPR(owner, repo, pullNumber, body) {
  try {
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: pullNumber,
      body,
    });
    console.log(chalk.green("✅ Posted review comment to PR."));
  } catch (error) {
    console.error("Error posting comment to PR:", error.message || error);
  }
}

// --------------------
// Main CLI flow
// --------------------
async function runCLI() {
  const { owner, repo, pullNumber } = parseGitHubUrl(options.prUrl);

  const diff = await getPRDiff(owner, repo, pullNumber);
  if (!diff) {
    console.log(chalk.red("Could not fetch diff. Exiting."));
    process.exit(1);
  }

  const securityPrompt = `You are an elite application security engineer. Review the provided code diff for vulnerabilities, focusing on injection flaws, authentication bypasses, insecure data handling, and dependency risks.
CRITICAL INSTRUCTION: If the provided diff does not contain security-relevant changes, you MUST return an empty array []. Do not explain why, just return [].`;

  const performancePrompt = `You are an expert performance engineer optimizing full-stack architectures. Review the code for bottlenecks, memory leaks, inefficient database queries, and blocking operations in Node.js environments.
CRITICAL INSTRUCTION: If the provided diff does not contain performance-relevant changes, you MUST return an empty array []. Do not explain why, just return [].`;

  const designPrompt = `You are a lead UI/UX engineer and front-end specialist. Review the code for styling best practices, component reusability, accessibility, and fluid interactions.
CRITICAL INSTRUCTION: If the provided diff does not contain any front-end code, UI components, or styling changes, you MUST return an empty array []. Do not explain why, just return [].`;

  const testingPrompt = `You are a strict Quality Assurance engineer. Review the diff to ensure adequate test coverage. Identify missing edge cases, improper mocking, and fragile assertions.
CRITICAL INSTRUCTION: If the provided diff does not contain test-related changes or test-impacting logic, you MUST return an empty array []. Do not explain why, just return [].`;

  console.log(chalk.yellow("Agents are analyzing the code...\n"));
  console.time("⏱️ Specialist Review Time");

  const [securityIssues, performanceIssues, designIssues, testingIssues] = await Promise.all([
    runSpecialistAgent("Security", securityPrompt, diff),
    runSpecialistAgent("Performance", performancePrompt, diff),
    runSpecialistAgent("Design", designPrompt, diff),
    runSpecialistAgent("Testing", testingPrompt, diff),
  ]);

  console.timeEnd("⏱️ Specialist Review Time");

  const rawIssues = [
    ...securityIssues,
    ...performanceIssues,
    ...designIssues,
    ...testingIssues,
  ];

  console.log(chalk.magenta(`\n🔍 Raw issues found before coordination: ${rawIssues.length}`));

  console.time("⏱️ Coordinator Pass Time");
  const finalizedIssues = await runCoordinatorPass(rawIssues);
  console.timeEnd("⏱️ Coordinator Pass Time");

  console.log(chalk.green(`✅ Final issues after conflict resolution: ${finalizedIssues.length}`));

  printColoredConsoleReport(finalizedIssues);

  const markdownComment = formatReviewAsMarkdown(finalizedIssues);
  await postCommentToPR(owner, repo, pullNumber, markdownComment);
}

runCLI().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});