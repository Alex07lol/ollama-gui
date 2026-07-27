# AI Debugging Protocol — Debug Mode Specifications

Debug Mode is the designated diagnostics and troubleshooting phase used to trace, identify, and resolve software bugs, compiler errors, memory leaks, performance regressions, or application crashes.

---

## 🧭 Debugging Principles

1. **Evidence-Based Diagnostics**: Diagnose bugs using tangible evidence (e.g. stack traces, console outputs, compiler errors, log lines). 
2. **Isolate Failures**: Identify the exact file path and line numbers where the failure occurs before proposing changes.
3. **Trace Root Cause**: Fully explain *why* the failure occurs under current runtime states.

---

## 🗃 Standard Debug Output

Every Debug Mode diagnostic response must cover:

### 1. Diagnostic Summary
* **Root Cause**: Concise, technical explanation of the failure mechanism.
* **Confidence Level**:
  * **High**: Verified by exact compiler error line matching, stack trace traces, or code logic contradiction.
  * **Medium**: Deduced from log timings or environment parameters.
  * **Low**: Plausible guess based on symptom descriptions.

### 2. Supporting Evidence
* Citation of logs, stack trace entries, compiler warnings, or codebase lines that prove the root cause.

### 3. Recommended Solution
* Detailed, step-by-step fix to address the root cause and prevent future regressions.
* Include code patches or configurations as needed.

### 4. Alternative Solutions
* Alternative or temporary workarounds (e.g., configurations, script triggers, environmental overrides) with their pros and cons.

---

## 🔄 Integration: Debug Mode in Development

Debug Mode is triggered when tests fail or runtime exceptions occur:

```
[Runtime Error / Test Fail] ──> [1. Debug Mode] ──> [2. Plan Mode] ──> [3. Execution Mode]
```

1. **Debug Mode**: Analyzes crash assets and outputs the **Diagnostic Summary** and recommended fix.
2. **Plan Mode**: Formulates the checklist blueprint to implement the fix.
3. **Execution Mode**: Implements and compiles the fix, verifying that the issue is resolved.
