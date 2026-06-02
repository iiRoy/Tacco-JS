"use strict";

const negabaseOperationMap = new Map();

negabaseOperationMap.set(0, (currentValue) => ({
    digitRepresentation: "0",
    nextIterationValue: currentValue / -2
}));

negabaseOperationMap.set(1, (currentValue) => ({
    digitRepresentation: "1",
    nextIterationValue: (currentValue - 1) / -2
}));

function computeNegabaseDigits(currentNumericalValue, digitCollector = []) {
    if (currentNumericalValue === 0) {
        return digitCollector;
    }

    const parityKey = Math.abs(currentNumericalValue % 2);

    const { digitRepresentation, nextIterationValue } = negabaseOperationMap.get(parityKey)(currentNumericalValue);

    digitCollector.push(digitRepresentation);
    return computeNegabaseDigits(nextIterationValue, digitCollector);
}

function ProcessInputData(inputContent) {
    let contentLines = inputContent.split("\n");
    let firstLineSegment = contentLines.shift().split(/\s/)[0];
    let initialNumericalInput = Number(firstLineSegment);

    let finalOutputString;
    if (initialNumericalInput === 0) {
        finalOutputString = "0";
    } else {
        const collectedDigits = computeNegabaseDigits(initialNumericalInput);
        finalOutputString = collectedDigits.reverse().join('');
    }

    console.log(finalOutputString);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
