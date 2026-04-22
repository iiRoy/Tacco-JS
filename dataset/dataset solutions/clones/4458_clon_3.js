/**
 * Processes raw input to determine the integer within a given range
 * that has the maximum number of factors of two.
 *
 * @param {string} rawInputString The raw string input, expected to be a number.
 */
function calculateMaxPowerOfTwoFactor(rawInputString) {
    // Attempt to parse the input string into an integer.
    // Trim whitespace and specify radix for robust parsing.
    const upperNumericalLimit = parseInt(rawInputString.trim(), 10);

    // --- Type III: Add guard clauses/validation ---
    // Handle invalid numerical input or cases where the limit is not positive.
    if (isNaN(upperNumericalLimit) || upperNumericalLimit < 0) {
        // According to original logic, if N was 0, it would print 0.
        // For negative, the loop wouldn't run, also printing 0.
        // We'll maintain this by setting a default.
        console.log(0);
        return;
    }

    // --- Type II: Rename identifiers, Type III: Change data structure ---
    // Initialize a structure to keep track of the number with the most
    // consecutive divisions by two, and that division count.
    // Using an object for clarity instead of an array.
    // Initialize with a value that will be immediately updated by the first valid number (e.g., 1).
    let optimalNumberDetails = {
        value: 0,      // The number itself
        divisions: -1  // The count of divisions by two. -1 ensures 0 divisions (for number 1) is captured.
    };

    /**
     * Determines how many times a given integer can be consecutively divided by 2.
     * This is an iterative approach, replacing the original recursive one.
     *
     * @param {number} numValue The integer to check.
     * @returns {number} The count of consecutive divisions by 2.
     */
    // --- Type II: Rename function, Type III: Rewrite logic (recursion to iteration) ---
    const countBinaryDivisions = (numValue) => {
        // Any number less than or equal to zero cannot be divided by 2 in this context.
        if (numValue <= 0) {
            return 0;
        }

        let currentDivisions = 0;
        // --- Type III: Add intermediate variable ---
        let workingValue = numValue; // Use a temporary variable for division

        // Loop as long as the number is even.
        while (workingValue % 2 === 0) {
            currentDivisions++;       // Increment the division count.
            workingValue /= 2;        // Divide the number by 2.
        }

        return currentDivisions;
    };


    // --- Type II: Rename loop variable, Type III: Use 'let' instead of 'var' ---
    // Iterate through all numbers from 1 up to the specified limit.
    for (let currentNumber = 1; currentNumber <= upperNumericalLimit; currentNumber++) {
        // Calculate the number of times the current integer can be divided by two.
        const currentNumberDivisions = countBinaryDivisions(currentNumber);

        // --- Type III: Update conditional structure and object assignment ---
        // If the current number has more divisions by two than our recorded optimal,
        // update the optimal details.
        if (currentNumberDivisions > optimalNumberDetails.divisions) {
            optimalNumberDetails.value = currentNumber;
            optimalNumberDetails.divisions = currentNumberDivisions;
        }
    }

    // --- Type II: Update output based on new data structure ---
    // Output the number that yielded the maximum power-of-two factor.
    console.log(optimalNumberDetails.value);
}

// --- Type III: Encapsulate input reading, Type II: Reformat spacing ---
// Standard input reading boilerplate for competitive programming.
// Reads from /dev/stdin.
const fileSystem = require("fs");
const standardInputData = fileSystem.readFileSync("/dev/stdin", "utf8");

// Execute the main calculation function with the obtained input.
calculateMaxPowerOfTwoFactor(standardInputData);