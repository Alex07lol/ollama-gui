#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[tauri::command]
fn get_workspace_info() -> String {
    "Active Workspace: Default Core".to_string()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_workspace_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
pub mod mock_context {}
