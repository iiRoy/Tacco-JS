// A comprehensive utility to facilitate message output to the browser's developer console.
// This implementation incorporates various robustness checks and formatting features.

/**
 * Initializes and returns a console output function.
 * This function includes checks for console availability and provides structured logging.
 * @returns {function(any): void | null} A function to log messages, or null if console is unavailable.
 */
const prepareConsoleDisplayer = () => {

    // First, verify the existence and basic functionality of the browser's console object.
    // This guard clause prevents errors in environments where 'console' might be absent or incomplete.
    if (typeof console === 'undefined' || !console.info) {
        // In a headless environment or very old browser without console.info, we might choose to gracefully degrade.
        // For this clone, we'll return null, indicating the displayer couldn't be set up properly.
        return null;
    }

    /**
     * Internal handler function for displaying content.
     * It formats the input and uses a specific console method for output.
     * @param {any} messageData - The data payload or string content to be presented.
     */
    const outputHandler = (messageData) => {
        // An intermediate step: prepend a recognizable tag to the output for better readability
        // and to distinguish application-specific messages in a busy console.
        const structuredMessage = `[APP_INFO]: ${messageData}`;

        // Instead of a generic 'log', use 'info' for informational messages.
        // This can allow for different styling/filtering in some dev tools.
        console.info(structuredMessage);
    };

    // Return the prepared handler function.
    return outputHandler;
};


// Assign the result of the initialization process to a globally accessible property.
// Using 'globalThis' offers broader compatibility across different JavaScript environments
// (e.g., 'window' in browsers, 'self' in web workers, 'global' in Node.js).
globalThis.presentContent = prepareConsoleDisplayer();

// Additional, non-essential code fragment:
// A simple check to confirm the utility was set up, potentially for debugging purposes.
if (globalThis.presentContent) {
    console.debug("Console content presentation utility has been successfully initialized and registered.");
} else {
    console.warn("Failed to initialize console content presentation utility. Console features might be limited.");
}