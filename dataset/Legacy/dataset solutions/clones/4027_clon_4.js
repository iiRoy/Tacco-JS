"use strict";

var calculateScoreDifference = function(inputData) {
    const lineTokens = inputData.split("\n")[1].split(" ");

    const orderedNumbers = Array.from(lineTokens, Number)
                               .sort((valA, valB) => valB - valA);

    const playerScores = orderedNumbers.reduce((accumulator, currentNumber, index) => {
        if (index % 2 === 0) {
            accumulator.playerOne += currentNumber;
        } else {
            accumulator.playerTwo += currentNumber;
        }
        return accumulator;
    }, { playerOne: 0, playerTwo: 0 });

    return playerScores.playerOne - playerScores.playerTwo;
};

const finalResult = calculateScoreDifference(require("fs").readFileSync("/dev/stdin", "utf8"));
console.log(finalResult);
