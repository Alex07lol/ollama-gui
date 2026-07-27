use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PluginMetadata {
    pub name: String,
    pub version: String,
    pub description: String,
    pub entrypoint: String,
}

#[derive(Default)]
pub struct PluginManager {
    loaded_plugins: Vec<PluginMetadata>,
}

impl PluginManager {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn load_plugin(&mut self, metadata: PluginMetadata) {
        self.loaded_plugins.push(metadata);
    }

    pub fn execute_hooks(&self, event: &str) {
        println!("Invoking plugin hooks for: {}", event);
    }
}
