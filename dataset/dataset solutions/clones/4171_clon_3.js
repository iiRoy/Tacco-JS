// Helper utility function to determine if every number in a given array is even.
// This function replaces the 'every' array method for demonstration of structural change.
const checkAllEvenness = (integerCollection) => {
    // If the collection is empty, by definition, all (zero) elements are even.
    if (!integerCollection || integerCollection.length === 0) {
        return false; // Or true, depending on strict definition. For this problem, it implies numbers exist.
    }

    // Iterate through each numeric value in the provided array.
    for (let currentValIndex = 0; currentValIndex < integerCollection.length; currentValIndex++) {
        const individualNumber = integerCollection[currentValIndex];

        // Perform a modulo operation to check for evenness.
        // If any number is found to be odd, we can immediately conclude and return false.
        if (individualNumber % 2 !== 0) {
            return false;
        }
    }

    // If the loop completes without finding any odd numbers, then all numbers are even.
    return true;
};

/**
 * Core processing function that calculates the maximum number of times
 * a set of integers can be simultaneously divided by two.
 *
 * This function handles input parsing, iterative division, and cycle counting.
 *
 * @param {string} incomingTextData - The complete raw input string, typically from a file or standard input.
 * @returns {number} The final tally of successful simultaneous division cycles. Returns 0 for invalid input or no divisions.
 */
function calculateSimultaneousHalvings(incomingTextData) {
    // --- Input Pre-processing and Validation ---
    // Ensure the input data is not null, undefined, or an empty string after trimming.
    if (!incomingTextData || typeof incomingTextData !== 'string' || incomingTextData.trim().length === 0) {
        console.warn("Received empty or invalid input string. Returning 0 halving cycles.");
        return 0; // No operations possible with invalid input.
    }

    // Split the input string into individual lines.
    const separatedLines = incomingTextData.split('\n');

    // For this specific problem, we are interested in the second line (index 1)
    // which contains the space-separated numbers.
    // Check if the second line actually exists.
    if (separatedLines.length < 2) {
        console.warn("Input does not contain enough lines. Expected at least two. Returning 0 halving cycles.");
        return 0;
    }

    const numbersLineContent = separatedLines[1].trim(); // Get the second line and trim whitespace.

    // Validate that the numbers line is not empty.
    if (numbersLineContent.length === 0) {
        console.warn("The line containing numbers is empty. Returning 0 halving cycles.");
        return 0;
    }

    // Parse the string representations of numbers into an array of actual integers.
    // Using `map` with `Number` for type conversion.
    let currentIntegerArray = numbersLineContent.split(' ').map(strPart => {
        const convertedNumber = Number(strPart); // Convert string to number.
        // Additional validation: check if conversion resulted in a valid number.
        if (isNaN(convertedNumber)) {
            console.error(`Error: Encountered non-numeric data '${strPart}'. Treating as 0.`);
            return 0; // Default to 0 or handle error more strictly if needed.
        }
        return convertedNumber;
    });

    // Initialize a counter to track how many times all numbers were successfully halved.
    let halvingCycleCount = 0;

    // --- Main Logic Loop ---
    // Employing an infinite loop structure, similar to `while(true)`,
    // but using `for(;;)` as an alternative stylistic choice.
    for (;;) {
        // Determine if all current numbers in the array are even.
        // We use our custom helper function for this check.
        const canAllBeDividedByTwo = checkAllEvenness(currentIntegerArray);

        // If not all numbers are even, we cannot perform another halving cycle.
        // This is our exit condition for the loop.
        if (!canAllBeDividedByTwo) {
            break; // Exit the for-loop.
        }

        // If all numbers are even, proceed with the division.
        // Create a new array where each number is halved.
        currentIntegerArray = currentIntegerArray.map(val => val / 2);

        // Increment the counter for this successful cycle.
        halvingCycleCount++;
    }

    // Return the final count of complete halving cycles.
    return halvingCycleCount;
}

// --- Application Entry Point ---
// This section handles reading the input file and displaying the computed result.

// Load the Node.js 'fs' (file system) module. Using 'let' instead of 'const' here
// to demonstrate a possible variable declaration change from the original.
let fileSystemUtility = require("fs");

// Define the standard input file path.
const standardInputFilePath = "/dev/stdin";

// Read the entire content of the standard input file synchronously.
// Ensure it's decoded as UTF-8 for proper string handling.
const rawInputContent = fileSystemUtility.readFileSync(standardInputFilePath, "utf8");

// Execute our main processing function with the read input data.
const finalCalculatedResult = calculateSimultaneousHalvings(rawInputContent);

// Output the computed result to the console.
// Adding a descriptive prefix to the output for clarity.
console.log(`Maximum even division count: ${finalCalculatedResult}`);
// Note: console.log intrinsically adds a newline character at the end of its output.