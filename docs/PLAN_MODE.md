# AI Planning Protocol — Plan Mode Specifications

Plan Mode is the mandatory architectural design and verification workflow required before executing any complex feature implementations or refactors. The goal of this protocol is to align expectations, reduce code defects, identify edge cases early, and enforce a human-in-the-loop approval gate.

---

## 📋 Plan Mode Objectives

1. **Understand the Goal**: Formulate a clear, unambiguous problem statement.
2. **Deconstruct the Work**: Break down complex programming goals into independent stages.
3. **Identify Risks**: Predict conflicts, performance overheads, or safety liabilities.
4. **Predict Affected Files**: List exactly which parts of the workspace are edited.
5. **Formulate Alternatives**: Compare multiple engineering approaches.
6. **Enforce Approval Gate**: Wait for human approval before performing filesystem or execution edits.

---

## 🗃 Standard Plan Structure

Every Plan document must be structured using the following fields:

### 1. High-Level Summary
* **Objective**: A single sentence stating the project goal.
* **Requirements**: A bulleted checklist of must-have outcomes.
* **Current Understanding**: Summary of the codebase state relative to this task.
* **Missing Information / Assumptions**: List of clarifications needed or assumptions made.

### 2. Architecture & Design Options
* **Possible Approaches**: At least two different ways to build the feature.
* **Trade-Off Analysis**:
  * **Approach A**: Advantages & Disadvantages
  * **Approach B**: Advantages & Disadvantages
* **Recommended Approach**: Technical justification for selecting the recommended path.

### 3. Implementation Blueprint
* **Implementation Stages**: Step-by-step breakdown of actions.
* **Estimated Complexity**: Low, Medium, or High (with reasoning).
* **Potential Risks**: Breakages, network latencies, or state inconsistencies.
* **Affected Files**: Clickable list of target files.
* **Dependencies**: External library additions or configuration overrides.

### 4. Verification Plan
* **Testing Strategy**: Unit tests, integration tests, and UI verification scripts.
* **Expected Result**: Description of the final working behavior.

---

## 🔄 Lifecycle: Plan to Execution

The development process flows through three phases:

```
[User Request] ──> [1. Plan Mode] ──> [2. User Review & Approval] ──> [3. Execution Mode]
```

### Phase 1: Plan Mode (Prep Only)
* The agent displays progress markers (e.g. `Reading workspace...`, `Estimating complexity...`).
* The agent conducts research using read-only tools.
* **Constraint**: The agent must NOT create or edit files, and must NOT execute build commands.

### Phase 2: Approval Gate
* The agent outputs the complete **Standard Plan**.
* The agent prompts the user: *"Please review this plan. Hitting 'Proceed' or approving starts execution."*

### Phase 3: Execution Mode (Implementation)
* Starts only after explicit approval.
* The agent reads, creates, and writes files, compiles types, and runs tests to deliver the code.
