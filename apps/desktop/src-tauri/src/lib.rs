#[tauri::command]
fn get_workspace_info() -> String {
    "Active Workspace: Default Core".to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_workspace_info])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
pub mod mock_context {}
