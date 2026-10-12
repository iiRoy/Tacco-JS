'use strict';

const fileOperations = require("fs");
const sourceContent = fileOperations.readFileSync("/dev/stdin", "utf8");

let currentSegment = "";
const processedNumericalData = [];

for (let charPosition = 0; charPosition < sourceContent.length; charPosition++) {
    const characterAtPosition = sourceContent[charPosition];
    if (characterAtPosition === "\n") {
        processedNumericalData.push(Number(currentSegment));
        currentSegment = "";
    } else {
        currentSegment += characterAtPosition;
    }
}
processedNumericalData.push(Number(currentSegment));

const targetNumber = (function() {
    const base = 2;
    const power = 4;
    return Math.pow(base, power);
})();

console.log(targetNumber);
