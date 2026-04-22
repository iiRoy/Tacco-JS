// This module processes a raw text input to determine a specific condition.
// It analyzes the second line of the input for a particular marker.
function analyzeDataStream(rawContent) {
    // Split the entire content into individual lines based on newline characters.
    // If 'rawContent' is an empty string, 'contentLines' will be an array containing a single empty string: [""]
    const contentLines = rawContent.split('\n');

    // We are specifically interested in the second line of the input (index 1).
    // A check is performed to ensure that there are at least two lines available in the input.
    // If there are fewer than two lines (e.g., empty input, or only one line),
    // the specific condition related to the second line cannot be met.
    if (contentLines.length < 2) {
        // In such scenarios, the original logic would implicitly not find the 'Y' marker
        // in a non-existent or insufficient second line, which would lead to the "Three" output.
        console.log("Three");
        return; // Exit the function early as the condition cannot be evaluated further.
    }

    // Extract the second line of the input (at index 1) and then split it by spaces
    // to obtain an array of individual string tokens.
    const relevantLine = contentLines[1];
    const targetLineTokens = relevantLine.split(' ');

    let foundSpecificMarker = false; // Initialize a boolean indicator to track if the marker is found.

    // Define the specific marker string that we are looking for within the tokens.
    const REQUIRED_TOKEN = "Y"; // This constant helps in making the code more readable and maintainable.

    // Iterate through each token item present in the 'targetLineTokens' array.
    // A 'for...of' loop is used here for its clarity and the ability to use 'break' for early exit.
    for (const tokenItem of targetLineTokens) {
        // Perform a strict equality check to see if the current token exactly matches the required marker.
        if (tokenItem === REQUIRED_TOKEN) {
            foundSpecificMarker = true; // Set the indicator to true if the marker is successfully found.
            break; // Immediately exit the loop once the marker is found, as the condition is already met.
        }
    }

    let finalOutputMessage; // Declare an intermediate variable to store the message that will be outputted.

    // Determine the final message string based on the value of 'foundSpecificMarker'.
    // This 'if/else' structure replaces a ternary operator for potentially better readability in complex cases.
    if (foundSpecificMarker) {
        finalOutputMessage = "Four"; // This message is used when the 'REQUIRED_TOKEN' is present.
    } else {
        finalOutputMessage = "Three"; // This is the default message when the 'REQUIRED_TOKEN' is not found.
    }

    // Display the determined message to the standard output stream.
    console.log(finalOutputMessage);
}

// --- Execution Entry Point for Script ---
// This block handles the process of reading the input data from the standard input stream
// and then invoking our primary data processing function with the obtained raw data.
try {
    // Store the 'fs' (file system) module in a constant for cleaner access.
    const fileSystemModule = require("fs");
    // Define the path for the standard input source as a constant.
    const standardInputSource = "/dev/stdin";

    // Read the entire content of the standard input file synchronously.
    // The content is decoded using UTF-8 encoding, and any leading or trailing whitespace
    // (including newlines) is removed using the 'trim()' method.
    const rawInputContent = fileSystemModule.readFileSync(standardInputSource, "utf8").trim();

    // Call the main data analysis function, passing the raw input content for processing.
    analyzeDataStream(rawInputContent);
} catch (dataReadError) {
    // Implement basic error handling for potential issues that might occur
    // during the file system read operation (e.g., file not found, permission denied).
    // The error message is logged to the console.
    console.error("An error occurred while attempting to read input data:", dataReadError.message);
    // In a production environment, more robust error handling (e.g., exiting with a specific code)
    // might be implemented here. For this clone, simply logging the error is sufficient.
}