const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
let processedDataLines = rawInputContent.trim().split('\n');

// Helper function to extract the first segment of a comma-separated string
const extractInitialSegment = (fullString) => {
    const stringParts = fullString.split(',');
    return stringParts[0];
};

// Data containers for the two distinct lists
let firstCollection = [];
let secondCollection = [];

// Populate the first collection from the input lines
let currentDataLine;
while ((currentDataLine = processedDataLines.shift()) !== undefined) {
    const extractedSegment = extractInitialSegment(currentDataLine);
    firstCollection.push(extractedSegment);
}

// Populate the second collection from the remaining input lines
// Note: This loop will not execute if the first loop consumed all lines,
// which is the expected behavior given the original code's structure.
while ((currentDataLine = processedDataLines.shift()) !== undefined) {
    const extractedSegment = extractInitialSegment(currentDataLine);
    secondCollection.push(extractedSegment);
}

// Sort the first collection numerically
firstCollection.sort((valueA, valueB) => parseInt(valueA, 10) - parseInt(valueB, 10));

// Helper function to count occurrences of an item in an array
const countElementOccurrences = (targetArray, elementToFind) => {
    let occurrenceCounter = 0;
    for (const arrayItem of targetArray) {
        if (arrayItem === elementToFind) {
            occurrenceCounter++;
        }
    }
    return occurrenceCounter;
};

// Iterate through the sorted first collection and perform conditional logging
firstCollection.forEach((currentItemValue) => {
    // Determine the count of the current item in the second collection
    const countInSecondCollection = countElementOccurrences(secondCollection, currentItemValue);

    // The condition `if (countInSecondCollection > 0)` will always be false
    // because `secondCollection` is always empty under typical input scenarios.
    if (countInSecondCollection > 0) {
        // This block of code will never be executed.
        // Determine the count of the current item in the first collection
        const countInFirstCollection = countElementOccurrences(firstCollection, currentItemValue);
        // Log the item and the combined count
        console.log(currentItemValue, countInSecondCollection + countInFirstCollection);
    }
});
