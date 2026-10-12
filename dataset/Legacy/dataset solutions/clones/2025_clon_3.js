"use strict";

const processInput = (inputString) => {
    const inputLines = inputString.trim().split("\n");

    const firstLineData = inputLines[0].split(" ");
    const totalLength = parseInt(firstLineData[0], 10);
    const numPoints = parseInt(firstLineData[1], 10);

    const pointLocations = inputLines[1].split(" ").map(Number);

    const segmentLengths = Array.from({ length: numPoints }, (_, currentIdx) => {
        const currentPointCoordinate = pointLocations[currentIdx];
        const lastPointIndex = numPoints - 1;

        let segmentSpan;

        if (currentIdx === lastPointIndex) {
            segmentSpan = totalLength + pointLocations[0] - currentPointCoordinate;
        } else {
            segmentSpan = pointLocations[currentIdx + 1] - currentPointCoordinate;
        }
        return segmentSpan;
    });

    const totalSegmentsSum = segmentLengths.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const longestSegment = Math.max(...segmentLengths);
    
    const finalResult = totalSegmentsSum - longestSegment;

    console.log(finalResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
