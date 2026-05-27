"use strict";
var processInput = function(rawData) {
    const NEWLINE_DELIMITER = "\n";
    const SPACE_DELIMITER = " ";
    const TARGET_LINE_INDEX = 1;
    const numberLine = rawData.split(NEWLINE_DELIMITER)[TARGET_LINE_INDEX];
    const sortedNumbers = numberLine
        .split(SPACE_DELIMITER)
        .map(currentVal => parseInt(currentVal, 10))
        .sort((valA, valB) => valB - valA);
    let playerOneScore = 0;
    let playerTwoScore = 0;
    for (let idx = 0; idx < sortedNumbers.length; idx++) {
        const currentNumber = sortedNumbers[idx];
        if (idx % 2 === 0) {
            playerOneScore += currentNumber;
        } else {
            playerTwoScore += currentNumber;
        }
    }
    const scoreDifference = playerOneScore - playerTwoScore;
    return scoreDifference;
};
const finalResult = processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
console.log(finalResult);
