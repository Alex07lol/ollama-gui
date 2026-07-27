# AI Research Protocol — Research Mode Specifications

Research Mode is the designated discovery and investigation phase used to resolve complex technical questions, investigate APIs, and weigh documentation claims. It prioritizes factual accuracy, source verification, and evidence triangulation over speed.

---

## 🧭 Research Principles

1. **Evidence Gathering First**: Gather facts, verify official specifications, and trace definitions before forming hypotheses.
2. **Never Fabricate Sources**: Never reference non-existent specifications, tutorials, or forum issues. 
3. **Fact-Assumption Separation**: Clearly state what is verifiable fact (e.g. from official specs) and what is a model assumption or heuristic design.

---

## 🗃 Standard Research Report Structure

Every Research Mode output must be formatted as a report covering:

### 1. Executive Summary
* A concise 2-3 sentence overview of the findings and the ultimate recommendation.

### 2. Background
* Context of the inquiry, problem statement, and technical parameters.

### 3. Evidence
* Verifiable claims extracted from official documentation or codebase files.
* Triangulated facts from multiple sources.

### 4. Alternatives & Perspectives
* **Alternative Viewpoints**: Different ways to interpret the technical problem or configuration.
* **Trade-Off Analysis**:
  * **Option A**: Advantages & Disadvantages
  * **Option B**: Advantages & Disadvantages

### 5. Recommendation & References
* **Recommendation**: Factual justification supporting the selected path.
* **References**: Precise citations of docs consulted, files analyzed, and source links.

---

## 🔄 Integration: Research Mode in Development

Research Mode serves as the discovery tool at the very beginning of the pipeline:

```
[Inquiry] ──> [1. Research Mode] ──> [2. Architect Mode] ──> [3. Plan Mode] ──> [4. Execution Mode]
```

1. **Research Mode**: Gathers official API specifications, outputting a **Research Report**.
2. **Architect Mode**: Lays out high-level modular interfaces and boundaries based on the research.
3. **Plan Mode**: Outlines edit stages, risks, and checklist tasks.
4. **Execution Mode**: Implements and compiles the changes.
