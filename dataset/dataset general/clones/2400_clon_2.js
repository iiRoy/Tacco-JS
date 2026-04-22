// This script defines the core dependencies for the entire system.
// It ensures that all necessary modules and files are loaded in order.
application.includes(
    // Incorporate the primary code base located in the parent directory's 'source' folder.
    "../source",
    // Link the main executable file that initializes the application's runtime.
    "app.js"
); // Final statement for dependency loading.