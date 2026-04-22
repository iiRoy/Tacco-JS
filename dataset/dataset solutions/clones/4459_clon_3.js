const ProcessInputData = (rawDataSet) => {
    // This function identifies the non-negative integer within a specified range
    // that can be divided by two the maximum number of times.

    // --- Input Processing and Validation (Type III Additions) ---
    // First, sanitize and split the raw input string into individual lines.
    const parsedLines = rawDataSet.trim().split('\n');

    // Implement a guard clause for empty or malformed input.
    if (parsedLines.length === 0 || parsedLines[0].trim() === '') {
        console.error("Input Error: No primary data line detected. Please provide a numeric value.");
        return; // Terminate execution gracefully.
    }

    // Extract the primary numerical limit from the first line of input.
    // Explicitly parse it as an integer with base 10.
    const numericalLimit = parseInt(parsedLines[0].trim(), 10);

    // Another guard clause to ensure the limit is a valid non-negative integer.
    if (isNaN(numericalLimit) || numericalLimit < 0) {
        console.error(`Input Error: The provided limit '${parsedLines[0].trim()}' is not a valid non-negative integer.`);
        return; // Terminate execution.
    }

    // --- Core Logic Variables (Type II Renaming & Type Declaration Updates) ---
    // Initialize a variable to track the highest count of divisions by two found so far.
    let maxDivisibilityScore = 0;

    // Initialize a variable to store the number that achieved the 'maxDivisibilityScore'.
    let resultantInteger = 0;

    // --- Helper Function (Type III Addition: Code Extraction) ---
    // This auxiliary function calculates how many times a given number can be
    // successively divided by 2 before it becomes odd or less than 2.
    const calculateConsecutiveEvenDivisions = (candidateNumber) => {
        let tempWorkingValue = candidateNumber; // Use a temporary variable to avoid modifying the original.
        let divisionsTally = 0;                 // Counter for the divisions.

        // Special handling for zero, as it doesn't fit the division by 2 pattern.
        if (tempWorkingValue === 0) {
            return 0;
        }

        // Loop as long as the number is even and greater than or equal to 2.
        while (tempWorkingValue >= 2 && (tempWorkingValue % 2 === 0)) {
            divisionsTally++;          // Increment the division count.
            tempWorkingValue /= 2;     // Divide the number by 2.
        }
        return divisionsTally;         // Return the total count of divisions.
    };

    // --- Iteration Loop (Type II Renaming, Formatting & Type Declaration Updates) ---
    // Iterate through all integers starting from 0, up to and including the specified numerical limit.
    for (let currentIterationValue = 0; currentIterationValue <= numericalLimit; ++currentIterationValue) {
        // Determine the divisibility score for the current number using our helper.
        const currentDivScore = calculateConsecutiveEvenDivisions(currentIterationValue);

        // --- Comparison and Update Logic (Type III Refinement) ---
        // If the current number's divisibility score is greater than or equal to
        // the best score found previously, update our tracking variables.
        // The original logic implicitly prefers the larger number if scores are equal
        // (due to the `>=` and iteration order), which is maintained here.
        if (currentDivScore >= maxDivisibilityScore) {
            maxDivisibilityScore = currentDivScore; // Update the highest score.
            resultantInteger = currentIterationValue; // Update the number associated with that score.
        }
    }

    // --- Output (Type II Formatting Change) ---
    // Output the final integer that satisfies the condition.
    // Using process.stdout.write for a more direct output stream, similar to some
    // competitive programming environments, and explicitly appending a newline.
    process.stdout.write(String(resultantInteger) + '\n');
};

// --- Execution Entry Point (Type II Renaming & Restructuring) ---
// Read the entire content of the standard input file synchronously.
// The input is assumed to be UTF-8 encoded.
const inputDataContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Invoke the main processing function with the obtained input data.
ProcessInputData(inputDataContent);