'use strict';

function processInputData(rawText) {
    const lineSegments = rawText.split('\n');

    const numericStrings = lineSegments[0].split(' ');
    const scalingFactor = Number(lineSegments[1]);

    let maximumValue = -Infinity;
    let sumOfOriginals = 0;

    for (const strNum of numericStrings) {
        const currentValue = Number(strNum);
        if (currentValue > maximumValue) {
            maximumValue = currentValue;
        }
        sumOfOriginals += currentValue;
    }

    // The original logic sorts the numbers, identifies the largest,
    // multiplies that largest number by (2 * scalingFactor),
    // and then sums all numbers in the modified array.
    // This can be mathematically expressed as:
    // (sum of all original numbers - original maximum) + (original maximum * 2 * scalingFactor)
    // Which simplifies to:
    // sum of all original numbers + original maximum * (2 * scalingFactor - 1)
    const finalOutcome = sumOfOriginals + maximumValue * (2 * scalingFactor - 1);

    console.log(finalOutcome);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
