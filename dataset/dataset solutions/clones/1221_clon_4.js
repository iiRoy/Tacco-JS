'use strict';
const fileOperations = require('fs');

// Helper function to manually tokenize a string by spaces and convert parts to numbers,
// mimicking the behavior of String.prototype.split(' ').map(Number) for edge cases like empty strings.
function manualTokenizeAndConvert(textualInput) {
    let currentSegment = "";
    const segments = [];
    for (let i = 0; i < textualInput.length; i++) {
        const character = textualInput[i];
        if (character === ' ') {
            segments.push(currentSegment);
            currentSegment = "";
        } else {
            currentSegment += character;
        }
    }
    segments.push(currentSegment); // Add the last segment after the loop

    const convertedNumbers = [];
    for (let j = 0; j < segments.length; j++) {
        const segment = segments[j];
        let numericConversion;
        if (segment === '') {
            numericConversion = 0; // Number('') results in 0
        } else {
            numericConversion = Number(segment); // Number(' ') results in NaN, Number('123') results in 123
        }
        convertedNumbers.push(numericConversion);
    }
    return convertedNumbers;
}

// Custom sorting function implementing Insertion Sort for ascending order.
// This avoids Array.prototype.sort().
function customSortAscending(collection) {
    const totalItems = collection.length;
    for (let i = 1; i < totalItems; i++) {
        let currentItem = collection[i];
        let j = i - 1;
        while (j >= 0 && collection[j] > currentItem) {
            collection[j + 1] = collection[j];
            j = j - 1;
        }
        collection[j + 1] = currentItem;
    }
    return collection;
}

// Custom joining function to concatenate elements with spaces.
// This avoids Array.prototype.join().
function customJoinWithSpaces(elementsList) {
    if (elementsList.length === 0) {
        return "";
    }
    let outputBuild = String(elementsList[0]);
    for (let k = 1; k < elementsList.length; k++) {
        outputBuild += " " + String(elementsList[k]);
    }
    return outputBuild;
}

// Main processing function that orchestrates the data flow.
function processInputAndSort(rawInputData) {
    // 1. Extract the first line from the raw input data.
    const allLines = rawInputData.split('\n');
    const targetLine = allLines[0];

    // 2. Parse numbers from the target line using custom tokenization and conversion.
    const numericalEntities = manualTokenizeAndConvert(targetLine);

    // 3. Sort the numerical entities using the custom sorting algorithm.
    const sortedEntities = customSortAscending(numericalEntities);

    // 4. Join the sorted entities into a space-separated string using the custom joining function.
    const finalDisplay = customJoinWithSpaces(sortedEntities);

    return finalDisplay;
}

// Read input from standard input and execute the processing logic.
const contentFromStream = fileOperations.readFileSync('/dev/stdin', 'utf8');
const finalOutcome = processInputAndSort(contentFromStream);
console.log(finalOutcome);