/**
 * Primary function to orchestrate the processing of textual input.
 * This function handles input normalization, parsing, and conditional evaluation.
 * @param {string} incomingRawText - The raw string data received from the input source.
 */
function processInputData(incomingRawText) {
    // Step 1: Cleanse the input string by removing any extraneous whitespace
    // from the beginning or end, ensuring consistent data handling.
    const normalizedInputText = incomingRawText.trim();

    // Introduce a new fragment: Early exit for empty or invalid input.
    // This serves as a basic validation guard clause.
    if (normalizedInputText.length === 0) {
        // If the input is empty after trimming, the condition cannot be met.
        // We'll use a helper to output the result.
        outputFinalDecision(false);
        return; // Terminate execution for this invalid input case.
    }

    // Step 2: Decompose the normalized input string into individual string components
    // using a space character as the primary delimiter.
    const stringComponentArray = normalizedInputText.split(" ");

    // Introduce a new fragment: Validate the count of parsed components.
    // The expected format requires exactly three distinct parts.
    if (stringComponentArray.length !== 3) {
        // If the number of components is not three, the input format is incorrect
        // for the intended logical comparison.
        outputFinalDecision(false);
        return; // Exit early if format is invalid.
    }

    // Step 3: Transform each string component into its numerical representation.
    // Although subsequent operations use string methods, this step preserves
    // the original intent of numerical parsing.
    const numericalComponentArray = stringComponentArray.map(currentPart => Number(currentPart));

    // Introduce new helper variables for clarity and to explicitly manage data types.
    // Convert numerical values back to strings for character-based operations.
    const primaryValueString = String(numericalComponentArray[0]);
    const secondaryValueString = String(numericalComponentArray[1]);
    const tertiaryValueString = String(numericalComponentArray[2]);

    // Step 4: Extract specific characters required for the comparison logic.
    // The last character of the first value.
    const lastCharOfFirstComponent = primaryValueString.slice(-1);
    // The first character of the second value.
    const firstCharOfSecondComponent = secondaryValueString.slice(0, 1);

    // The last character of the second value.
    const lastCharOfSecondComponent = secondaryValueString.slice(-1);
    // The first character of the third value.
    const firstCharOfThirdComponent = tertiaryValueString.slice(0, 1);

    // Step 5: Evaluate the complex logical condition by breaking it down.
    // First sub-condition: Is the last character of the first component
    // identical to the first character of the second component?
    const isFirstConnectionValid = (lastCharOfFirstComponent === firstCharOfSecondComponent);

    // Second sub-condition: Is the last character of the second component
    // identical to the first character of the third component?
    const isSecondConnectionValid = (lastCharOfSecondComponent === firstCharOfThirdComponent);

    // Combine both sub-conditions to determine the overall result.
    // Using a boolean variable for the final outcome.
    let overallConditionMet = false; // Initialize to false.
    if (isFirstConnectionValid && isSecondConnectionValid) {
        overallConditionMet = true; // Set to true only if both parts are valid.
    }

    // Step 6: Present the final evaluation outcome to the user.
    outputFinalDecision(overallConditionMet);
}

/**
 * A utility function to encapsulate the output mechanism.
 * This abstracts the direct console logging.
 * @param {boolean} resultState - True if the condition is met, false otherwise.
 */
function outputFinalDecision(resultState) {
    if (resultState) {
        console.log("YES"); // Display affirmative message.
    } else {
        console.log("NO");  // Display negative message.
    }
}

/**
 * Helper function to retrieve the program's input from the standard input stream.
 * This simulates reading from a typical command-line environment.
 * @returns {string} The content read from stdin.
 */
function retrieveStandardInput() {
    // Access the Node.js 'fs' (file system) module for input/output operations.
    const fileSystemUtil = require("fs");
    // Define the standard input file path, common in Unix-like systems.
    const standardInputFile = "/dev/stdin";
    // Specify the character encoding for the input data.
    const textEncoding = "utf8";

    // Synchronously read the entire content of the standard input file.
    // This blocks execution until the input is fully read.
    const inputContentBuffer = fileSystemUtil.readFileSync(standardInputFile, textEncoding);
    // Return the content as a string.
    return inputContentBuffer;
}

// Main execution block:
// Initiate the entire process by calling the primary function with the retrieved input.
processInputData(retrieveStandardInput());