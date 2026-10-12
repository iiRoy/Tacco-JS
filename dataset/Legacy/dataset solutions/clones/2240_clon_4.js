"use strict"

const processInputData = (rawData) => {
    const allLines = rawData.trim().split('\n');
    const initialRobotCount = Number(allLines[0]);
    const robotDescriptions = allLines.slice(1).map(lineContent => {
        const numericParts = lineContent.split(' ').map(Number);
        return {
            position: numericParts[0],
            span: numericParts[1]
        };
    });
    return { initialRobotCount, robotDescriptions };
};

const determineFinalCount = (inputDetails) => {
    let currentRobotTally = inputDetails.initialRobotCount;
    const sortedUnits = [...inputDetails.robotDescriptions].sort((unitA, unitB) => unitA.position - unitB.position);

    if (sortedUnits.length > 0) {
        const firstSortedUnit = sortedUnits[0];
        const leftExtent = firstSortedUnit.position - firstSortedUnit.span;

        // The original code's `if(Math.max(null, range) >= min)` condition
        // evaluates to `0 >= min` only for the very first iteration (when `range` is `[]`).
        // For all subsequent iterations, `range` becomes a non-empty array,
        // causing `Math.max(null, range)` to evaluate to `NaN`.
        // `NaN >= min` is always false.
        // Thus, the `n=n-1` operation occurs at most once, only if the first robot's
        // calculated `min` value is less than or equal to 0.
        if (leftExtent <= 0) {
            currentRobotTally--;
        }
    }
    return currentRobotTally;
};

const executeRobotAnalysis = (sourceData) => {
    const processed = processInputData(sourceData);
    const finalResult = determineFinalCount(processed);
    console.log(finalResult);
};

executeRobotAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));
