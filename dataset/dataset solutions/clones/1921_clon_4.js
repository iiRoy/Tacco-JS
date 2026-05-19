"use strict";

const processInput = (rawInputContent) => {
    const dataLines = rawInputContent.trim().split("\n");
    const [limitCount, upperBound, queryCount] = dataLines[0].split(" ").map(Number);
    const querySpecs = dataLines.slice(1, queryCount + 1).map(line => line.split(" ").map(Number));
    return { limitCount, upperBound, queryCount, querySpecs };
};

function* produceArrangements(currentArrangement, startValue, targetLength, maxValue) {
    if (currentArrangement.length === targetLength) {
        yield currentArrangement;
        return;
    }
    for (let nextValue = startValue; nextValue <= maxValue; nextValue++) {
        yield* produceArrangements([...currentArrangement, nextValue], nextValue, targetLength, maxValue);
    }
}

const entryPoint = (inputString) => {
    const { limitCount, upperBound, queryCount, querySpecs } = processInput(inputString);

    let overallMaxScore = 0;

    for (const generatedArrangement of produceArrangements([], 1, limitCount, upperBound)) {
        const currentArrangementScore = querySpecs.reduce((accumulator, queryDetail) => {
            const [indexA, indexB, requiredDifference, points] = queryDetail;
            if (generatedArrangement[indexB - 1] - generatedArrangement[indexA - 1] === requiredDifference) {
                return accumulator + points;
            }
            return accumulator;
        }, 0);
        overallMaxScore = Math.max(overallMaxScore, currentArrangementScore);
    }
    console.log(overallMaxScore);
};

entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));
