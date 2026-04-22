"use strict";
const acquireInputData = (sourceContent) => {
    const dataSegments = [];
    sourceContent.trim().split('\n').forEach(row => {
        row.split(' ').forEach(segment => {
            if (segment.length > 0) {
                dataSegments.push(segment);
            }
        });
    });

    let currentSegmentPointer = 0;

    const pullNextValue = (returnAsText) => {
        if (currentSegmentPointer >= dataSegments.length) {
            throw new Error("Input buffer exhausted.");
        }
        const retrievedItem = dataSegments[currentSegmentPointer++];
        return returnAsText ? retrievedItem : Number(retrievedItem);
    };

    return {
        pull: pullNextValue,
    };
};

const dataProcessor = acquireInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

const computeResult = () => {
    const primaryCriterion = dataProcessor.pull();
    const secondaryCriterion = dataProcessor.pull();

    const criterionValueMapping = [0, 300000, 200000, 100000];

    let cumulativeScore = 0;

    cumulativeScore += criterionValueMapping[primaryCriterion] || 0;

    cumulativeScore += criterionValueMapping[secondaryCriterion] || 0;

    if (primaryCriterion === 1 && secondaryCriterion === 1) {
        cumulativeScore += 400000;
    }

    return cumulativeScore;
};

console.log(computeResult());