"use strict";

// This function parses a string containing space-separated numbers
// and returns an array of those numbers.
// It avoids using the standard .split(' ').map(Number) pattern and handles internal whitespace.
function parseNumberString(inputStringContent) {
    let currentNumberBuffer = '';
    const parsedNumbersArray = [];
    const contentCharacterCount = inputStringContent.length;
    let insideNumber = false;

    for (let charPointer = 0; charPointer < contentCharacterCount; charPointer++) {
        const character = inputStringContent[charPointer];
        // Check if character is a digit or a sign (assuming integers for this problem)
        if ((character >= '0' && character <= '9') || character === '-') {
            currentNumberBuffer += character;
            insideNumber = true;
        } else { // It's a non-numeric character (space, tab, newline, etc.)
            if (insideNumber) { // If we just finished collecting digits for a number
                parsedNumbersArray.push(Number(currentNumberBuffer));
                currentNumberBuffer = '';
                insideNumber = false;
            }
            // If not insideNumber, it's just whitespace between numbers or leading/trailing whitespace
        }
    }
    // Add the last number if the string ends with a number
    if (insideNumber) {
        parsedNumbersArray.push(Number(currentNumberBuffer));
    }
    return parsedNumbersArray;
}

// Implements a simple descending sort algorithm (Selection Sort)
function arrangeElementsDescending(dataCollection) {
    const mutableCollection = [...dataCollection]; // Work on a copy to avoid side effects
    const collectionItemCount = mutableCollection.length;

    for (let outerIterator = 0; outerIterator < collectionItemCount - 1; outerIterator++) {
        let maximumElementIndex = outerIterator;
        for (let innerIterator = outerIterator + 1; innerIterator < collectionItemCount; innerIterator++) {
            if (mutableCollection[innerIterator] > mutableCollection[maximumElementIndex]) {
                maximumElementIndex = innerIterator;
            }
        }
        // Swap if the maximum element is not at the current position
        if (maximumElementIndex !== outerIterator) {
            const temporaryStorage = mutableCollection[outerIterator];
            mutableCollection[outerIterator] = mutableCollection[maximumElementIndex];
            mutableCollection[maximumElementIndex] = temporaryStorage;
        }
    }
    return mutableCollection;
}

// Orchestrates the data processing and final computation based on the problem's logic
function executeProcessingAndCalculation(inputPayload) {
    const rawInputLines = inputPayload.split(/\r?\n/); // Splitting by newline remains fundamental

    // Manually extract and trim the first two non-empty lines
    let firstSignificantLine = '';
    let secondSignificantLine = '';
    let foundFirstLine = false;

    for (const currentLineCandidate of rawInputLines) {
        let lineTrimmedManually = '';
        let startIndex = 0;
        let endIndex = currentLineCandidate.length - 1;
        while (startIndex <= endIndex && (currentLineCandidate[startIndex] === ' ' || currentLineCandidate[startIndex] === '\t' || currentLineCandidate[startIndex] === '\n' || currentLineCandidate[startIndex] === '\r')) {
            startIndex++;
        }
        while (endIndex >= startIndex && (currentLineCandidate[endIndex] === ' ' || currentLineCandidate[endIndex] === '\t' || currentLineCandidate[endIndex] === '\n' || currentLineCandidate[endIndex] === '\r')) {
            endIndex--;
        }
        if (startIndex <= endIndex) {
            lineTrimmedManually = currentLineCandidate.substring(startIndex, endIndex + 1);
        }

        if (lineTrimmedManually.length > 0) {
            if (!foundFirstLine) {
                firstSignificantLine = lineTrimmedManually;
                foundFirstLine = true;
            } else {
                secondSignificantLine = lineTrimmedManually;
                break; // We've found both relevant lines
            }
        }
    }

    const primaryQuantity = Number(firstSignificantLine); // Corresponds to N
    const numericDataSequence = parseNumberString(secondSignificantLine); // Corresponds to A

    const sortedNumericData = arrangeElementsDescending(numericDataSequence);

    const iterationUpperBoundary = primaryQuantity * 3;

    // Utilize a functional approach (reduce) for selective summation
    const finalComputedSum = sortedNumericData.reduce((currentAccumulator, currentDataItem, dataItemIndex) => {
        // Original logic: sum A[i] where i is even, starting from index 2, up to N*3 - 1
        if (dataItemIndex >= 2 && dataItemIndex < iterationUpperBoundary && dataItemIndex % 2 === 0) {
            return currentAccumulator + currentDataItem;
        }
        return currentAccumulator;
    }, 0); // Initialize sum to zero

    return finalComputedSum;
}

// Entry point function to simulate the execution environment
function programEntry(sourceData) {
    const calculatedResult = executeProcessingAndCalculation(sourceData);
    console.log(calculatedResult);
}

programEntry(require("fs").readFileSync("/dev/stdin", "utf8"));