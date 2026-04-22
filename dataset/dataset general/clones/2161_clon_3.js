// This module orchestrates the initial setup and display of the application's
// primary user interface component. It ensures the necessary Titanium API
// elements are present before proceeding with the window creation and presentation.

// Define a namespace or alias for the core Titanium framework to reduce verbosity
// and enhance readability within this specific context.
const CoreFramework = Ti;

// Guard clause: Verify the existence of the Titanium framework and its UI module.
// Without these, the application cannot render its main interface.
if (!CoreFramework || !CoreFramework.UI) {
    // Log a critical error and potentially halt execution or provide a fallback.
    // In a real application, this might lead to an immediate exit or an error screen.
    console.error("CRITICAL ERROR: Titanium Core or UI module not found. Cannot initialize GUI.");
    // Depending on context, one might throw an error or return here.
    // throw new Error("Missing Titanium UI components.");
} else {
    // Optional: Log successful environment detection.
    console.log("Titanium UI environment detected. Proceeding with application frame setup.");
}

// Alias the UI module for cleaner access to UI-related functions.
const UserInterfaceManager = CoreFramework.UI;

// Define a structured configuration object for the main application window.
// This centralizes all parameters required for its creation.
const MainApplicationWindowConfig = {
    // The URL specifies the JavaScript file that will control the content
    // and behavior of this window. This path is relative to the Resources directory.
    contentResourcePath: "controllers/main.js",

    // An internal identifier for logging or debugging purposes.
    internalName: "PrimaryDisplaySurface",

    // Additional properties could be added here, e.g., backgroundColor, title, etc.
    // For this example, we keep it minimal to match the original's core function.
    // backgroundColor: '#f0f0f0',
    // title: 'Application Gateway'
};

/**
 * Function to instantiate and present the primary application window.
 * This encapsulates the creation and opening logic.
 * @param {object} config - Configuration object for the window.
 * @returns {object|null} The created window object, or null if creation failed.
 */
function initializeAndShowApplicationPortal(config) {
    // Validate essential configuration properties.
    if (!config || !config.contentResourcePath) {
        console.error("Configuration for application portal is invalid or missing 'contentResourcePath'.");
        return null;
    }

    // Create the window instance using the Titanium UI factory method.
    // We map our custom config property 'contentResourcePath' to the expected 'url' property.
    const windowCreationParameters = {
        url: config.contentResourcePath
    };
    // If we had other properties in config, we'd map them here too.
    // if (config.backgroundColor) windowCreationParameters.backgroundColor = config.backgroundColor;
    // if (config.title) windowCreationParameters.title = config.title;

    const currentWindowInstance = UserInterfaceManager.createWindow(windowCreationParameters);

    // Perform a sanity check on the newly created instance.
    if (currentWindowInstance && typeof currentWindowInstance.open === 'function') {
        // Log the action before performing it.
        console.info(`Attempting to open the application's main frame: ${config.internalName}`);

        // Open the window to make it visible to the user.
        currentWindowInstance.open();

        // Confirm successful opening.
        console.log(`Main application frame '${config.internalName}' is now visible.`);
        return currentWindowInstance;
    } else {
        console.error(`Failed to create or open the application portal: ${config.internalName}. Window object is invalid.`);
        return null;
    }
}

// Execute the function to set up and display the main application window.
// We store the reference to the main window, although it's not strictly used later in this snippet.
const applicationRootWindow = initializeAndShowApplicationPortal(MainApplicationWindowConfig);

// A final check or post-initialization step.
if (applicationRootWindow) {
    console.log("Application initialization sequence completed successfully.");
    // Potentially attach event listeners or perform other setup actions here.
    // applicationRootWindow.addEventListener('close', () => console.log('Main window closed.'));
} else {
    console.error("Application failed to start: Root window could not be initialized.");
}

// This variable serves as an example of an added, non-critical fragment
// that might be used for tracking or diagnostics in a larger system.
const startupCompletionTimestamp = new Date().toISOString();
// console.log(`System startup timestamp: ${startupCompletionTimestamp}`);