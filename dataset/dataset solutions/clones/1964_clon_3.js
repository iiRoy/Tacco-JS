// This module provides a utility function to process a specific format of input data.
// It expects a multi-line string where the first line contains a single numerical boundary
// value and the second line contains a series of space-separated numbers to be summed.
function ProcessInputData(rawDataString) {
    // Perform initial validation on the provided input string.
    if (!rawDataString || typeof rawDataString !== 'string' || rawDataString.trim() === '') {
        console.error("Input processing aborted: The provided data string is empty or invalid.");
        return; // Exit if input is not usable.
    }

    // Split the entire input block into individual lines.
    const linesOfText = rawDataString.split("\n");

    // Verify that the minimum required number of lines are present.
    const MIN_REQUIRED_LINES = 2;
    if (linesOfText.length < MIN_REQUIRED_LINES) {
        console.error(`Input processing aborted: Expected at least ${MIN_REQUIRED_LINES} lines, but received ${linesOfText.length}.`);
        return;
    }

    // --- Parse the primary numerical boundary from the first line ---
    const boundaryTokens = linesOfText[0].split(" ");
    if (boundaryTokens.length === 0 || boundaryTokens[0].trim() === '') {
        console.error("Input processing aborted: The first line is empty or does not contain a boundary value.");
        return;
    }

    const mainBoundaryValue = Number.parseInt(boundaryTokens[0].trim(), 10);

    // Validate the parsed boundary value to ensure it's a valid number.
    if (Number.isNaN(mainBoundaryValue)) {
        console.error("Input processing aborted: The boundary value on the first line could not be parsed as a valid number.");
        return;
    }

    // --- Process the second line to extract and parse the collection of numbers ---
    const numericDataCollection = linesOfText[1].split(" ").map(tokenString => {
        const parsedNumericToken = Number.parseInt(tokenString.trim(), 10);
        // If a token cannot be parsed, treat it as zero for summation, or filter it out.
        // Here, we'll filter out invalid numbers to ensure only valid data is summed.
        if (Number.isNaN(parsedNumericToken)) {
            console.warn(`Warning: Non-numeric token "${tokenString}" found in data collection line; it will be excluded from the sum.`);
            return undefined; // Mark for filtering
        }
        return parsedNumericToken;
    }).filter(value => value !== undefined); // Remove any undefined entries (invalid numbers).

    // Define an arrow function to compute the sum of an array of numbers.
    const computeSumOfElements = (elementList) => {
        // Handle cases where the list might be empty or null.
        if (!elementList || elementList.length === 0) {
            return 0;
        }
        return elementList.reduce((currentAccumulator, itemValue) => currentAccumulator + itemValue, 0);
    };

    // Calculate the total sum of all valid numbers from the second line.
    const aggregatedSum = computeSumOfElements(numericDataCollection);

    // Perform the core calculation: subtract the aggregated sum from the main boundary value.
    let finalCalculatedOutcome = mainBoundaryValue - aggregatedSum;

    // Output the result based on whether the final outcome is non-negative.
    if (finalCalculatedOutcome >= 0) {
        console.log(finalCalculatedOutcome);
    } else {
        // If the outcome is negative, print -1 as per requirements.
        console.log(-1);
    }
}

// This block handles the execution environment, typically for competitive programming.
// It reads the entire standard input as a UTF-8 string and passes it to the main processing function.
try {
    const systemInput = require("fs").readFileSync("/dev/stdin", "utf8");
    ProcessInputData(systemInput);
} catch (error) {
    console.error("An error occurred during input reading or processing:", error.message);
    // Optionally, print a default error output if required by problem statement
    // console.log(-1);
}