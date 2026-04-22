const fileSystemModule = require('fs'); // Module for file system operations
const standardInputPath = '/dev/stdin'; // Constant for the standard input file path

// Function to retrieve and parse numerical data from the specified path
function obtainAndProcessNumericInput(sourcePath) {
    try {
        // Read the entire file content as a UTF-8 string
        const rawTextContent = fileSystemModule.readFileSync(sourcePath, 'utf8');
        // Clean up whitespace, split into lines, filter out empty lines, and convert each line to an integer
        // Using parseInt with radix 10 for explicit base conversion
        return rawTextContent.trim().split(/\s*\n\s*/).filter(line => line.length > 0).map(item => parseInt(item, 10));
    } catch (operationError) {
        // Log an error if reading or parsing fails
        console.error(`Data acquisition failure from ${sourcePath}: ${operationError.message}`);
        // Return an empty array to prevent further processing with invalid data
        return [];
    }
}

// Utility function to propagate a value backward in an array
// It replaces elements with 'fillValue' from 'startPosition' backward
// until it finds an element already equal to 'fillValue' or reaches the array's beginning.
function applyBackwardPropagation(targetCollection, fillValue, startPosition) {
    let currentBackwardIndex = startPosition;
    // Loop while within array bounds and the current element doesn't match the fill value
    while (currentBackwardIndex >= 0 && targetCollection[currentBackwardIndex] !== fillValue) {
        targetCollection[currentBackwardIndex] = fillValue; // Replace element
        currentBackwardIndex--; // Move to the previous element
    }
}

// Main execution block: process multiple sets of numbers
const allInputNumbers = obtainAndProcessNumericInput(standardInputPath); // Holds all numbers from input
let inputReadPosition = 0; // Tracks the current position in the 'allInputNumbers' array

// Loop as long as there are numbers left to process and the current set size is not zero
while (inputReadPosition < allInputNumbers.length) {
    // The first number of each set indicates its size
    const currentDataSetSize = allInputNumbers[inputReadPosition];
    inputReadPosition++; // Advance past the set size indicator

    // If the set size is zero, it's a termination signal
    if (currentDataSetSize === 0) {
        break; // Exit the main processing loop
    }

    // Guard clause: Ensure enough elements exist for the declared set size
    if (inputReadPosition + currentDataSetSize > allInputNumbers.length) {
        console.warn(`Incomplete data detected: Expected ${currentDataSetSize} elements but only ${allInputNumbers.length - inputReadPosition} remain. Terminating further processing.`);
        break; // Stop processing if input is exhausted prematurely
    }

    let processedSequence = []; // Array to store processed elements for the current set
    let isOddNumberedIteration = false; // Flag to alternate processing logic; initialized for the first data element to be "even" (false after toggle)

    // Iterate through each element of the current data set
    for (let elementCounter = 0; elementCounter < currentDataSetSize; ++elementCounter) {
        const currentDataValue = allInputNumbers[inputReadPosition]; // Get the next value from input
        inputReadPosition++; // Move to the next input number

        isOddNumberedIteration = !isOddNumberedIteration; // Toggle the state for alternating behavior

        // Apply distinct logic based on the iteration's parity (after toggle)
        if (isOddNumberedIteration) {
            // For odd-numbered logical iterations (1st, 3rd, 5th, etc.)
            processedSequence.push(currentDataValue);
        } else {
            // For even-numbered logical iterations (2nd, 4th, 6th, etc.)
            const lastProcessedElement = processedSequence[processedSequence.length - 1]; // Cache the last element for comparison

            if (lastProcessedElement === currentDataValue) {
                // If the new value matches the last one, simply append it
                processedSequence.push(currentDataValue);
            } else {
                // If values differ, append the new value and then perform backward propagation
                processedSequence.push(currentDataValue);
                // The propagation starts from the element before the newly added one
                applyBackwardPropagation(processedSequence, currentDataValue, processedSequence.length - 2);
            }
        }
    }

    // After processing all elements in the current set, count occurrences of zero
    let zeroOccurrenceCount = 0;
    // Use a 'for...of' loop for iterating over array elements
    for (const sequenceElement of processedSequence) {
        if (sequenceElement === 0) {
            zeroOccurrenceCount++; // Increment counter for each zero found
        }
    }

    // Output the total count of zeros for the current data set
    console.log(zeroOccurrenceCount);
}