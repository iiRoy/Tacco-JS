// This module is designed to process numerical data from standard input.
// It identifies the maximum sum within a sliding window of a specified size
// and then applies a final transformation to that maximum sum before outputting.

/**
 * Processes raw input data to perform a sliding window sum calculation.
 * The function expects a string containing two lines:
 * - The first line: two space-separated integers (N, K)
 *   N: Total count of elements (used for validation, not core logic)
 *   K: The size of the sliding window
 * - The second line: N space-separated integers representing the data points.
 *
 * @param {string} rawDataInput The raw string input from a source like stdin.
 */
function ProcessData(rawDataInput) {
    // Split the entire input string into an array of individual lines.
    const contentLines = rawDataInput.split('\n');

    // --- Input Validation and Initial Parsing ---
    // Ensure that the minimum required number of lines are present in the input.
    if (contentLines.length < 2) {
        console.error("Error: Insufficient input data. Expected at least two lines for configuration and scores.");
        return; // Terminate execution if input format is incorrect.
    }

    // Parse the first line which contains global configuration values (N and K).
    const configurationValues = contentLines[0].split(' ').map(Number);
    // Validate if the configuration line contains exactly two valid numbers.
    if (configurationValues.length !== 2 || configurationValues.some(isNaN)) {
        console.error("Error: Invalid configuration format. Expected two numbers (N K) on the first line.");
        return;
    }
    // Destructure the configuration values into descriptive constants.
    const [totalElementCount, windowDimension] = configurationValues;

    // Parse the second line, which contains the array of numerical scores.
    const scoreArray = contentLines[1].split(' ').map(Number);
    // Validate that all parsed score values are indeed numbers.
    if (scoreArray.some(isNaN)) {
        console.error("Error: Invalid score data. Expected a list of numbers on the second line.");
        return;
    }

    // --- Core Logic Validation ---
    // Validate the consistency between 'N' from the config and the actual array length.
    if (totalElementCount !== scoreArray.length) {
        console.error(`Error: Mismatch between declared total elements (${totalElementCount}) and actual score array length (${scoreArray.length}).`);
        return;
    }
    // Ensure the score array is not empty, as calculations would be impossible.
    if (scoreArray.length === 0) {
        console.error("Error: Score array is empty. Cannot perform window sum calculations.");
        return;
    }
    // Validate the window size: it must be positive and not exceed the total number of elements.
    if (windowDimension <= 0 || windowDimension > scoreArray.length) {
        console.error(`Error: Invalid window size (${windowDimension}). Must be positive and not greater than the total element count (${scoreArray.length}).`);
        return;
    }

    // Initialize variables for the sliding window algorithm.
    let currentSegmentSum = 0; // Holds the sum of elements within the current window.
    // Initialize with negative infinity to correctly capture the highest sum,
    // especially if all potential sums could be negative.
    let highestSegmentSum = -Infinity;

    // --- Calculate the sum for the very first sliding window ---
    // This loop populates the initial window with the first 'windowDimension' elements.
    for (let idx = 0; idx < windowDimension; ++idx) {
        currentSegmentSum += scoreArray[idx];
    }
    // The sum of the first window is the highest sum found so far.
    highestSegmentSum = currentSegmentSum;

    // --- Slide the window across the rest of the array ---
    // The window starts sliding from the element immediately following the initial window.
    for (let windowIndex = windowDimension; windowIndex < scoreArray.length; ++windowIndex) {
        // Add the new element that enters the window from the right side.
        currentSegmentSum += scoreArray[windowIndex];
        // Subtract the element that leaves the window from the left side.
        // This maintains the sum for the current window without re-calculating from scratch.
        currentSegmentSum -= scoreArray[windowIndex - windowDimension];

        // Compare the current window's sum with the highest sum recorded so far.
        // Update 'highestSegmentSum' if the current sum is greater.
        if (currentSegmentSum > highestSegmentSum) {
            highestSegmentSum = currentSegmentSum;
        }
    }

    // --- Final Calculation and Output ---
    // Perform the final arithmetic transformation required by the problem.
    // This is a specific step to derive the ultimate result.
    const numeratorForFinalCalculation = highestSegmentSum + windowDimension;
    // Use 2.0 to ensure floating-point division.
    const finalComputedValue = numeratorForFinalCalculation / 2.0;

    // Display the calculated result to the console.
    console.log(finalComputedValue);
}

// --- Execution Entry Point ---
// This Immediately-Invoked Function Expression (IIFE) handles the environment-specific
// input reading and calls the main processing function.
(function executeProcessing() {
    // Check if the script is running in a Node.js environment by looking for 'require'.
    if (typeof require !== 'undefined' && typeof module !== 'undefined' && module.exports) {
        const fileSystemModule = require("fs"); // Import Node.js file system module.
        const standardInputPath = "/dev/stdin"; // Standard input path for Linux/Unix-like systems.

        try {
            // Read all data from standard input, decode as UTF-8, and remove leading/trailing whitespace.
            const rawDataString = fileSystemModule.readFileSync(standardInputPath, "utf8").trim();
            // Call the main processing function with the obtained input.
            ProcessData(rawDataString);
        } catch (error) {
            // Catch and log any errors that occur during file reading.
            console.error("Error encountered while reading input from stdin:", error.message);
        }
    } else {
        // Provide a warning if the script is run in an environment where stdin cannot be accessed
        // or is not explicitly handled (e.g., a browser without a specific input mechanism).
        console.warn("Input reading mechanism is not implemented for this non-Node.js environment.");
        // For testing purposes in a non-Node.js environment, one could uncomment and
        // provide a hardcoded input string here:
        // ProcessData("5 3\n10 20 30 40 50");
    }
})();