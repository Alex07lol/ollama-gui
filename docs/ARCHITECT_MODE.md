# AI System Design Protocol — Architect Mode Specifications

Architect Mode is the designated design phase used to engineer high-level subsystems, module relationships, and API boundaries before any code planning or code execution starts. The objective is to produce durable, modular architectures suitable for long-term open-source maintenance.

---

## 🧭 Architect Mode Principles

1. **Design First**: Focus entirely on structural, data flow, and API design.
2. **Strict Code Separation**: Never generate implementation code blocks (e.g. function bodies, JSX, Rust implementations) unless the user explicitly requests code.
3. **Minimize Coupling & Maximize Cohesion**: Design modules that do one thing well and communicate through narrow, stable interfaces.

---

## 🗃 Standard Architect Output

Every architectural design document must cover the following sections:

### 1. Structure & Boundaries
* **Folder Structure**: Specific directory targets and file roles.
* **Responsibilities**: List of what each component is responsible for (and what it is NOT responsible for).
* **Module Relationships**: High-level block layouts showing imports and dependency scopes.

### 2. Interfaces & API Definitions
* **Data Flow**: Step-by-step trace of how data is passed and updated across components.
* **Public APIs**: Prototypes, types, properties, or REST endpoint shapes.
* **Interfaces & Structs**: Property declarations and method signatures (types only).

### 3. Scaling & Trade-Off Analyses
* **Alternative Designs**: Compare at least two separate architectural approaches (e.g., polling vs WebSockets).
* **Scaling Profiles**: Analyze memory footprint, latency, CPU utilization, and state synchronization limits.
* **Engineering Trade-offs**: Speed vs safety, abstraction overheads, and dependency count.

---

## 🔄 Integration: Architect -> Plan -> Execute

Development cycles progress through three sequential modes:

```
[User Request] ──> [1. Architect Mode] ──> [2. Plan Mode] ──> [3. Execution Mode]
```

1. **Architect Mode**: Produces high-level APIs, data flows, and structures (No code).
2. **Plan Mode**: Produces the step-by-step checklist of edits, risks, and verification steps (No code edits).
3. **Execution Mode**: Implements the code changes, runs compiler checks, and executes verification tests (Code written).
