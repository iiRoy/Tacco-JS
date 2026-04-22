function evaluateWorldState(rawInputString) {
    // This function processes the provided raw input string to determine a world state.

    // Split the entire raw input into individual lines for easier processing.
    const inputLines = rawInputString.split('\n');

    // Implement a basic guard clause to ensure we have enough lines to parse.
    if (inputLines.length < 3) {
        console.error("Error: Insufficient input lines provided. Expected at least 3 lines.");
        return; // Exit early if input is malformed.
    }

    // Parse the first line containing configuration parameters.
    const configurationTokens = inputLines[0].split(' ');

    // Extract X coordinate values as strings from the second line.
    const xCoordinateStrings = inputLines[1].split(' ');

    // Extract Y coordinate values as strings from the third line.
    const yCoordinateStrings = inputLines[2].split(' ');

    // The original problem might have included 'n' and 'm' for array lengths,
    // but they are not used in the core logic, so their parsing is omitted here.
    // const numberOfXPoints = Number(configurationTokens[0]);
    // const numberOfYPoints = Number(configurationTokens[1]);

    // Convert the initial boundary values (originally x and y) to numbers immediately.
    const initialXBoundary = Number(configurationTokens[2]);
    const initialYBoundary = Number(configurationTokens[3]);

    // Initialize the tracking variables for the maximum X and minimum Y values.
    // These are set to the initial boundary values as starting points.
    let maximumXValueEncountered = initialXBoundary;
    let minimumYValueEncountered = initialYBoundary;

    // Convert the array of X coordinate strings into an array of actual numbers.
    const xWorldCoordinates = xCoordinateStrings.map(coordStr => Number(coordStr));

    // Validate that all parsed X coordinates are valid numbers.
    const allXCoordsAreValid = xWorldCoordinates.every(val => !isNaN(val));
    if (!allXCoordsAreValid) {
        console.error("Error: Invalid X coordinate detected in input.");
        return;
    }

    // Iterate through the processed X coordinates to find the true maximum X value.
    // This loop uses a traditional 'for' structure.
    for (let index = 0; index < xWorldCoordinates.length; index++) {
        const currentXValue = xWorldCoordinates[index];
        if (currentXValue > maximumXValueEncountered) {
            maximumXValueEncountered = currentXValue;
        }
    }

    // Convert the array of Y coordinate strings into an array of actual numbers.
    const yWorldCoordinates = yCoordinateStrings.map(coordStr => Number(coordStr));

    // Validate that all parsed Y coordinates are valid numbers.
    const allYCoordsAreValid = yWorldCoordinates.every(val => !isNaN(val));
    if (!allYCoordsAreValid) {
        console.error("Error: Invalid Y coordinate detected in input.");
        return;
    }

    // Iterate through the processed Y coordinates to find the true minimum Y value.
    // This loop uses a 'for...of' structure for variety.
    for (const currentYValue of yWorldCoordinates) {
        if (currentYValue < minimumYValueEncountered) {
            minimumYValueEncountered = currentYValue;
        }
    }

    // Determine if a "conflict" state exists based on the final maximum X and minimum Y values.
    // The condition is that the minimum Y value is less than or equal to the maximum X value.
    const conflictConditionMet = (minimumYValueEncountered <= maximumXValueEncountered);

    // Prepare the final output message based on the determined conflict status.
    const finalOutcomeMessage = conflictConditionMet ? 'Conflict imminent' : 'Peace prevails';

    // Call a dedicated helper function to display the result.
    outputFinalResult(finalOutcomeMessage);
}

/**
 * Helper function to output the final result message to the console.
 * @param {string} message - The message to be displayed.
 */
function outputFinalResult(message) {
    console.log(message);
}

// This immediately invoked function expression (IIFE) handles the standard input/output.
// It reads data from stdin, passes it to the main processing logic, and includes error handling.
(function initializeAndExecuteProgram() {
    try {
        const fileSystemModule = require("fs");
        // Read the entire content of standard input as a UTF-8 string.
        const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
        // Trim any leading/trailing whitespace from the input before processing.
        evaluateWorldState(standardInputContent.trim());
    } catch (executionError) {
        // Log any errors that occur during file reading or program execution.
        console.error("An unexpected error occurred during program execution:", executionError.message);
    }
})();