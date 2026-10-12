'use strict';

function processInputAndQueries(rawData) {
    const lineSegments = rawData.split('\n');
    const primaryString = lineSegments[1];
    const queryInstructions = lineSegments.slice(2);

    queryInstructions.forEach(currentInstruction => {
        const boundaryValues = currentInstruction.split(' ').map(Number);
        const startIndex = boundaryValues[0] - 1;
        const endIndex = boundaryValues[1];
        const targetSegment = primaryString.slice(startIndex, endIndex);

        const countOfAC = (targetSegment.match(/AC/g) || []).length;
        console.log(countOfAC);
    });
}

processInputAndQueries(require("fs").readFileSync("/dev/stdin", "utf8"));
