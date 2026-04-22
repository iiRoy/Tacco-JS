const fileSystem = require("fs");

/**
 * Parses a single line of space-separated numbers into an array of integers.
 * @param {string} line - The input string line.
 * @returns {number[]} An array of parsed integers.
 */
const parseLineToNumbers = (line) => {
    // Using Number() for type conversion, which is a common alternative to parseInt()
    // It's also more concise for simple cases and correctly handles whitespace.
    return line.split(' ').map(Number);
};

/**
 * Processes raw input data to calculate a final accumulated ratio sum.
 * The core logic involves iteratively scaling up current ratios to meet minimums.
 * @param {string} rawInputString - The multi-line string input.
 */
function processInputData(rawInputString) {
    // Guard clause for empty or invalid input string.
    if (!rawInputString || rawInputString.trim() === '') {
        console.error("Error: Input data is empty or invalid. Please provide a non-empty string.");
        return; // Exit early if input is not valid.
    }

    // Step 1: Parse the entire input string into an array of lines.
    // This includes trimming overall whitespace and splitting into individual lines.
    const allInputLines = rawInputString.trim().split('\n');

    // Step 2: Extract the number of data entries from the first line.
    // A validation check ensures the first line exists and contains a valid number.
    const numEntriesLineContent = allInputLines[0];
    if (!numEntriesLineContent) {
        console.error("Error: The first line specifying the number of entries is missing.");
        return;
    }
    const numEntries = parseLineToNumbers(numEntriesLineContent)[0];

    // Additional validation for numEntries: must be a non-negative integer.
    if (isNaN(numEntries) || numEntries < 0 || !Number.isInteger(numEntries)) {
        console.error(`Error: Invalid number of entries detected: '${numEntries}'. Expected a non-negative integer.`);
        return;
    }

    // Step 3: Parse the subsequent lines into ratio pairs [T, A].
    // We slice the array to get only the data lines, starting from the second line (index 1).
    const ratioDefinitions = [];
    // Loop through the lines corresponding to the data entries.
    // The loop iterates 'numEntries' times, starting from the line after the count.
    for (let lineIdx = 0; lineIdx < numEntries; lineIdx++) {
        const currentDataLineIndex = lineIdx + 1; // Data lines start from index 1 in allInputLines
        const lineContent = allInputLines[currentDataLineIndex];

        if (!lineContent) {
            console.error(`Error: Data line for entry ${lineIdx + 1} is missing. Expected ${numEntries} entries.`);
            return;
        }
        const parsedPair = parseLineToNumbers(lineContent);

        // Basic validation for the pair structure: must be two positive numbers.
        if (parsedPair.length !== 2 || parsedPair.some(val => isNaN(val) || val <= 0)) {
            console.error(`Error: Invalid ratio pair data found: '${lineContent}'. Each pair must contain two positive numbers.`);
            return;
        }
        ratioDefinitions.push(parsedPair);
    }

    // Optional: Guard against insufficient data compared to declared numEntries.
    // This could be a warning or an error depending on desired strictness.
    if (ratioDefinitions.length < numEntries) {
         console.warn(`Warning: Declared ${numEntries} entries, but only ${ratioDefinitions.length} ratio pairs were successfully parsed.`);
         // Decide whether to proceed with available data or exit. For this clone, we proceed.
    }


    // Step 4: Handle the edge case where no ratio definitions were successfully parsed or numEntries was 0.
    if (ratioDefinitions.length === 0) {
        console.log(0); // If no ratios, their sum is 0.
        return;
    }

    // Step 5: Initialize the accumulated ratio pair using the first valid ratio definition.
    // This eliminates the need for a special [0, 0] initial state and simplifies the loop logic.
    let [accumulatedT, accumulatedA] = [...ratioDefinitions[0]]; // Create a copy to ensure independence.

    // Step 6: Iterate through the remaining ratio definitions (from the second item onwards).
    // For each pair, calculate the minimum multiplier needed to satisfy the accumulated minimums.
    for (let currentItemIndex = 1; currentItemIndex < ratioDefinitions.length; currentItemIndex++) {
        const [currentItemT, currentItemA] = ratioDefinitions[currentItemIndex];

        let requiredOverallMultiplier;

        // Condition to check if the current item's values are already greater than or equal to the accumulated values.
        // If so, no scaling is needed for this step, and the current item simply replaces the accumulated values.
        if (currentItemT >= accumulatedT && currentItemA >= accumulatedA) {
            requiredOverallMultiplier = 1;
        } else {
            // Calculate the minimum multiplier required for each component (T and A) independently.
            // Division by zero is prevented by input validation, but included for theoretical robustness.
            const multiplierRequiredForT = Math.ceil(accumulatedT / currentItemT);
            const multiplierRequiredForA = Math.ceil(accumulatedA / currentItemA);

            // The overall multiplier must be sufficient for *both* T and A components.
            // Math.max ensures we take the larger of the two required multipliers.
            requiredOverallMultiplier = Math.max(multiplierRequiredForT, multiplierRequiredForA);
        }

        // Update the accumulated ratio pair by applying the calculated multiplier.
        accumulatedT = currentItemT * requiredOverallMultiplier;
        accumulatedA = currentItemA * requiredOverallMultiplier;
    }

    // Step 7: Output the sum of the final accumulated ratio components.
    const finalRatioSum = accumulatedT + accumulatedA;
    console.log(finalRatioSum);
}

// Entry point for execution. Reads input from standard input.
// Wrapped in a try-catch block for robust error handling during file system operations.
try {
    const standardInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    processInputData(standardInputContent);
} catch (error) {
    // Log a user-friendly error message if input reading or processing fails.
    console.error("An error occurred during input processing:", error.message);
    // In a production environment, more detailed error logging (e.g., stack trace) might be added here.
}