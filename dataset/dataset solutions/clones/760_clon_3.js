const sourceDataContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// If the input stream is entirely empty or just whitespace, terminate.
if (!sourceDataContent.trim()) {
    process.exit(0);
}

// Split the content into individual data records.
const dataRecordLines = sourceDataContent.trim().split('\n');

let processedEntryCounter = 0; // Tracks successfully processed data sets.
let currentRecordIndex = 0;    // Iteration index for the data records.

// Process each data record line by line.
while (currentRecordIndex < dataRecordLines.length) {
    const activeDataLine = dataRecordLines[currentRecordIndex++];

    // Skip any blank lines that might occur in the input.
    if (!activeDataLine.trim()) {
        continue;
    }

    // Parse the numbers from the current line, splitting by any whitespace.
    const numericTokens = activeDataLine.split(/\s+/).map(Number);

    // Validate that the line contains valid numbers and has at least the expected count.
    if (numericTokens.length === 0 || isNaN(numericTokens[0])) {
        continue; // Skip malformed lines.
    }

    // The first number in the line indicates the quantity of subsequent elements.
    const declaredElementQuantity = numericTokens[0];

    // Define acceptable bounds for the element quantity.
    const MINIMUM_ELEMENTS_FOR_DIFFERENCE = 2;
    const MAXIMUM_ELEMENTS_ALLOWED = 1000;

    // Enforce quantity constraints.
    if (declaredElementQuantity < MINIMUM_ELEMENTS_FOR_DIFFERENCE || declaredElementQuantity > MAXIMUM_ELEMENTS_ALLOWED) {
        continue; // Skip if quantity is out of specified range.
    }

    // Verify that enough numeric tokens are present for the declared quantity.
    // (declaredQuantity + 1) because the first token is the quantity itself.
    if (numericTokens.length < declaredElementQuantity + 1) {
        continue; // Skip if insufficient data is provided.
    }

    // Extract the actual sequence of numbers to be analyzed.
    const numberSequenceToAnalyze = numericTokens.slice(1, declaredElementQuantity + 1);

    // Initialize the smallest absolute difference found so far to a very large value.
    let smallestAbsoluteDifference = Infinity;

    // Use nested loops to compare every unique pair of numbers in the sequence.
    // The outer loop iterates from the first element up to the second-to-last.
    for (let primaryIndex = 0; primaryIndex < declaredElementQuantity; primaryIndex++) {
        // The inner loop starts from the element immediately following the primaryIndex
        // to avoid duplicate comparisons (e.g., (A,B) and (B,A)) and self-comparison.
        for (let secondaryIndex = primaryIndex + 1; secondaryIndex < declaredElementQuantity; secondaryIndex++) {
            // Calculate the absolute difference between the two current elements.
            const currentPairAbsoluteDifference = Math.abs(
                numberSequenceToAnalyze[primaryIndex] - numberSequenceToAnalyze[secondaryIndex]
            );

            // Update smallestAbsoluteDifference if the current difference is smaller.
            if (currentPairAbsoluteDifference < smallestAbsoluteDifference) {
                smallestAbsoluteDifference = currentPairAbsoluteDifference;
            }
        }
    }

    // If a valid smallest difference was found (i.e., not still Infinity), output it.
    if (smallestAbsoluteDifference !== Infinity) {
        console.log(smallestAbsoluteDifference);
        processedEntryCounter++; // Increment the counter for successfully processed entries.
    }
    // No explicit else for `Infinity` case, as it implies an issue with data or logic
    // which should ideally not happen with valid input and elementQuantity >= 2.
}