"use strict";

// This function processes the input string to calculate the minimum travel cost.
const processInput = inputData => {
    // Split the entire input string by newline characters to get individual lines.
    inputData = inputData.split("\n");

    // Parse the first line to get the total number of elements (totalElements)
    // and the length of the segment (segmentLength).
    const totalElements = parseInt(inputData[0].split(" ")[0]);
    const segmentLength = parseInt(inputData[0].split(" ")[1]);

    // Parse the second line to get an array of integer positions.
    const elementPositions = inputData[1].split(" ").map(strVal => parseInt(strVal));

    // Initialize an array to store the calculated travel distances for each segment.
    const calculatedDistances = [];

    // Iterate through all possible segments of length 'segmentLength'.
    // The loop runs from the first element up to the point where a full segment can still be formed.
    for (let currentIdx = 0; currentIdx <= totalElements - segmentLength; currentIdx++) {
        // Determine the leftmost and rightmost coordinates of the current segment.
        const currentLeft = elementPositions[currentIdx];
        const currentRight = elementPositions[~~currentIdx + segmentLength - 1]; // ~~ is a fast Math.floor for positive integers

        // Calculate the travel cost based on which end is closer to zero.
        // If the absolute value of the left coordinate is smaller, start from left.
        if (Math.abs(currentLeft) < Math.abs(currentRight)) {
            // Path: 0 -> currentLeft -> currentRight
            calculatedDistances.push(Math.abs(currentLeft) + Math.abs(currentRight - currentLeft));
        } else {
            // Path: 0 -> currentRight -> currentLeft
            // If the absolute value of the right coordinate is smaller or equal, start from right.
            calculatedDistances.push(Math.abs(currentRight) + Math.abs(currentRight - currentLeft));
        }
    }

    // Output the minimum travel distance found among all segments.
    console.log(Math.min(...calculatedDistances));
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
