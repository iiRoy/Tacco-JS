'use strict'

const MAX_NEG_VAL = -900719925474099;

function ProcessInput(rawData) {
    let lines = rawData.trim().split('\n');
    let countElements = parseInt(lines[0]);
    
    let elementValues = [0, ...lines[1].split(' ').map(Number)];

    let currentOptimalState = { normal: 0, flipped: MAX_NEG_VAL };

    let finalOptimalState = elementValues.slice(1).reduce((previousState, currentElementValue) => {
        let nextNormalSum = Math.max(
            previousState.normal + currentElementValue,
            previousState.flipped - currentElementValue
        );

        let nextFlippedSum = Math.max(
            previousState.normal - currentElementValue,
            previousState.flipped + currentElementValue
        );

        return { normal: nextNormalSum, flipped: nextFlippedSum };
    }, currentOptimalState);

    console.log(finalOptimalState.normal);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
