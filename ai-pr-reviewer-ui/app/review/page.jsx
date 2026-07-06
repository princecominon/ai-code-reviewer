"use client";


import { useSearchParams } from "next/navigation";

import { motion } from "framer-motion";

import {

  ShieldAlert,

  Zap,

  PenTool,

  TestTube2,

  AlertTriangle,

  Lightbulb,

  ArrowLeft,

} from "lucide-react";

import Link from "next/link";

import { Suspense } from "react";


// Raw SVG for GitHub (lucide-react dropped brand icons in newer versions)

const GithubIcon = ({ className }) => (

  <svg

    xmlns="http://www.w3.org/2000/svg"

    width="24"

    height="24"

    viewBox="0 0 24 24"

    fill="none"

    stroke="currentColor"

    strokeWidth="2"

    strokeLinecap="round"

    strokeLinejoin="round"

    className={className}

  >

    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />

    <path d="M9 18c-4.51 2-5-2-7-2" />

  </svg>

);


// 1. We structure your raw output into a clean JSON array

const REVIEW_DATA = {

  repository: "https://github.com/princecominon/ai-reviewer-test/pull/1",

  totalIssues: 11,

  findings: [

    {

      id: 1,

      category: "SECURITY",

      file: "calculator.js",

      lines: "2",

      severity: "Critical",

      finding:

        "Hardcoded AWS Secret Key: The `AWS_SECRET_KEY` is hardcoded directly in the source code. Hardcoding sensitive credentials poses a severe security risk as it can lead to unauthorized access if the code is exposed (e.g., in a public repository or deployed artifact).",

      fix: "Remove hardcoded credentials. Implement a secure secrets management solution, such as using environment variables, AWS Secrets Manager, or other secure configuration mechanisms. Ensure secrets are loaded dynamically and never committed to version control.",

    },

    {

      id: 2,

      category: "SECURITY",

      file: "calculator.js",

      lines: "5-11",

      severity: "Medium",

      finding:

        "Potential Denial of Service (DoS) via Inefficient Algorithm: The `calculateThings` function uses a nested loop resulting in O(n^2) time complexity. If the `data` input array is large and can be controlled by an attacker, this quadratic complexity could lead to excessive resource consumption (CPU time), potentially causing a denial of service for the application.",

      fix: "Optimize the `calculateThings` function for better performance. For tasks involving finding duplicates or common elements, consider using more efficient data structures like `Set` or sorting the array first, which can reduce the complexity to O(n) or O(n log n).",

    },

    {

      id: 3,

      category: "PERFORMANCE",

      file: "calculator.js",

      lines: "5-13",

      severity: "High",

      finding: "O(n^2) Time Complexity and Excessive Memory Allocation.",

      fix: "The nested loop iterates N*N times, leading to quadratic time complexity. The `result` array can grow very large... If the intent is to filter unique elements, consider using a `Set` or `Array.prototype.filter`. If the intent is to simply copy the array, use `[...data]` or `data.slice()`.",

    },

    {

      id: 4,

      category: "PERFORMANCE",

      file: "calculator.js",

      lines: "16-16",

      severity: "Low",

      finding:

        "Dead code: Null check for an always-initialized array.",

      fix: "The `result` array is initialized as `[]` and will never be `null` or `undefined`. The `if(x == null)` condition will always evaluate to `false`. This line of code is unreachable and can be removed.",

    },

    {

      id: 5,

      category: "DESIGN",

      file: "calculator.js",

      lines: "15",

      severity: "Low",

      finding: "The `var` keyword is used for variable declaration.",

      fix: "Prefer `const` or `let` over `var` for variable declarations. `const` should be used for variables whose values do not change after initialization, and `let` for variables that may be reassigned.",

    },

    {

      id: 6,

      category: "DESIGN",

      file: "calculator.js",

      lines: "15",

      severity: "Low",

      finding:

        "The variable `x` is poorly named and does not convey its purpose within the `calculateThings` function.",

      fix: "Use descriptive variable names that reflect the variable's content or purpose. For example, `processedResult`, `filteredData`, or `finalOutput` would be more informative than `x`.",

    },

    {

      id: 7,

      category: "DESIGN",

      file: "calculator.js",

      lines: "16",

      severity: "Low",

      finding:

        "There is inconsistent whitespace in the conditional statement `if(x == null)`.",

      fix: "Maintain consistent whitespace around keywords and operators for improved readability. It's standard practice to include a space after `if` (e.g., `if (x == null)`).",

    },

    {

      id: 8,

      category: "TESTING",

      file: "calculator.js",

      lines: "1-21",

      severity: "Critical",

      finding:

        "The new `calculator.js` file introduces business logic without any corresponding test file or test suite. The `calculateThings` function is not exported, which significantly hinders its independent testability.",

      fix: "Create a dedicated test file (e.g., `calculator.test.js`) using a suitable testing framework. Implement comprehensive unit tests... Ensure the function is properly exported.",

    },

    {

      id: 9,

      category: "TESTING",

      file: "calculator.js",

      lines: "2",

      severity: "Critical",

      finding:

        "A sensitive `AWS_SECRET_KEY` is hardcoded directly within the `calculator.js` file, posing a significant security risk if the code is ever compromised or publicly exposed.",

      fix: "Remove hardcoded secrets from the codebase. Implement a secure mechanism for managing and accessing sensitive credentials, such as environment variables.",

    },

    {

      id: 10,

      category: "TESTING",

      file: "calculator.js",

      lines: "5-12",

      severity: "Medium",

      finding:

        "The `calculateThings` function uses a nested loop (`for (let i...) { for (let j...) }`) which results in an O(n^2) time complexity. This can lead to significant performance degradation.",

      fix: "Refactor the `calculateThings` function to improve its algorithmic efficiency. Consider using more optimized data structures or algorithms, such as hash maps/sets.",

    },

    {

      id: 11,

      category: "TESTING",

      file: "calculator.js",

      lines: "15-16",

      severity: "Low",

      finding:

        "The variable `x` is an unnecessary alias for `result`, adding redundancy. Additionally, the check `if(x == null)` will never be true because `result` is initialized as an empty array.",

      fix: "Remove the superfluous `x` variable. The function can directly `return result;`. Eliminate the `if(x == null)` check as it's unreachable.",

    },

  ],

};


// Helpers for Icons and Colors

const getCategoryDetails = (category) => {

  switch (category) {

    case "SECURITY":

      return {

        icon: <ShieldAlert className="w-5 h-5" />,

        color: "text-red-400",

        border: "border-red-500/30",

        bg: "bg-red-500/10",

      };

    case "PERFORMANCE":

      return {

        icon: <Zap className="w-5 h-5" />,

        color: "text-yellow-400",

        border: "border-yellow-500/30",

        bg: "bg-yellow-500/10",

      };

    case "DESIGN":

      return {

        icon: <PenTool className="w-5 h-5" />,

        color: "text-blue-400",

        border: "border-blue-500/30",

        bg: "bg-blue-500/10",

      };

    case "TESTING":

      return {

        icon: <TestTube2 className="w-5 h-5" />,

        color: "text-green-400",

        border: "border-green-500/30",

        bg: "bg-green-500/10",

      };

    default:

      return {

        icon: <AlertTriangle className="w-5 h-5" />,

        color: "text-gray-400",

        border: "border-gray-500/30",

        bg: "bg-gray-500/10",

      };

  }

};


const getSeverityStyles = (severity) => {

  switch (severity.toLowerCase()) {

    case "critical":

      return "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.4)]";

    case "high":

      return "bg-orange-500/20 text-orange-400 border-orange-500/50";

    case "medium":

      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";

    case "low":

      return "bg-gray-500/20 text-gray-300 border-gray-500/50";

    default:

      return "bg-gray-500/20 text-gray-400 border-gray-500/50";

  }

};


function ResultsContent() {

  const searchParams = useSearchParams();

  const targetUrl = searchParams.get("pr") || REVIEW_DATA.repository;


  return (

    <div className="min-h-screen bg-[#030712] text-slate-50 selection:bg-cyan-500/30 font-sans p-6 md:p-12">

      {/* Background Glow */}

      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />


      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header Navigation */}

        <Link

          href="/"

          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium"

        >

          <ArrowLeft className="w-4 h-4" /> Back to Analyzer

        </Link>


        {/* Dashboard Header */}

        <header className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">

          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">

            Agent Review Results

          </h1>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">

            <div className="flex items-center gap-3 text-gray-300">

              <GithubIcon className="w-6 h-6 text-gray-400" />

              <a

                href={targetUrl}

                target="_blank"

                rel="noreferrer"

                className="text-cyan-400 hover:underline truncate max-w-[300px] md:max-w-md"

              >

                {targetUrl}

              </a>

            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 font-bold">

              <AlertTriangle className="w-5 h-5" />

              {REVIEW_DATA.totalIssues} Issues Found

            </div>

          </div>

        </header>


        {/* Findings List */}

        <div className="space-y-6">

          {REVIEW_DATA.findings.map((item, index) => {

            const catStyles = getCategoryDetails(item.category);

            const sevStyles = getSeverityStyles(item.severity);


            return (

              <motion.div

                key={item.id}

                initial={{ opacity: 0, y: 20 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ delay: index * 0.05 }}

                className={`bg-[#0f111a] border ${catStyles.border} rounded-2xl p-6 shadow-lg relative overflow-hidden group hover:border-white/30 transition-colors`}

              >

                {/* Top Category Gradient Line */}

                <div className={`absolute top-0 inset-x-0 h-1 ${catStyles.bg}`} />


                <div className="flex flex-col md:flex-row gap-6">

                  {/* Left Column: Metadata */}

                  <div className="w-full md:w-48 flex flex-col gap-3 flex-shrink-0">

                    <div

                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${catStyles.border} ${catStyles.bg} ${catStyles.color} text-xs font-bold uppercase tracking-wider w-max`}

                    >

                      {catStyles.icon}

                      {item.category}

                    </div>

                    <div

                      className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider w-max ${sevStyles}`}

                    >

                      {item.severity}

                    </div>

                    <div className="mt-2 text-sm text-gray-400 font-mono">

                      <span className="block text-gray-500 text-xs">File:</span>

                      {item.file}

                    </div>

                    <div className="text-sm text-gray-400 font-mono">

                      <span className="block text-gray-500 text-xs">Lines:</span>

                      {item.lines}

                    </div>

                  </div>


                  {/* Right Column: Finding & Fix */}

                  <div className="flex-1 space-y-4">

                    <div>

                      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">

                        Finding

                      </h3>

                      <p className="text-gray-300 leading-relaxed text-sm md:text-base">

                        {item.finding}

                      </p>

                    </div>


                    <div className="bg-cyan-950/30 border border-cyan-900/50 rounded-xl p-4 mt-4">

                      <h3 className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">

                        <Lightbulb className="w-4 h-4" /> Suggested Fix

                      </h3>

                      <p className="text-cyan-100/70 text-sm leading-relaxed">

                        {item.fix}

                      </p>

                    </div>

                  </div>

                </div>

              </motion.div>

            );

          })}

        </div>

      </div>

    </div>

  );

}


// useSearchParams() forces a Suspense boundary in the App Router

export default function ResultsPage() {

  return (

    <Suspense

      fallback={

        <div className="min-h-screen bg-[#030712] flex items-center justify-center text-cyan-400">

          Loading review…

        </div>

      }

    >

      <ResultsContent />

    </Suspense>

  );

}
