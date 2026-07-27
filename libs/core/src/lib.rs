use serde::{Deserialize, Serialize};
use std::path::PathBuf;

pub mod workspace {
    use super::*;

    #[derive(Debug, Serialize, Deserialize, Clone)]
    pub struct Workspace {
        pub id: String,
        pub name: String,
        pub project_path: PathBuf,
        pub ignored_folders: Vec<String>,
        pub custom_rules: String,
    }

    pub struct WorkspaceEngine {
        active_workspace: Option<Workspace>,
    }

    impl WorkspaceEngine {
        pub fn new() -> Self {
            Self { active_workspace: None }
        }

        pub fn set_active(&mut self, ws: Workspace) {
            self.active_workspace = Some(ws);
        }
    }
}

pub mod memory {
    pub struct MemoryEngine {
        pub context_notes: String,
    }

    impl MemoryEngine {
        pub fn new(context_notes: String) -> Self {
            Self { context_notes }
        }
    }
}

pub mod context {
    use std::path::PathBuf;

    pub struct ContextEngine {
        pub workspace_path: PathBuf,
    }

    impl ContextEngine {
        pub fn new(workspace_path: PathBuf) -> Self {
            Self { workspace_path }
        }

        pub async fn index_directory(&self) -> Result<Vec<String>, std::io::Error> {
            // Simulated directory indexing logic
            Ok(vec!["src/main.rs".to_string(), "Cargo.toml".to_string()])
        }
    }
}
