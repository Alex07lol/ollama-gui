# Contributing to Ollama GUI

Thank you for contributing! This document contains the guidelines and standards for developers working on the Ollama GUI monorepo.

---

## 🗂 Git Workflow

We enforce a strict branching and code-review pipeline. Direct commits to the `main` branch are forbidden.

### Development Steps:
1. **GitHub Issue**: Every feature or bug fix must start with an open GitHub Issue describing the problem, acceptance criteria, and complexity.
2. **Feature Branch**: Create a branch off `main` using the naming convention:
   * For features: `feat/issue-[number]-[short-description]` (e.g. `feat/issue-42-workspace- switcher`)
   * For bugs: `fix/issue-[number]-[short-description]` (e.g. `fix/issue-89-cors-headers`)
3. **Pull Request**: Open a PR back to `main`. Fully complete the [PR Template](.github/PULL_REQUEST_TEMPLATE.md).
4. **Code Review**: At least one reviewer must approve the changes before merge.
5. **Continuous Integration**: The PR must pass all CI pipelines (formatting, lints, builds) before it can be merged.

---

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Each commit should solve one logical problem.

### Commit Types:
* **`feat:`** A new feature (e.g. `feat: add markdown visualizer`)
* **`fix:`** A bug fix (e.g. `fix: correct base64 padding in vision payload`)
* **`docs:`** Documentation changes only (e.g. `docs: update CORS guides`)
* **`refactor:`** Code changes that neither fix a bug nor add a feature (e.g. `refactor: extract workspace configs`)
* **`perf:`** A code change that improves performance (e.g. `perf: minimize file indexing lookups`)
* **`style:`** Changes that do not affect the meaning of the code (e.g. formatting spacing)
* **`test:`** Adding missing tests or correcting existing tests
* **`build:`** Changes that affect the build system or external dependencies
* **`ci:`** Changes to CI configuration files and scripts
* **`chore:`** General maintainer tasks (e.g. bump versions)

---

## 🛠 Coding Standards & Quality

Write clean, production-ready code. Readability is favored over cleverness.

* **No Placeholders**: Never commit `TODO` comments, placeholder functions, or empty catch blocks.
* **Dead Code**: Remove unused imports, variables, functions, and commented-out code before opening a PR.
* **Safety & Security**:
  * Never hardcode keys or local paths.
  * Sanitize filesystem parameters to prevent path-traversal attacks.
  * Use least-privilege principles for execution commands.

---

## 🧪 Testing Policy

Every new feature or bug fix must include appropriate tests:
* **Rust Backend**: Place unit tests in the same file as implementation (standard Rust style) and integration tests in the `/tests` folder. Run checks using `cargo test`.
* **Frontend**: Unit tests for React components are handled in `.test.ts/tsx` files alongside the component. Run checks using `npm run test`.

---

## 🚀 Continuous Integration (CI)

Our automated GitHub Actions pipeline will:
1. Validate Rust formatting via `cargo fmt --all -- --check`.
2. Check Rust lints via `cargo clippy --workspace --all-targets --all-features -- -D warnings`.
3. Run all tests via `cargo test --workspace --all-features`.
4. Validate frontend linting and build builds via `npm run build` inside `apps/desktop`.
