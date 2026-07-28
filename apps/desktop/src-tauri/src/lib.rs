#[cfg(target_os = "windows")]
use std::fs::File;
#[cfg(target_os = "windows")]
use std::io::Write;
use std::process::Command;

#[tauri::command]
fn get_workspace_info() -> String {
    "Active Workspace: Default Core".to_string()
}

#[tauri::command]
async fn install_ollama() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let url = "https://ollama.com/download/OllamaSetup.exe";
        let temp_dir = std::env::temp_dir();
        let installer_path = temp_dir.join("OllamaSetup.exe");

        let response = reqwest::get(url).await.map_err(|e| e.to_string())?;
        let bytes = response.bytes().await.map_err(|e| e.to_string())?;

        let mut file = File::create(&installer_path).map_err(|e| e.to_string())?;
        file.write_all(&bytes).map_err(|e| e.to_string())?;

        Command::new(&installer_path)
            .spawn()
            .map_err(|e| format!("Failed to start Ollama installer: {}", e))?;

        Ok("Ollama installer downloaded and launched successfully.".into())
    }

    #[cfg(target_os = "linux")]
    {
        let child = Command::new("pkexec")
            .args(["sh", "-c", "curl -fsSL https://ollama.com/install.sh | sh"])
            .spawn();

        match child {
            Ok(_) => Ok("Ollama installation started via pkexec.".into()),
            Err(_) => {
                Command::new("xdg-open")
                    .arg("https://ollama.com/download")
                    .spawn()
                    .map_err(|e| e.to_string())?;
                Ok("pkexec not available, opened Ollama download page in browser.".into())
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg("https://ollama.com/download")
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok("Opened Ollama download page in browser.".into())
    }

    #[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
    {
        Err("Unsupported OS for auto-installation.".into())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_workspace_info, install_ollama])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
pub mod mock_context {}
