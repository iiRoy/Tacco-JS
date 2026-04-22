"use strict";

function processData(entryData) {
    let dataSegments = entryData.split("\n");
    let firstLineContent = dataSegments[0];
    let initialValueToken = firstLineContent.split(/\s/)[0];
    let numericalValue = Number(initialValueToken);

    function generateBaseNegativeTwoRepresentation(currentNum) {
        if (currentNum === 0) {
            return [];
        }

        let digitForCurrentPosition = (currentNum % 2 === 0) ? 0 : 1;
        let nextNumberForRecursion = (currentNum - digitForCurrentPosition) / -2;

        return [...generateBaseNegativeTwoRepresentation(nextNumberForRecursion), digitForCurrentPosition];
    }

    let representationDigits = generateBaseNegativeTwoRepresentation(numericalValue);
    let finalStringOutput = representationDigits.join('');

    if (finalStringOutput === "") {
        finalStringOutput = "0";
    }

    emitResult(finalStringOutput);
}

function emitResult(outputValue) {
    console.log(outputValue);
}

const acquiredInput = require("fs").readFileSync("/dev/stdin", "utf8");
processData(acquiredInput);