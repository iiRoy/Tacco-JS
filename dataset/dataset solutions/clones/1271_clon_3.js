const fileSystemUtility = require('fs'); // Import the file system module.

// Define the path for reading standard input, which is common in competitive programming.
const standardInputLocation = '/dev/stdin';

/**
 * Main function to process numbers based on specific criteria.
 * It reads a numerical upper limit from stdin, then identifies and prints
 * numbers between 3 and this limit that are either divisible by 3
 * or contain the digit '3'.
 */
function generateFilteredNumberSequence() {
    // --- Data Acquisition and Initial Processing ---
    // Read the raw content from the specified input source.
    const rawInputContent = fileSystemUtility.readFileSync(standardInputLocation, 'utf8');

    // Clean up the raw input by removing leading/trailing whitespace.
    const sanitizedInputString = rawInputContent.trim();

    // Attempt to convert the cleaned string into an integer.
    // The unary plus operator (`+`) is a concise way to convert to a number.
    const processedNumericLimit = +sanitizedInputString;

    // --- Input Validation and Guard Clauses ---
    // Check if the conversion resulted in a valid, finite number.
    if (isNaN(processedNumericLimit) || !Number.isFinite(processedNumericLimit)) {
        console.error("Error: The provided input must be a valid finite number.");
        process.exit(1); // Exit with an error code.
    }

    // Ensure the upper limit is at least 3, as our iteration starts from 3.
    if (processedNumericLimit < 3) {
        console.log(""); // If the limit is too low, no numbers will be processed, so print an empty line.
        process.exit(0); // Exit successfully, as no numbers meet criteria.
    }

    // --- Core Logic: Iteration and Filtering ---
    // Initialize an array to store all numbers that satisfy our conditions.
    // Using an array and then joining is typically more efficient for large sequences
    // than repeated string concatenation.
    const qualifyingNumbersCollection = [];

    // Begin iteration from the starting value of 3.
    let currentEvaluatedNumber = 3;

    // Loop as long as the current number does not exceed the determined upper limit.
    while (currentEvaluatedNumber <= processedNumericLimit) {
        // Determine if the number is perfectly divisible by 3.
        const isDivisibleByThree = (currentEvaluatedNumber % 3 === 0);

        // Convert the current number to its string representation to check for the digit '3'.
        const numberAsString = String(currentEvaluatedNumber);
        const containsDigitThree = numberAsString.includes('3');

        // Apply the combined logic:
        // A number qualifies if it's divisible by 3 OR (it's NOT divisible by 3 AND it contains the digit '3').
        const meetsInclusionCriteria = isDivisibleByThree || (!isDivisibleByThree && containsDigitThree);

        // If the current number meets the criteria, add it to our collection.
        if (meetsInclusionCriteria) {
            qualifyingNumbersCollection.push(currentEvaluatedNumber);
        }

        // Increment the counter to move to the next number in the sequence.
        currentEvaluatedNumber++;
    }

    // --- Result Formatting and Output ---
    // Join all collected numbers into a single string, separated by a space.
    // If the collection is empty, this will result in an empty string.
    const finalFormattedOutput = qualifyingNumbersCollection.join(' ');

    // Print the final string to the console.
    console.log(finalFormattedOutput);
}

// Execute the main function to start the process.
generateFilteredNumberSequence();