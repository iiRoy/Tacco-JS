"use strict";

function getStandardInputContent() {
    return require('fs').readFileSync('/dev/stdin', 'utf8');
}

function processInputData(rawInput) {
    const trimmedInputContent = rawInput.trim();
    const inputLines = trimmedInputContent.split("\n");

    const firstLineTokens = inputLines[0].split(" ");
    const numericValues = inputLines[1].split(" ").map(Number);
    const comparisonTarget = inputLines[2];

    let resultFirstComponent;
    let resultSecondComponent;

    const firstNumericVal = numericValues[0];
    const secondNumericVal = numericValues[1];

    if (comparisonTarget === firstLineTokens[0]) {
        const decrementedFirst = firstNumericVal - 1;
        resultFirstComponent = decrementedFirst.toString();
        resultSecondComponent = secondNumericVal.toString();
    } else {
        const decrementedSecond = secondNumericVal - 1;
        resultFirstComponent = firstNumericVal.toString();
        resultSecondComponent = decrementedSecond.toString();
    }

    const finalOutputString = resultFirstComponent + " " + resultSecondComponent;
    console.log(finalOutputString);
}

processInputData(getStandardInputContent());
