function processAndCalculateMinAdjacentDiff(rawInputStringData) {
    // This function aims to parse a string of space-separated numbers,
    // sort them numerically, and then compute the sum of absolute differences
    // between each adjacent pair of numbers in the sorted sequence.
    // This effectively finds the minimum "cost" to arrange points on a line.

    // --- Type III: Input Validation and Guard Clauses ---
    if (!rawInputStringData || typeof rawInputStringData !== 'string' || rawInputStringData.trim().length === 0) {
        // If the input is empty, null, or not a string, we cannot proceed.
        // Log an error and indicate no calculation is possible.
        console.error("Error: Provided input data is empty or invalid. Expected a non-empty string.");
        return; // Exit the function gracefully.
    }

    // --- Type II & III: Variable Renaming, Intermediate Steps, and Robust Parsing ---
    // Step 1: Split the input string into an array of string representations of numbers.
    // Original: var A = input.split(' ');
    const rawNumberStrings = rawInputStringData.split(' ');

    // Step 2: Convert string representations to actual numbers and filter out any invalid entries.
    // Original: A = A.map((s) => parseInt(s));
    // Using explicit radix for parseInt and filtering out NaN values for robustness.
    const parsedNumericValues = rawNumberStrings
        .map(stringSegment => parseInt(stringSegment.trim(), 10)) // Trim whitespace and parse with base 10.
        .filter(parsedNum => !isNaN(parsedNum)); // Keep only valid numbers.

    // --- Type III: Guard Clause for Insufficient Data ---
    if (parsedNumericValues.length < 2) {
        // If there are fewer than two valid numbers, no adjacent differences can be calculated.
        // The sum of differences is inherently zero in such cases.
        console.log(0);
        return; // Terminate execution as result is trivial.
    }

    // Step 3: Sort the numeric values in ascending order.
    // Original: A = A.sort();
    // Type III: Using a custom comparison function for reliable numerical sorting.
    const orderedNumericSequence = parsedNumericValues.sort((firstVal, secondVal) => firstVal - secondVal);

    // --- Type III: Helper Function for Core Logic (Absolute Difference) ---
    // Encapsulating a frequently used calculation.
    const computeAbsoluteDifference = (valA, valB) => Math.abs(valA - valB);

    // --- Type II & III: Calculation of Total Differences using 'reduce' ---
    // Original: var cost = 0;
    // Original: for (var i = 0 ; i < A.length - 1 ; ++i) { cost += Math.abs(A[i] - A[i+1]); }
    // Using `reduce` for a more functional and concise way to sum the differences.
    const totalCumulativeDifference = orderedNumericSequence.reduce((currentSum, currentValue, currentIndex, fullArray) => {
        // Ensure we don't go out of bounds by checking for the next element.
        if (currentIndex < fullArray.length - 1) {
            const nextValueInSequence = fullArray[currentIndex + 1];
            // Add the absolute difference between the current and next element to the sum.
            return currentSum + computeAbsoluteDifference(currentValue, nextValueInSequence);
        }
        // For the last element, there's no next element, so return the sum as is.
        return currentSum;
    }, 0); // Initialize the sum with zero.

    // --- Type II: Output Final Result ---
    // Original: console.log(cost);
    console.log(totalCumulativeDifference);
}

// --- Type III: Enhanced Input Reading and Execution Wrapper ---
// This anonymous self-executing function handles reading input and calling the main logic.
(function executeSolver() {
    const fileSystemModule = require("fs"); // Import Node.js file system module.
    const standardInputFilePath = "/dev/stdin"; // Define path for standard input.
    let inputContentBuffer; // Variable to hold raw input data.

    try {
        // Attempt to synchronously read the entire content from standard input.
        inputContentBuffer = fileSystemModule.readFileSync(standardInputFilePath, "utf8");
    } catch (readOperationError) {
        // If there's an error reading from stdin (e.g., file not found, permission issues).
        console.error(`An issue occurred while attempting to read from ${standardInputFilePath}: ${readOperationError.message}`);
        // Provide a fallback or exit the process if critical.
        // For demonstration, we'll provide a predefined string if stdin fails.
        console.warn("Proceeding with a default example data string due to input read failure.");
        inputContentBuffer = "10 20 30 5 15 25"; // Fallback example data.
    }

    // Invoke the primary processing function with the obtained input.
    processAndCalculateMinAdjacentDiff(inputContentBuffer);
})();