"use strict"

const obtainRelevantDigits = (textualData) => {
    const numericCharacters = Array.from(textualData).filter(charX => charX !== ' ');
    const purifiedString = numericCharacters.join('');

    if (purifiedString.length === 0) {
        return 0;
    }

    const significantSegment = purifiedString.length < 2
        ? purifiedString
        : purifiedString.slice(-2);

    return Number.parseInt(significantSegment, 10);
};

const ascertainResult = (numericalValue) => {
    const remainder = numericalValue & 3; // Equivalent to numericalValue % 4

    const decisionMatrix = new Map([
        [0, 'YES'],
        [1, 'NO'],
        [2, 'NO'],
        [3, 'NO']
    ]);

    return decisionMatrix.get(remainder);
};

const rawSourceText = require("fs").readFileSync("/dev/stdin", "utf8");
const processedNumericalValue = obtainRelevantDigits(rawSourceText);
const finalVerdict = ascertainResult(processedNumericalValue);
console.log(finalVerdict);