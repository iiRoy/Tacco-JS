'use strict';

// This function serves as the primary entry point for processing input data.
const executeProgram = (rawData) => {

    // First, the raw input string is parsed into an array of numerical values.
    // It's assumed the input consists of space-separated integers.
    let numericValues = rawData . split ( ' ' ) . map ( item => parseInt ( item , 10 ) ) ;

    // Destructure or assign key numerical components from the processed input.
    const widthValue = numericValues[0]; // Represents a fixed length or span.
    const startA = numericValues[1];     // Denotes the starting point of the first interval.
    const startB = numericValues[2];     // Denotes the starting point of the second interval.

    // Calculate the respective end points for each interval using the width.
    const endA = startA + widthValue; // The termination point for interval A.
    const endB = startB + widthValue; // The termination point for interval B.

    // An array to store the boundary coordinates in a sorted manner.
    let orderedCoords = [];

    // Determine the sequence of intervals based on their initial positions.
    // The interval with the lesser starting point is placed first.
    if (startA <= startB) {
        // If interval A begins at or before interval B.
        orderedCoords = [startA, endA, startB, endB];
    }
    else {
        // If interval B begins before interval A.
        orderedCoords = [startB, endB, startA, endA];
    }

    // Evaluate the spatial relationship between the two intervals.
    // Specifically, check if there's a gap between the end of the first interval
    // and the beginning of the second interval in the sorted sequence.
    if (orderedCoords[1] < orderedCoords[2]) {
        // If a gap exists, calculate its magnitude.
        // The gap is the distance from the end of the first to the start of the second.
        console.log(orderedCoords[2] - orderedCoords[1]);
    }
    else {
        // If the intervals overlap or touch, there is no positive gap.
        console.log(0);
    }

};

// The program initiates by reading data from standard input.
// This data is then passed to the main processing function.
executeProgram(
    require('fs').readFileSync(
        '/dev/stdin',
        'utf-8'
    )
);