"use strict";

const parseNumericValue = (valueString) => {
    return parseInt(valueString, 10);
};

const processInput = (rawData) => {
    const inputLines = rawData.trim().split("\n");

    const firstLineSegments = inputLines[0].split(" ");
    const arraySize = parseNumericValue(firstLineSegments[0]);
    const windowLength = parseNumericValue(firstLineSegments[1]);

    const numericArray = inputLines[1].split(" ").map(parseNumericValue);

    let currentProduct = 1;
    const productSequence = [];

    // Calculate the product for the initial window
    for (let currentIdx = 0; currentIdx < windowLength; currentIdx++) {
        currentProduct *= numericArray[currentIdx];
    }
    productSequence.push(currentProduct);

    // Slide the window and update the product
    for (let currentIdx = windowLength; currentIdx < arraySize; currentIdx++) {
        const elementToDivideOutIdx = currentIdx - windowLength;
        const elementToMultiplyInIdx = currentIdx;

        currentProduct /= numericArray[elementToDivideOutIdx];
        currentProduct *= numericArray[elementToMultiplyInIdx];
        
        productSequence.push(currentProduct);
    }

    const comparisonResults = [];
    const sequenceLength = productSequence.length;

    // Compare adjacent products in the sequence
    for (let currentIdx = 1; currentIdx < sequenceLength; currentIdx++) {
        const currentWindowProduct = productSequence[currentIdx];
        const previousWindowProduct = productSequence[currentIdx - 1];

        const comparisonOutcome = (currentWindowProduct <= previousWindowProduct) ? "No" : "Yes";
        comparisonResults.push(comparisonOutcome);
    }
    
    console.log(comparisonResults.join("\n"));
};

(() => {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    processInput(fileContent);
})();
