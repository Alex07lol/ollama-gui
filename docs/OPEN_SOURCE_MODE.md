# AI Open Source Search Protocol — Open Source Mode Specifications

Open Source Mode is the designated search and discovery phase used to enhance coding suggestions by indexing local file assets, referenced repositories, and API documentation. It prioritizes evidence transparency and license compliance.

---

## 🧭 Search & Discovery Principles

1. **Transparency of Evidence**: The agent must display exact lists of the files analyzed, repositories searched, and external documentation references consulted.
2. **Never Fabricate Repository Contents**: If a file does not exist or a search returns empty, state it clearly. Never invent file paths, folder layouts, or code definitions.
3. **Strict Separation of Context**: Clearly distinguish between:
   * **Repository Evidence**: Verifiable code snippets, constants, or types found in the workspace files.
   * **Model Reasoning**: Analytical suggestions, architecture trade-offs, and design justifications.
   * **User Instructions**: The explicit requests and conditions specified by the user.

---

## 🗃 Standard Open Source Output

When requested to analyze or search reference codebase patterns, the output must follow this template:

### 1. Transparency Ledger
* **Repositories Searched**: List of paths or repository targets.
* **Files Analyzed**: Clickable markdown links to local files.
* **Documentation Consulted**: API references, markdown guides, or local manuals read.
* **Examples Selected**: Code snippets used as design patterns.

### 2. Analysis & Recommendations
* **Summary**: High-level explanation of the code search findings.
* **Relevant Projects**: Reference implementations found in the workspace or indexed repositories.
* **Why They Are Relevant**: Architectural connection to the active task.
* **Architectural Patterns**: Common design paradigms extracted (e.g., singleton patterns, trait implementations).
* **Potential Improvements**: Fixes or extensions to the discovered patterns.
* **Recommended Implementation**: Design suggestion matching the workspace environment.

---

## 🔄 Integration: Open Source Mode in Development

Open Source Mode serves as the discovery tool during the system design phases:

```
[User Query] ──> [1. Open Source Mode] ──> [2. Architect Mode] ──> [3. Plan Mode] ──> [4. Execution Mode]
```

1. **Open Source Mode**: Locates existing codebase implementations and API targets, outputting a **Transparency Ledger**.
2. **Architect Mode**: Engineers high-level module layouts and interfaces.
3. **Plan Mode**: Outlines edit stages and test strategies.
4. **Execution Mode**: Implements and compiles modifications.
