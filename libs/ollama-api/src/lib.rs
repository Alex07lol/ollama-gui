use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
    pub images: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatRequest {
    pub model: String,
    pub messages: Vec<ChatMessage>,
    pub stream: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatResponse {
    pub model: String,
    pub message: ChatMessage,
    pub done: bool,
}

pub struct OllamaClient {
    host: String,
}

impl OllamaClient {
    pub fn new(host: String) -> Self {
        Self { host }
    }

    pub fn host(&self) -> &str {
        &self.host
    }

    pub async fn list_models(&self) -> Result<Vec<String>, Box<dyn std::error::Error>> {
        // Implementation details hidden - returns list of local models
        Ok(vec!["llama3:8b".to_string(), "mistral".to_string()])
    }
}
