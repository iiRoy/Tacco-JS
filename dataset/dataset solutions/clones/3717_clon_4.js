"use strict"

function DetermineNetValue(inputString) {
    const operationValueMap = new Map();
    operationValueMap.set('+', 1);
    operationValueMap.set('-', -1);

    const characterArray = Array.from(inputString);

    const finalTally = characterArray.reduce((currentAccumulation, characterToken) => {
        return currentAccumulation + (operationValueMap.get(characterToken) || 0);
    }, 0);

    console.log(finalTally);
}

DetermineNetValue(require("fs").readFileSync("/dev/stdin", "utf8"));