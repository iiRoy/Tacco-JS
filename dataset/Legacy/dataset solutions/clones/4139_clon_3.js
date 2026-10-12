"use strict";

const parseInputValues = (inputLine) => {
    const parts = inputLine.split(" ");
    const valA = parseInt(parts[0], 10);
    const valB = parseInt(parts[1], 10);
    return { valA, valB };
};

const processData = (rawInput) => {
    const cleanedInput = rawInput.trim();
    const inputLines = cleanedInput.split("\n");

    const { valA: startValue, valB: limitValue } = parseInputValues(inputLines[0]);

    let currentMultiplier = startValue;
    let totalDoublings = 0;

    while (currentMultiplier <= limitValue) {
        totalDoublings++;
        currentMultiplier *= 2;
    }

    console.log(totalDoublings);
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
