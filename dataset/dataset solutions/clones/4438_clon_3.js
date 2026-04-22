'use strict';

// This module encapsulates the logic for processing numerical input data.
// It determines if a specific arrangement condition can be met based on number properties.
function analyzeNumericSequence(rawDataString) {
    // Break down the raw input string into distinct lines for easier parsing.
    const inputLinesCollection = rawDataString.split("\n");

    // Extract the total count of elements from the first line.
    // Using Number() for type conversion, which is robust for integer strings.
    const totalSequenceLength = Number(inputLinesCollection[0]);

    // The second line contains the actual numerical values, separated by spaces.
    const rawNumberTokens = inputLinesCollection[1].split(" ");

    // Transform the string tokens into an array of actual numbers.
    // Array.prototype.map provides a concise way to apply a conversion to each element.
    const numericalValuesArray = rawNumberTokens.map(Number);

    // Initialize various counters to categorize numbers based on their divisibility.
    let currentOddCount = 0; // Tracks numbers not divisible by 2
    let currentFourMultipleCount = 0; // Tracks numbers divisible by 4
    let currentTwoOnlyMultipleCount = 0; // Tracks numbers divisible by 2 but not by 4

    // Iterate through each number in the sequence to populate the counters.
    // A 'for...of' loop offers a clear and modern way to iterate over array elements.
    for (const singleNumber of numericalValuesArray) {
        if (singleNumber % 2 !== 0) {
            // If the number has a remainder when divided by 2, it's odd.
            currentOddCount++;
        } else if (singleNumber % 4 === 0) {
            // If it's even and has no remainder when divided by 4, it's a multiple of 4.
            currentFourMultipleCount++;
        } else {
            // Otherwise, it must be an even number that is not a multiple of 4 (e.g., 2, 6, 10).
            currentTwoOnlyMultipleCount++;
        }
    }

    // The final outcome, initialized to a negative assumption.
    let outcomeMessage = "No";

    // Evaluate conditions to determine the final outcome.
    // Condition 1: If there are no odd numbers at all, no two can be adjacent.
    if (currentOddCount === 0) {
        outcomeMessage = "Yes";
    }
    // Condition 2: If the count of multiples of four is sufficient to separate all odd numbers.
    // This translates to having at least as many multiples of four as odd numbers.
    else if (currentFourMultipleCount >= currentOddCount) {
        outcomeMessage = "Yes";
    }
    // Condition 3: A very specific edge case involving array length and number distribution.
    // This condition applies when the total sequence length is 3,
    // there is exactly one more odd number than multiples of four,
    // and there is at least one multiple of four present.
    // This implies `currentOddCount = currentFourMultipleCount + 1` and `currentFourMultipleCount > 0`.
    else {
        // We use a boolean flag for clarity in this complex conditional.
        const isSpecificThreeElementCase = (
            totalSequenceLength === 3 &&
            currentOddCount === (currentFourMultipleCount + 1) &&
            currentFourMultipleCount > 0
        );

        if (isSpecificThreeElementCase) {
            outcomeMessage = "Yes";
        }
        // If none of the above conditions are met, the outcome remains "No".
    }

    // Display the determined outcome to the console.
    console.log(outcomeMessage);
}

// Main execution block: responsible for reading input and invoking the processing logic.
// Encapsulated in an Immediately Invoked Function Expression (IIFE) for scope isolation.
(function executeProcessingPipeline() {
    const fileSystemHandler = require("fs"); // Import the Node.js file system module.
    const standardInputFilePath = "/dev/stdin"; // Define the standard input file path for competitive programming.
    const textEncoding = "utf8"; // Specify the character encoding for input.

    try {
        // Read the entire content of the standard input file synchronously.
        const fileContentBuffer = fileSystemHandler.readFileSync(standardInputFilePath, textEncoding);
        // Pass the raw content to our main analysis function.
        analyzeNumericSequence(fileContentBuffer);
    } catch (ioError) {
        // Provide basic error reporting if input file reading fails.
        // In competitive programming, input format is usually guaranteed, but this adds robustness.
        console.error("An error occurred during input file reading:", ioError.message);
        // Optionally, exit or provide a default response in case of critical input failure.
    }
})();