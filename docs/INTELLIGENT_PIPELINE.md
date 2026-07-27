# Intelligent Mode Selection — Dynamic Capability Pipeline

Ollama GUI integrates an **Intelligent Mode Selection** system that automatically analyzes user prompts, gathers required contexts, indexes workspaces, maps dependencies, and generates a dynamic pipeline of specialists (Capabilities) to address the task.

---

## 🧭 System Philosophy

Users describe high-level goals. The AI handles the construction, execution, and validation of the engineering workflow. Rather than a set of disconnected tools, the agent operates as a cohesive engineering team.

```
[User Request]
       │
       ▼
[Task Analysis] ──> Determines ──> [Duration, Complexity, Context Requirements]
       │
       ▼
[Capability Pipeline] ──> Selects ──> [✓ Research, ✓ Workspace, ✓ Build, ✓ Review]
       │
       ▼
[Live Execution] ──> Displays ──> [✓ Indexed, • Implementing, Pending: Review]
```

---

## 🛠 Available Capabilities

Capabilities are modular, independent subsystems that can be dynamically chain-linked:

| Capability | Scope & Action |
| :--- | :--- |
| **`Chat`** | Default text conversational feedback. |
| **`Workspace`** | Resolves local directory paths, checks git branches, indexes files. |
| **`Research`** | cross-references official documentation and API references. |
| **`Open Source`** | Gathers and triages design patterns from indexed repositories. |
| **`Architecture`** | Lays out module boundaries, interfaces, and data flows. |
| **`Planning`** | Parses task items into checkbox checklist sequences. |
| **`Building`** | Writes code files and scripts (Execution Mode). |
| **`Terminal`** | Runs compiler commands, builders, and checkers. |
| **`Review`** | Senior-engineer audit checking readability and complexity. |
| **`Security`** | Scans code variables for secrets, bounds, and vulnerabilities. |
| **`Debugging`** | Isolates errors, analyzes crash logs, recommends fixes. |
| **`Documentation`**| Writes guides, specs, and references. |

---

## 🗃 Task Analysis Schema

Every user request begins with a structural analysis of the goal:
1. **Complexity Assessment**: Low, Medium, or High.
2. **Context Requirements**: Files, local directories, or libraries to index.
3. **Capability Recommendation**: Selection of relevant capabilities.
4. **Execution Pipeline**: A chronological sequence of selected capabilities.

### Text-Based Pipeline Blueprint
```json
{
  "reason": "Creating a CLI subcommand requires workspace validation, design definitions, and build tests.",
  "estimatedDuration": "Medium",
  "pipeline": ["workspace", "architecture", "planning", "build", "review", "terminal"]
}
```

---

## 🎛 User Control: Manual Overrides & Presets

While pipeline construction is automatic, users retain absolute control over the workflow.

### 1. Capability Presets
Presets allow developers to pin workflows for specific use cases:
* **Developer**: `[Workspace, Planning, Building, Review, Terminal]`
* **Researcher**: `[Research, Open Source, Documentation]`
* **Cybersecurity**: `[Research, Security, Debugging, Terminal]`
* **Rust**: `[Workspace, Building, Review, Terminal (Cargo check)]`
* **Minimal**: `[Chat]`

### 2. Manual Controls
* **Toggle Capabilities**: Explicitly enable or disable specific capabilities for a chat.
* **Pin Capabilities**: Forces a capability to run on every request (e.g. *Always Security Scan*).
* **Disable Capabilities**: Blacklists a capability from the pipeline.
* **Reorder Pipeline**: Drag-and-drop or checklist sequence adjustments.

---

## 🛡 Fault Tolerance & Fallback Logic

Capabilities execute independently. If a single capability fails or lacks system permissions (e.g. terminal access denied):
1. **Log Fallback**: Explain the failure in the execution terminal.
2. **Graceful Skip**: Mark the capability as `skipped`.
3. **Pipeline Continuity**: Continue execution using the remaining capabilities (e.g. proceed to build and review even if local terminal fails).
4. **Zero Fabrication**: Never invent code results or simulation logs.
