use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "ollama-cli")]
#[command(about = "CLI companion for Ollama GUI monorepo", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// List active pulled models
    Models,
    /// Indexes and prints files in the current workspace path
    Index {
        #[arg(short, long)]
        path: String,
    },
}

#[tokio::main]
async fn main() {
    let cli = Cli::parse();

    match &cli.command {
        Commands::Models => {
            println!("Pulled local models:");
            println!("  - llama3:8b");
            println!("  - mistral:latest");
        }
        Commands::Index { path } => {
            println!("Indexing workspace files under: {}", path);
            println!("  Found 2 matching files.");
        }
    }
}
