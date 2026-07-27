# Ollama GUI — Premium Local AI Workspace

Ollama GUI is a production-quality open-source local AI workspace built for developers, Linux users, cybersecurity professionals, and engineers. It offers a minimal, keyboard-first desktop-style interface engineered to make local models significantly more capable through structured planning, context indexing, and secure local file execution.

---

## 🗂 Monorepo Structure

This repository is structured as a Rust-Node monorepo, cleanly dividing GUI wrappers, CLI interfaces, and core agent engines:

```
├── apps/
│   ├── desktop/          # Tauri desktop client (React frontend + Rust native bindings)
│   └── cli/              # CLI application (interacts with Ollama workspaces)
├── libs/
│   ├── core/             # Core engines (Workspace, Memory, Context engines)
│   ├── ollama-api/       # API wrapper client for Ollama
│   └── plugins/          # Plugin subsystem runtime manager
├── packages/
│   └── ui/               # Shared React design system components
├── docs/                 # Architecture designs, specifications, and API docs
├── examples/             # Code usage examples
└── tests/                # System integration test suites
```

---

## 🏗 Subsystems Architecture

### 1. Workspace Engine (`libs/core`)
Workspaces isolate developer projects. Each workspace tracks:
* Folder indexing paths and ignored folders (e.g. `node_modules`).
* Custom system directives appended to active models.
* Workspace memory containing notes, local database structures, or specific APIs.

### 2. Planning & Execution Board (`apps/desktop`)
When **Planning Mode** is selected:
1. Prompts automatically inject directives instructing the model to generate a checklist of Stages and Steps.
2. The UI parses this Markdown checklist to form an interactive task board.
3. Steps containing filesystem commands (e.g., `create: "src/index.js"` or `run: "cargo check"`) display **Approve & Run** cards.
4. Actions execute locally via the companion port `11435` or run in simulated environments if disconnected.

### 3. Multimodal Attachments Context (`apps/desktop`)
* **Files**: Text/code files are read using the browser's FileReader, wrapped inside markdown code blocks, and injected into the prompt context.
* **Images**: Visual inputs are converted into raw base64 arrays and forwarded to Ollama's vision API (e.g. `llava`).

---

## 🚀 Development Quickstart

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [Rust & Cargo](https://rustup.rs/) (v1.70+)
* [Ollama](https://ollama.com/) serving locally

### 1. Build and Run Desktop GUI (React Dev Server)
```bash
# Navigate to desktop app directory
cd apps/desktop

# Install node dependencies
npm install

# Run the client in development mode
npm run dev
```

### 2. Check Cargo Rust Workspace
```bash
# Verify Rust packages compile
cargo check --workspace --exclude ollama-desktop
```

### 3. Run the CLI Application
```bash
# Check pulled models via Cargo CLI
cargo run -p ollama-cli -- models
```

---

## 🛡 Security & Environment

Browser policies block connections to local web services by default. 

Ensure Ollama is started with CORS enabled before running the GUI:
```bash
# macOS & Linux:
OLLAMA_ORIGINS="*" ollama serve

# Windows (PowerShell):
$env:OLLAMA_ORIGINS="*"
ollama serve
```

---

## 🤝 Contributing

We welcome pull requests from the developer community! Please review [CONTRIBUTING.md](CONTRIBUTING.md) for details regarding our Git workflow, Conventional Commit message requirements, coding standards, and testing policies.
