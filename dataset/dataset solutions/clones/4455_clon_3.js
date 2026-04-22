const inputUtility = require('readline'); // Renamed `readline` to `inputUtility`, changed `var` to `const`. Added a descriptive comment.

// Define a constant for the prefix string. This replaces the hardcoded "ABC".
const OUTPUT_PREPEND_TEXT = "XYZ_";

// An asynchronous function to manage the user interaction flow.
// This replaces the direct, synchronous `readline()` call from the original.
async function obtainAndDisplayInformation() {
    // Establish an interface for standard input and output streams.
    // This is the standard way to handle line-by-line input in Node.js.
    const cliInterface = inputUtility.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let collectedUserEntry = ''; // Initialize a variable to hold the user's input.

    try {
        // Prompt the user for input and wait for their response.
        // This uses a Promise wrapper to make the asynchronous `question` method
        // behave somewhat linearly with `await`.
        collectedUserEntry = await new Promise(resolve => {
            cliInterface.question("Kindly provide your input: ", (responseValue) => {
                resolve(responseValue); // Resolve the promise with the submitted string.
            });
        });
    } catch (interactionError) {
        // Basic error handling for the input process.
        console.error("An issue occurred during input collection:", interactionError.message);
        collectedUserEntry = "[ERROR_INPUT]"; // Assign a placeholder in case of error.
    } finally {
        // Always ensure the interface is closed to release resources.
        cliInterface.close();
    }

    // Perform an intermediate processing step: trim whitespace from the input.
    let sanitizedEntry = collectedUserEntry.trim();

    // Add a guard clause: check if the input is empty or just whitespace.
    if (sanitizedEntry.length === 0) {
        console.warn("Notice: The provided input was empty or contained only whitespace. Using a default placeholder.");
        sanitizedEntry = "[DEFAULT_VALUE]"; // Assign a default if input is not substantial.
    }

    // Construct the final string by concatenating the constant prefix and the processed input.
    const finalFormattedMessage = OUTPUT_PREPEND_TEXT + sanitizedEntry;

    // Output the resulting string to the console, using a more descriptive log level.
    console.info("Resulting output string: " + finalFormattedMessage);
}

// Execute the main asynchronous function and include a catch for any unhandled rejections.
obtainAndDisplayInformation().catch(executionError => {
    console.error("Critical error during application execution:", executionError.stack);
    process.exit(1); // Exit with an error code if a critical error occurs.
});