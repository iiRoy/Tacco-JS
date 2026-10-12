"use strict";

const processInput = (rawInputData) => {
    const inputLines = rawInputData.split("\n");
    const _initialCount = Number(inputLines[0]);
    const scoreValues = inputLines[1].split(" ").map(Number);

    const colorThresholds = [400, 800, 1200, 1600, 2000, 2400, 2800, 3200];

    const { uniqueColorIndices, bonusPoints } = scoreValues.reduce((accumulator, currentRating) => {
        const categoryIndex = colorThresholds.findIndex(limit => currentRating < limit);
        if (categoryIndex === -1) {
            accumulator.bonusPoints++;
        } else {
            accumulator.uniqueColorIndices.add(categoryIndex);
        }
        return accumulator;
    }, { uniqueColorIndices: new Set(), bonusPoints: 0 });

    const distinctColorCount = uniqueColorIndices.size;

    const minimumPossible = distinctColorCount === 0 ? 1 : distinctColorCount;
    const maximumPossible = distinctColorCount + bonusPoints;

    console.log(minimumPossible + " " + maximumPossible);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
