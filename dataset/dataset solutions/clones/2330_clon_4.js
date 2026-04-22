"use strict";

const performAnalysis = inputContent => {
    const dataSegments = inputContent.trim().split("\n");
    const totalEntities = Number(dataSegments[0]);
    const sequenceValues = dataSegments[1].split(" ").map(Number);

    const evaluationResult = sequenceValues.reduce((currentStatus, elementValue) => {
        if (elementValue === currentStatus.nextExpectedValue) {
            return {
                nextExpectedValue: currentStatus.nextExpectedValue + 1,
                matchedConsecutiveCount: currentStatus.matchedConsecutiveCount + 1
            };
        }
        return currentStatus;
    }, { nextExpectedValue: 1, matchedConsecutiveCount: 0 });

    const actualMatchCount = evaluationResult.matchedConsecutiveCount;

    console.log(actualMatchCount === 0 ? -1 : totalEntities - actualMatchCount);
};

((resourcePath) => {
    performAnalysis(require('node:fs').readFileSync(resourcePath, 'utf8'));
})('/dev/stdin');