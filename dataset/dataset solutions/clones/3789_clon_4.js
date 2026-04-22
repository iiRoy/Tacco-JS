"use strict";

const acquirePrimaryData = () => {
    const rawSystemInput = require("fs").readFileSync("/dev/stdin", "utf8");
    const dataSegments = rawSystemInput.split("\n");
    return dataSegments[1];
};

const computeUniqueIntersectionSize = (firstStringPart, secondStringPart) => {
    const charSetOne = new Set(Array.from(firstStringPart));
    const charSetTwo = new Set(Array.from(secondStringPart));

    let intersectionCounter = 0;
    for (const characterSymbol of charSetOne) {
        if (charSetTwo.has(characterSymbol)) {
            intersectionCounter++;
        }
    }
    return intersectionCounter;
};

const findOverallMaxIntersection = (mainSequence, currentCutPoint, cumulativeMax) => {
    if (currentCutPoint >= mainSequence.length) {
        return cumulativeMax;
    }

    const segmentAlpha = mainSequence.substring(0, currentCutPoint);
    const segmentBeta = mainSequence.substring(currentCutPoint);

    const currentSplitIntersection = computeUniqueIntersectionSize(segmentAlpha, segmentBeta);

    const updatedMax = Math.max(cumulativeMax, currentSplitIntersection);

    return findOverallMaxIntersection(mainSequence, currentCutPoint + 1, updatedMax);
};

const primaryStringValue = acquirePrimaryData();
const finalMaximumResult = findOverallMaxIntersection(primaryStringValue, 1, 0);

console.log(finalMaximumResult);