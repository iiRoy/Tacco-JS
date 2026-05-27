"use strict";

const processInput = (rawData) => {
    const RADIX_BASE = 10;
    const cleanedInput = rawData.trim();
    const inputLines = cleanedInput.split('\n');

    const totalElements = parseInt(inputLines[0], RADIX_BASE);
    const elementColors = inputLines[1].split(' ');

    let requiredModifications = 0;

    let currentPosition = 0;
    const iterationLimit = totalElements - 1;

    while (currentPosition < iterationLimit) {
        const colorAtCurrent = elementColors[currentPosition];
        const colorAtNext = elementColors[currentPosition + 1];

        if (colorAtCurrent === colorAtNext) {
            requiredModifications++;
            currentPosition += 2;
        } else {
            currentPosition++;
        }
    }
    console.log(requiredModifications);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
