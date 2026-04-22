// Buffer to accumulate all input lines received from the standard input stream.
const inputLinesBuffer = [];

// Import the 'readline' module for managing terminal input/output.
const terminalInputHandler = require('readline');

/**
 * Safely parses a string value into an integer.
 * Handles cases for invalid or empty string inputs by returning 0.
 * @param {string} rawStringValue - The string to be parsed.
 * @returns {number} The parsed integer, or 0 if parsing fails or input is invalid.
 */
function parseStringToInt(rawStringValue) {
    // Perform basic type and content validation for the input string.
    if (typeof rawStringValue !== 'string' || rawStringValue.trim() === '') {
        return 0; // Default to 0 for invalid string input.
    }
    // Attempt to parse the string into an integer using base 10.
    const parsedInteger = parseInt(rawStringValue, 10);
    // Return the parsed integer if it's a valid number, otherwise return 0.
    return isNaN(parsedInteger) ? 0 : parsedInteger;
}

/**
 * Calculates the absolute difference between two numeric values.
 * This is a simple wrapper for Math.abs.
 * @param {number} valueA - The first number.
 * @param {number} valueB - The second number.
 * @returns {number} The absolute difference between valueA and valueB.
 */
const calculateAbsoluteDifference = (valueA, valueB) => Math.abs(valueA - valueB);

// Initialize the readline interface to handle standard input and output streams.
const interfaceManager = terminalInputHandler.createInterface({
    input: process.stdin,   // Specifies the input stream (standard input).
    output: process.stdout  // Specifies the output stream (standard output).
});

// Attach an event listener for each line of input received from the terminal.
interfaceManager.on('line', (currentInputSegment) => {
    // Each received line is added to our buffer for later processing.
    inputLinesBuffer.push(currentInputSegment);
});

// Attach an event listener for when the input stream is fully closed (e.g., user presses Ctrl+D).
interfaceManager.on('close', () => {
    // --- Input Validation and Parsing ---

    // Ensure that at least two lines of input are available as expected.
    if (inputLinesBuffer.length < 2) {
        console.error("ERROR: Insufficient data provided. Expected at least two lines of input.");
        return; // Terminate execution if input is incomplete.
    }

    // Process the first line, which contains two space-separated integers: N and K.
    const firstLineComponents = inputLinesBuffer[0].split(" ");
    if (firstLineComponents.length < 2) {
        console.error("ERROR: The first line must contain two space-separated numerical values.");
        return;
    }

    // Parse the total count of points (N) and the desired subsequence length (K).
    const totalPointsCount = parseStringToInt(firstLineComponents[0]);
    const subsequenceLength = parseStringToInt(firstLineComponents[1]);

    // Validate the parsed N and K values to ensure they are positive.
    if (totalPointsCount <= 0 || subsequenceLength <= 0) {
        console.error("ERROR: Both N (total points) and K (subsequence length) must be positive integers.");
        return;
    }
    // Validate that K does not exceed N.
    if (subsequenceLength > totalPointsCount) {
        console.error("ERROR: Subsequence length (K) cannot be greater than the total number of points (N).");
        return;
    }

    // Process the second line, which contains the array of coordinate values.
    const coordinateValues = inputLinesBuffer[1].split(" ").map(valString => parseStringToInt(valString));

    // Optional: Verify that the number of parsed coordinates matches the expected totalPointsCount.
    if (coordinateValues.length !== totalPointsCount) {
        console.warn(`WARNING: Expected ${totalPointsCount} coordinate values, but found ${coordinateValues.length}. Processing with available data.`);
        // Depending on problem specifics, this might be an error or just a warning.
    }

    // --- Core Logic: Finding Minimum Travel Cost ---

    // Initialize an accumulator for the minimum cost found, set to the largest possible safe integer value.
    let minimalCostAccumulator = Number.MAX_SAFE_INTEGER;

    // Iterate through all possible starting indices for a subsequence of length K.
    // The loop condition ensures the window (subsequence) always fits within the coordinateValues array.
    for (let currentWindowStartIdx = 0; currentWindowStartIdx <= totalPointsCount - subsequenceLength; ++currentWindowStartIdx) {
        // Define the left and right boundary indices for the current sliding window.
        const windowLeftBoundary = currentWindowStartIdx;
        const windowRightBoundary = currentWindowStartIdx + subsequenceLength - 1;

        // Retrieve the actual coordinate values at these boundaries.
        const valueAtLeftPoint = coordinateValues[windowLeftBoundary];
        const valueAtRightPoint = coordinateValues[windowRightBoundary];

        // Calculate the absolute distance between the two boundary points of the current window.
        const distanceBetweenBoundaryPoints = calculateAbsoluteDifference(valueAtLeftPoint, valueAtRightPoint);

        // Calculate cost for scenario 1: Travel from origin (0) to left point, then to right point.
        // Formula: |X[left]| + |X[right] - X[left]|
        const costScenarioOne = calculateAbsoluteDifference(valueAtLeftPoint, 0) + distanceBetweenBoundaryPoints;

        // Calculate cost for scenario 2: Travel from origin (0) to right point, then to left point.
        // Formula: |X[right]| + |X[right] - X[left]| (Note: |X[right] - X[left]| is equivalent to |X[left] - X[right]|)
        const costScenarioTwo = calculateAbsoluteDifference(valueAtRightPoint, 0) + distanceBetweenBoundaryPoints;

        // Update the overall minimal cost if either scenario yields a lower cost.
        minimalCostAccumulator = Math.min(minimalCostAccumulator, costScenarioOne, costScenarioTwo);
    }

    // --- Output Result ---

    // Print the final calculated minimum travel cost to the console.
    console.log(minimalCostAccumulator);
});