const assessConnectivity = (inputDataString) => {
    // This function evaluates if two points (first and third) are "connected"
    // either directly or indirectly through a second point, within a given tolerance.

    // Trim whitespace and split the string into potential number strings.
    const rawValueStrings = inputDataString.trim().split(' ');

    // Ensure we have exactly four numeric values for processing.
    if (rawValueStrings.length !== 4) {
        // Guard clause: Handle invalid input length.
        console.error("Error: Expected four numeric values as input, but received " + rawValueStrings.length + ".");
        console.log('No'); // Default output for invalid input
        return;
    }

    // Parse string values into integers, using a consistent radix (base 10).
    const numericValues = rawValueStrings.map(str => parseInt(str, 10));

    // Deconstruct the array into distinct, meaningfully named variables.
    // This improves readability over generic 'a', 'b', 'c', 'd'.
    const [startPoint, intermediatePoint, endPoint, maximumAllowance] = numericValues;

    // Introduce helper function for absolute difference calculation for reusability and clarity.
    const calculateAbsoluteDifference = (val1, val2) => Math.abs(val1 - val2);

    // Break down the complex conditional logic into intermediate boolean flags.
    // This makes the logic easier to understand and debug.

    // Condition 1: Is the direct path from startPoint to endPoint within the maximumAllowance?
    const isDirectPathFeasible = calculateAbsoluteDifference(startPoint, endPoint) <= maximumAllowance;

    // Condition 2: Is the path from startPoint to intermediatePoint within allowance AND
    // from intermediatePoint to endPoint within allowance?
    const isIndirectPathFeasible =
        (calculateAbsoluteDifference(startPoint, intermediatePoint) <= maximumAllowance) &&
        (calculateAbsoluteDifference(intermediatePoint, endPoint) <= maximumAllowance);

    // Initialize the default outcome as 'No'.
    let finalDecision = 'No';

    // Evaluate the overall condition.
    // The original logic was likely a typo and intended to check absolute differences,
    // not boolean values passed to Math.abs. This clone implements the probable intended logic.
    if (isDirectPathFeasible || isIndirectPathFeasible) {
        // If either the direct or indirect path is feasible, the condition is met.
        finalDecision = 'Yes';
    }

    // Log the determined outcome.
    console.log(finalDecision);
};

// Modify the invocation part to use the new function name and add basic error handling.
try {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    assessConnectivity(fileContent);
} catch (error) {
    // Basic error handling for file operations, e.g., if /dev/stdin is not accessible.
    console.error("Failed to read input from /dev/stdin:", error.message);
    console.log('No'); // Output 'No' in case of input reading failure
}