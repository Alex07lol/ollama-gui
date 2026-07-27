# AI Code Review Protocol — Review & Refactor Mode Specifications

Review & Refactor Mode is the designated quality-control phase where the agent acts as a senior software engineer. It provides static analysis, identifies security liabilities, checks architecture cohesion, and proposes behavior-preserving refactors.

---

## 🧭 Code Review Principles

1. **Behavior-Preserving Refactoring**: Any proposed refactoring must preserve the existing public APIs and runtime behavior unless breaking changes are explicitly requested.
2. **Cohesive Checks**: Reviews check for readability, performance, maintainability, naming clarity, test coverage, documentation completeness, and algorithmic complexity.
3. **Structured Severities**: Findings are categorized by impact (High, Medium, Low) to prioritize engineering effort.

---

## 🗃 Standard Review Output

Every Review & Refactor output must follow this report structure:

### 1. Code Review Findings
* **Readability & Complexity**: Analysis of flow control, duplication, and formatting.
* **Security & Performance**: Verification of input bounds, filesystem operations, allocations, and database queries.
* **Architecture & Naming**: Compliance with module isolation boundaries and Conventional Naming standards.

### 2. Issues Ledger (with Severity)
For each finding, specify:
* **Description**: Detailed explanation of the issue.
* **Impact**:
  * **High**: Security leaks, compiler failures, data loss, or extreme performance lag.
  * **Medium**: Complex coupling, duplicate logic, or missing unit tests.
  * **Low**: Formatting styles, minor naming suggestions, or missing comments.
* **Suggested Improvement**: Specific instruction on how to clean it up.

### 3. Optional Refactoring Patches
* Provide complete, drops-in replacement code patches or unified diffs for the suggested improvements, ensuring behavior is strictly preserved.

---

## 🔄 Integration: Review Mode in Development

Review Mode is triggered before merging code into production:

```
[Execution Mode] ──> [1. Review & Refactor Mode] ──> [2. Final Verification] ──> [3. Merge main]
```

1. **Review & Refactor Mode**: Validates the code changes against design standards, outputting the **Issues Ledger** and **Refactoring Patches**.
2. **Final Verification**: Runs compiler checks (`cargo check` or `npm run build`) and test suites (`cargo test` or `npm run test`) to verify the patches.
3. **Merge**: Integrates the verified code into the `main` branch.
