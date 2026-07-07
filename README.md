CodeSentinel 🛡️


A multi-agent AI system that reviews pull requests the way a senior engineering team would — with specialist expertise, structured findings, and explicit conflict resolution.




The Problem

Standard linters and static analyzers catch surface issues — unused variables, missing escapes, style violations. They cannot reason about architecture, intent, or consequence.

Human reviewers can, but they disagree. A security engineer and a design engineer looking at the same code will often reach contradictory conclusions. The developer gets two conflicting review comments with no guidance on which matters more, or why.

CodeSentinel solves both problems:


Four specialist agents each go deep on one dimension of code quality
A coordinator agent detects conflicts between specialists and resolves them explicitly
The output is a single prioritized, human-readable review — not a list of tool warnings



Why Agents?

A single prompt asked to review code for security, performance, design, and test coverage simultaneously produces shallow output across all four. Each domain demands a different mode of reasoning that competes for attention in a shared context window.

The multi-agent pattern gives each concern its own agent, context, and instruction set. The coordinator's job is then synthesis — not review. This mirrors how senior engineering teams actually work: specialists go deep, then someone senior reconciles the findings.


Architecture

┌─────────────────────────────────────────────────────────────────┐
│                        USER INPUT                               │
│                  --pr-url <GitHub PR URL>                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MCP TOOL LAYER                                │
│   ┌──────────────────────┐   ┌─────────────────────────────┐   │
│   │  MCP GitHub Server   │   │  MCP Filesystem Server      │   │
│   │  - PR diff           │   │  - Full file content        │   │
│   │  - Changed file list │   │  - Module context           │   │
│   │  - PR metadata       │   │  - Existing test suites     │   │
│   └──────────┬───────────┘   └──────────────┬──────────────┘   │
└──────────────┼──────────────────────────────┼──────────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COORDINATOR AGENT                            │
│                                                                 │
│  1. Fetch PR diff + file list via MCP                          │
│  2. Chunk files by domain relevance                            │
│  3. Fan out to specialists (parallel)                          │
│  4. Collect structured JSON findings                           │
│  5. Detect conflicts (same file + overlapping line range)      │
│  6. Run resolution pass                                        │
│  7. Produce prioritized output                                 │
└──────┬──────────┬──────────────┬──────────────┬───────────────┘
       │          │              │               │
  (parallel fan-out to all four specialists)
       │          │              │               │
       ▼          ▼              ▼               ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│ Security │ │  Perf.   │ │  Design  │ │    Test      │
│ Reviewer │ │ Reviewer │ │ Reviewer │ │  Reviewer    │
│          │ │          │ │          │ │              │
│ OWASP    │ │ O(n)     │ │ SOLID    │ │ Coverage     │
│ Secrets  │ │ N+1      │ │ Coupling │ │ Edge cases   │
│ Deps     │ │ Allocs   │ │ Patterns │ │ Assertions   │
│ Trust    │ │ Async I/O│ │ Naming   │ │ Mocking      │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘
     │            │            │               │
     └────────────┴────────────┴───────────────┘
                               │
                    Structured JSON findings:
          { file, line_range, severity, category,
            finding, recommendation, confidence }
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CONFLICT RESOLUTION PASS                       │
│                                                                 │
│  Coordinator identifies overlapping findings with              │
│  contradictory recommendations and reasons explicitly          │
│  about which concern takes priority and why.                   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               SYNTHESIZED REVIEW REPORT                         │
│                                                                 │
│  Prioritized by severity · Grouped by file                     │
│  Conflicts surfaced with resolution reasoning                  │
│  Actionable, line-specific recommendations                     │
└─────────────────────────────────────────────────────────────────┘

Security boundary

Specialist agents are initialized with read-only MCP tool access — they can fetch file content but cannot write, comment, or merge. Only the coordinator holds the full tool set. This boundary is enforced at agent initialization, not as a prompt instruction.


Example Output

╔══════════════════════════════════════════════════════════════╗
║  CodeSentinel Review — langchain-ai/langchain #12847        ║
║  3 critical · 5 high · 8 medium · 4 low                    ║
╠══════════════════════════════════════════════════════════════╣
║  CRITICAL  auth/token_validator.py : 47–63                  ║
║  Agent: Security                                            ║
║  Bearer token compared with == instead of hmac.            ║
║  Action: Replace with hmac.compare_digest()                 ║
╠══════════════════════════════════════════════════════════════╣
║  HIGH  chains/sequential.py : 112–130  [conflict resolved]  ║
║                                                             ║
║  Performance flagged: O(n²) retry loop — inline the logic.  ║
║  Design flagged: method does too much — extract a class.    ║
║                                                             ║
║  Resolution: The O(n²) issue will recur in any refactor    ║
║  until the loop is corrected. Fix performance first, then  ║
║  apply the extraction refactor to the fixed implementation. ║
╚══════════════════════════════════════════════════════════════╝


Project Structure

codesentinel/
├── agents/
│   ├── coordinator.py       # Orchestration, routing, conflict resolution
│   ├── security_reviewer.py # OWASP, secrets, dependency analysis
│   ├── perf_reviewer.py     # Complexity, N+1, async patterns
│   ├── design_reviewer.py   # SOLID, coupling, naming
│   └── test_reviewer.py     # Coverage, edge cases, assertion quality
├── mcp/
│   ├── github_server.py     # MCP GitHub tool (PR diff, file list)
│   └── filesystem_server.py # MCP filesystem tool (full file reads)
├── core/
│   ├── chunker.py           # Splits diff into per-specialist chunks
│   ├── conflict.py          # Conflict detection + resolution logic
│   └── report.py            # Output formatting
├── tests/
│   ├── test_coordinator.py
│   ├── test_specialists.py
│   └── test_conflict.py
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
└── README.md


Course Concepts Demonstrated

ConceptWhereMulti-agent system (ADK)agents/coordinator.py — coordinator + 4 specialist agents with ADK orchestrationMCP Servermcp/github_server.py + mcp/filesystem_server.pyAntigravitySynthesized review report — human-quality output from structured machine findingsSecurity featuresRead-only MCP sandbox in agents/coordinator.py; input validation in core/chunker.pyDeployabilityDockerfile + docker-compose.yml + CLI interfaceAgent skillsEach specialist is an independently testable, reusable agent skill


Setup

Prerequisites


Python 3.11+
Docker (optional, for containerized run)
Anthropic API key
GitHub personal access token with repo:read scope


1. Clone the repo

bashgit clone https://github.com/your-username/codesentinel
cd codesentinel

2. Configure environment variables

bashcp .env.example .env

Edit .env:

envANTHROPIC_API_KEY=your_anthropic_api_key_here
GITHUB_TOKEN=your_github_token_here


⚠️ Never commit your .env file. It is listed in .gitignore by default.



3a. Run with Docker (recommended)

bashdocker-compose up --build
docker exec -it codesentinel python -m codesentinel review \
  --pr-url [[https://github.com/princecominon/ai-code-reviewer]

3b. Run locally

bashpip install -r requirements.txt
python -m codesentinel review --pr-url https://github.com/princecominon/ai-code-reviewer

CLI options

python -m codesentinel review [OPTIONS]

Options:
  --pr-url TEXT       GitHub PR URL to review [required]
  --output TEXT       Output format: terminal | json | markdown (default: terminal)
  --specialists TEXT  Comma-separated list of specialists to run
                      Options: security, performance, design, tests (default: all)
  --save PATH         Save report to file
  --help              Show this message and exit


How Conflict Resolution Works

When two specialists flag the same file and overlapping line range with contradictory recommendations, the coordinator runs a dedicated resolution pass:


Detection — findings are compared by (file, line_range) intersection. Overlapping findings from different specialists are grouped.
Scoring — each specialist has a domain authority weight for different file types (e.g., files touching authentication score security findings higher).
Reasoning — the coordinator generates explicit reasoning for the priority decision, which appears in the final report alongside both original findings.
Transparency — conflicts are never silently dropped. Every conflict appears in the output, labeled [conflict resolved], with both the contradictory findings and the resolution reasoning visible.



Running Tests

bashpytest tests/ -v

Tests cover coordinator routing logic, specialist structured output schema validation, conflict detection edge cases, and MCP tool mocking.


Reproducing the Demo

The video demo uses this specific PR:

https://github.com/langchain-ai/langchain/pull/12847

To reproduce:

bashpython -m codesentinel review \
  --pr-url https://github.com/langchain-ai/langchain/pull/12847 \
  --output markdown \
  --save demo_output.md

Expected runtime: ~45–90 seconds depending on PR size and API latency.


Design Decisions

Why structured JSON from specialists, not free text?
Free-text findings make conflict detection intractable — there's no reliable way to determine whether two narrative paragraphs address the same code location. Structured output with explicit file and line_range fields makes conflict detection a straightforward set intersection problem.

Why do specialists see chunks, not full diffs?
A 2,000-line diff contains irrelevant signal for any given specialist. The coordinator preprocesses the diff into per-file chunks and routes each chunk only to relevant specialists. This improves finding quality and reduces token consumption significantly.

Why parallel specialist execution?
All four specialists run concurrently via ADK's multi-agent primitives. Wall-clock time is dominated by the slowest specialist, not the sum of all four — keeping end-to-end latency practical.

Why is the security boundary enforced at initialization, not via prompt?
Prompt instructions can be overridden by adversarial input in the code being reviewed. Tool grants at initialization cannot. Specialists are instantiated with a restricted MCP tool set regardless of what appears in the PR diff.


What's Next


Write access — post the synthesized review as a real GitHub PR comment via the MCP GitHub write tool
Learning layer — track which findings engineers accept vs. change before merging; tune specialist confidence thresholds per codebase over time
Language expansion — add TypeScript-aware and SQL-aware specialists for PRs touching migrations; the coordinator requires no changes



License

MIT — see LICENSE


Built for the Kaggle 5-Day AI Agents Intensive Vibe Coding Capstone · Freestyle track
