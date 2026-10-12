"use strict";

const processInput = (inputData) => {
    const firstLineOfInput = inputData.split("\n")[0];

    const splitParts = firstLineOfInput.split(" ");

    const firstCharacter = splitParts[0];
    const secondCharacter = splitParts[1];

    let computedResult;

    if (firstCharacter === "D") {
        if (secondCharacter === "H") {
            computedResult = "D";
        } else {
            computedResult = "H";
        }
    } else {
        computedResult = secondCharacter;
    }

    console.log(computedResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
