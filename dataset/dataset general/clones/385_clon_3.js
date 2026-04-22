const envTools = require('system');

//---------------------------------------------------------
// Interactive Terminal Facilitator Module
// Manages input and output operations for a command-line interface.
//---------------------------------------------------------

/**
 * @class TerminalFacilitator
 * @description Provides core functionalities for console interaction.
 * @property {boolean} _channelActive - Internal flag to check initialization status.
 */
function TerminalFacilitator() {
    // Constructor for the interactive terminal handler.
    // Initializes the internal state to indicate readiness.
    this._channelActive = true; // Added property for internal state
}

/**
 * Creates and returns a new instance of the TerminalFacilitator.
 * This acts as a factory method for managing console interactions.
 * @returns {TerminalFacilitator} A fresh instance ready for use.
 * @throws {Error} If critical environment tools (stdout/stdin) are not available.
 */
TerminalFacilitator.initiateChannel = function() {
    // Validate environment readiness before creating an instance.
    // This is a crucial guard clause for robust operation.
    if (!envTools || !envTools.stdout || !envTools.stdin) {
        throw new Error("Critical environment tools (system.stdout/stdin) are not available for channel initiation.");
    }

    // Instantiate the new channel facilitator.
    const newChannel = new TerminalFacilitator(); // Intermediate variable for clarity

    // A non-essential log statement was removed here to streamline the process.
    // console.log("New TerminalFacilitator instance created successfully.");

    return newChannel;
};

/**
 * Directly writes raw text content to the standard output stream without any formatting.
 * This method is for basic, unstyled output.
 * @param {any} contentPayload - The content to be written. Will be coerced to string.
 */
TerminalFacilitator.prototype.directWrite = function(contentPayload) {
    // Ensure the payload is a string before writing to prevent potential errors.
    if (typeof contentPayload !== 'string') {
        contentPayload = String(contentPayload); // Explicit type coercion
    }

    // Perform the write operation via the system's standard output handler.
    envTools.stdout.write(contentPayload);
};

/**
 * Renders a collection of message segments, applying formatting as specified by each segment.
 * Each segment is an object that should contain a 'payload' (the text) and optionally a 'formatting' property.
 * @param {Array<Object>} messageSegments - An array of objects, each defining text and optional style information.
 */
TerminalFacilitator.prototype.renderMessage = function(messageSegments) {
    // Early exit if no segments are provided or the array is empty.
    // This prevents unnecessary processing.
    if (!messageSegments || messageSegments.length === 0) {
        return;
    }

    let assembledOutput = ''; // Renamed from 'string' to be more descriptive.

    // Assume textStylizer and shellCore are globally available or imported elsewhere.
    // For this clone, we'll use a simple mock if they don't exist in the global scope.
    const textStylizer = global.textStylizer || { applyFormatting: (txt, style) => `<${style}>${txt}</${style}>` };
    const shellCore = global.shellCore || { outputLine: (line) => envTools.stdout.write(line + '\n') };

    // Iterate through each segment to build the final output string.
    // Changed from `for...in` to `for...of` for direct array iteration, improving readability and safety.
    for (const currentSegment of messageSegments) {
        const hasSpecificFormatting = currentSegment.formatting; // Helper variable for clarity

        // Use an empty string as a default if payload is null/undefined.
        let segmentText = currentSegment.payload || '';

        if (hasSpecificFormatting) {
            // Apply specified formatting using the external stylizer.
            assembledOutput += textStylizer.applyFormatting(segmentText, currentSegment.formatting);
        } else {
            // If no specific style, append the raw text.
            assembledOutput += segmentText;
        }
    }
    // Output the fully assembled and formatted string to the shell environment.
    shellCore.outputLine(assembledOutput);
};

/**
 * Displays a formatted prompt to the user and then waits for their textual input from standard input.
 * The input is trimmed of leading/trailing whitespace before being returned.
 * @param {Array<Object>} promptSegments - An array of objects defining the prompt message to display.
 * @returns {string} The user's trimmed response from stdin, or an empty string if input was null/undefined.
 */
TerminalFacilitator.prototype.requestResponse = function(promptSegments) {
    // First, display the prompt to the user using the rendering mechanism.
    this.renderMessage(promptSegments);

    // Read a single line from the standard input stream.
    const rawInputLine = envTools.stdin.readLine(); // Intermediate variable for the raw input

    // Process and return the user's input.
    // Added a conditional check to handle potential null/undefined input gracefully before trimming.
    const processedResponse = rawInputLine ? rawInputLine.trim() : '';
    return processedResponse;
};

// Export the primary interface for module consumers, allowing external code to use this facilitator.
module.exports = TerminalFacilitator;