'use strict';

// This module defines a function to compute the minimum travel distance.
const processInputData = (rawInputContent) => {
    // Divide the entire input string into individual lines.
    rawInputContent = rawInputContent.split('\n');

    // Extract the first line which contains N and K values.
    const firstLineComponents = rawInputContent[0].split(' ');
    const totalItemCount = parseInt(firstLineComponents[0], 10); // Represents N
    const subGroupLength = parseInt(firstLineComponents[1], 10);   // Represents K

    // Parse the second line to get the array of integer coordinates.
    const coordinateValueList = rawInputContent[1].split(' ').map(singleValue => parseInt(singleValue, 10));

    // Initialize the variable to store the smallest calculated distance.
    // A very large number is used as an initial upper bound.
    let shortestCalculatedPath = 1e11; // Equivalent to 100,000,000,000

    // Iterate through all possible contiguous sub-arrays of 'subGroupLength' elements.
    for (let currentStartingIndex = 0; currentStartingIndex <= coordinateValueList.length - subGroupLength; currentStartingIndex++) {
        // Obtain the current segment of coordinates for evaluation.
        const currentCoordinateSegment = coordinateValueList.slice(currentStartingIndex, subGroupLength + currentStartingIndex);

        // Determine the path length if the journey begins from the leftmost point of the segment.
        // The path involves going from 0 to the first point, then to the last point.
        const segmentFirstPoint = currentCoordinateSegment[0];
        const segmentLastPoint = currentCoordinateSegment[currentCoordinateSegment.length - 1];
        let pathStartingLeft = Math.abs(segmentFirstPoint) + Math.abs(segmentLastPoint - segmentFirstPoint);

        // Update the minimum path if the current path is shorter.
        if (shortestCalculatedPath > pathStartingLeft) {
            shortestCalculatedPath = pathStartingLeft;
        }

        // Determine the path length if the journey begins from the rightmost point of the segment.
        // The path involves going from 0 to the last point, then to the first point.
        let pathStartingRight = Math.abs(segmentLastPoint) + Math.abs(segmentLastPoint - segmentFirstPoint);

        // Update the minimum path if this alternative path is shorter.
        if (shortestCalculatedPath > pathStartingRight) {
            shortestCalculatedPath = pathStartingRight;
        }
    }

    // Print the final minimum travel distance to standard output.
    console.log(shortestCalculatedPath);
};

// Read the input from standard input and invoke the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf-8'));
