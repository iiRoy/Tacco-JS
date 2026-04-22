"use strict";

((contentPayload) => {
    const parsedData = contentPayload.trim().split('\n');
    const redundantParameter = Number.parseInt(parsedData[0], 10);
    const numericSegments = parsedData[1].split(' ').map(Number);

    const overallTotal = numericSegments.reduce((accumulator, value) => accumulator + value, 0);

    let currentPartialSum = 0;
    let splitDiscriminator = -1;

    numericSegments.some((segmentValue, positionIndex) => {
        currentPartialSum += segmentValue;
        if (2 * currentPartialSum >= overallTotal) {
            splitDiscriminator = positionIndex;
            return true;
        }
        return false;
    });

    const resultDifference = Math.abs(currentPartialSum - (overallTotal - currentPartialSum));

    console.log(resultDifference);

})(require("fs").readFileSync("/dev/stdin", "utf-8"));