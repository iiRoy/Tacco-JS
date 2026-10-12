"use strict";

const processInputData = (inputContent) => {
    const dataLines = inputContent.trim().split("\n");
    const initialSegment = dataLines[0].split(" ");
    const numericTarget = parseInt(initialSegment[0]);

    const calculateScore = (currentValue) => {
        const remainderLookup = [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2]; // For values 0 through 10

        if (currentValue < 11) {
            return remainderLookup[currentValue];
        } else {
            return 2 + calculateScore(currentValue - 11);
        }
    };

    const finalScore = calculateScore(numericTarget);
    console.log(finalScore);
};

processInputData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
