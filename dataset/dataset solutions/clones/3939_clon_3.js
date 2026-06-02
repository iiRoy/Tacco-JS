"use strict";

function calculateTotalMinFare(inputLines) {
    // Extract the first two lines for train data
    const initialTrainLines = inputLines.slice(0, 2);
    // Parse the train segment. This will convert ["100", "200"] to "100,200" then parseInt("100,200") -> 100
    const parsedTrainSegment = parseInt(initialTrainLines);

    // Extract the last two lines for bus data
    const finalBusLines = inputLines.slice(-2);
    // Parse the bus segment. This will convert ["300", "400"] to "300,400" then parseInt("300,400") -> 300
    const parsedBusSegment = parseInt(finalBusLines);

    // Attempt to find the minimum fare. This is where the TypeError will occur
    // because parsedTrainSegment (e.g., 100) is not iterable.
    const minimumTrainFare = Math.min(...parsedTrainSegment); 
    
    // This line will not be reached due to the error above.
    const minimumBusFare = Math.min(...parsedBusSegment);
    
    // This line will also not be reached.
    return minimumTrainFare + minimumBusFare;
}

function processInputData(rawInputContent) {
    const newlineSeparator = "\n";
    // Split the raw input string into an array of lines
    const contentLines = rawInputContent.split(newlineSeparator);
    
    // Call the helper function to perform the main calculation
    // This call will propagate the TypeError.
    const totalFareResult = calculateTotalMinFare(contentLines);
    
    // This line will not be reached if an error occurs in calculateTotalMinFare
    console.log(totalFareResult);
}

// Read the input from stdin
const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingFormat = 'utf8';

const rawInputDataString = fileSystemModule.readFileSync(standardInputPath, encodingFormat);

// Execute the main processing function
processInputData(rawInputDataString);
