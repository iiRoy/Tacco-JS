"use strict";
function processInputData(rawData) {
    let inputLines = rawData.split("\n");

    let stringLineFragment = inputLines.shift();
    let targetString = stringLineFragment.trim();

    let kValueFragment = inputLines.shift();
    let kNumericValue = parseInt(kValueFragment.trim(), 10);

    let loopIterationLimit = Math.min(kNumericValue, targetString.length);

    let characterFoundAndPrinted = false;
    let characterToOutput = '';

    for (let currentIndex = 0; currentIndex < loopIterationLimit; ++currentIndex) {
        let currentCharacterInString = targetString.charAt(currentIndex);
        if (currentCharacterInString !== '1') {
            characterToOutput = currentCharacterInString;
            characterFoundAndPrinted = true;
            break;
        }
    }

    if (characterFoundAndPrinted) {
        console.log(characterToOutput);
    } else {
        console.log(targetString.charAt(kNumericValue));
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
