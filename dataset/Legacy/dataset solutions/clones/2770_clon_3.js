"use strict";

const NEWLINE_DELIMITER = "\n";
const MULTIPLIER_VALUE = 2;

// Helper function to safely parse a string into an integer with a radix
const parseStringAsInteger = (inputString) => {
    return parseInt(inputString, 10);
};

// Helper function to process a line of space-separated numbers
const processNumericLine = (lineContent) => {
    const stringComponents = lineContent.split(" ");
    return stringComponents.map(component => parseStringAsInteger(component) * MULTIPLIER_VALUE);
};

const executeMainLogic = (rawInputData) => {
    // Prepare input by trimming and splitting into individual lines
    const inputLines = rawInputData.trim().split(NEWLINE_DELIMITER);

    // Extract the total count of items from the first line
    const totalItemCount = parseStringAsInteger(inputLines[0]);

    // Parse and transform the second line of input values
    const transformedValues = processNumericLine(inputLines[1]);
    
    let cumulativeAlternatingSum = 0;
    let currentCoefficient = 1; // Starts positive for the last element
    
    // Calculate the alternating sum: transformedValues[N-1] - transformedValues[N-2] + ... + (-1)^(N-1) * transformedValues[0]
    // This loop computes the same final value as the original's 'offset' variable.
    for (let elementIndex = totalItemCount - 1; elementIndex >= 0; elementIndex--) {
        cumulativeAlternatingSum += currentCoefficient * transformedValues[elementIndex];
        currentCoefficient *= -1; // Flip the sign for the next term
    }
    
    // Determine the initial element of the resulting sequence
    const firstCalculatedElement = cumulativeAlternatingSum / MULTIPLIER_VALUE;
    
    let currentCalculatedElement = firstCalculatedElement;
    
    const finalResultSequence = [];
    
    // Construct the full sequence of calculated elements
    for (let elementIndex = 0; elementIndex < totalItemCount; elementIndex++) {
        finalResultSequence.push(currentCalculatedElement);
        const correspondingTransformedValue = transformedValues[elementIndex]; // Introduce helper variable
        currentCalculatedElement = correspondingTransformedValue - currentCalculatedElement;
    }
    
    // Output the sequence as a space-separated string
    console.log(finalResultSequence.join(" "));
};

// Entry point for execution, reading from standard input
executeMainLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
