"use strict";

const parseNumbersFromString = (inputStringSegment) => {
    return inputStringSegment.split(" ").map(numericStr => parseInt(numericStr, 10));
};

const processInputData = (rawInputContent) => {
    const contentLines = rawInputContent.split("\n");

    const [totalElements, windowLength] = parseNumbersFromString(contentLines[0]);
    
    const coordinateValues = parseNumbersFromString(contentLines[1]);
    
    const computedPathDistances = [];
    
    const maxWindowStartIdx = totalElements - windowLength;

    for (let currentWindowStart = 0; currentWindowStart <= maxWindowStartIdx; currentWindowStart++) {
        const windowLeftmostCoord = coordinateValues[currentWindowStart];
        const windowRightmostCoord = coordinateValues[currentWindowStart + windowLength - 1];
        
        const absLeftCoord = Math.abs(windowLeftmostCoord);
        const absRightCoord = Math.abs(windowRightmostCoord);
        
        const distanceBetweenEnds = Math.abs(windowRightmostCoord - windowLeftmostCoord);
        
        // The optimal path involves going to the closer end of the window first,
        // then traversing the distance between the two ends.
        // This is equivalent to min(abs(left), abs(right)) + abs(right - left).
        const currentWindowTotalDistance = Math.min(absLeftCoord, absRightCoord) + distanceBetweenEnds;
        
        computedPathDistances.push(currentWindowTotalDistance);
    }
    
    console.log(Math.min(...computedPathDistances));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
