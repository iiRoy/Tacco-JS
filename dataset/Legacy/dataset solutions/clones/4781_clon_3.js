"use strict";

const processInput = (inputData) => {
    const trimmedInputData = inputData.trim();
    const firstInputLine = trimmedInputData.split("\n")[0];
    const coordinateValueStrings = firstInputLine.split(" ");

    const initialXCoordinate = parseInt(coordinateValueStrings[0], 10);
    const initialYCoordinate = parseInt(coordinateValueStrings[1], 10);
    const finalXCoordinate = parseInt(coordinateValueStrings[2], 10);
    const finalYCoordinate = parseInt(coordinateValueStrings[3], 10);

    const horizontalDisplacement = finalXCoordinate - initialXCoordinate;
    const verticalDisplacement = finalYCoordinate - initialYCoordinate;

    const movementSequence = [];

    const appendRepeatedMoves = (targetArray, count, moveCharacter) => {
        for (let iterationIndex = 0; iterationIndex < count; iterationIndex++) {
            targetArray.push(moveCharacter);
        }
    };

    // First path segment: R moves
    appendRepeatedMoves(movementSequence, horizontalDisplacement, "R");

    // Second path segment: U moves
    appendRepeatedMoves(movementSequence, verticalDisplacement, "U");

    // Third path segment: L moves
    appendRepeatedMoves(movementSequence, horizontalDisplacement, "L");

    // Fourth path segment: D moves
    appendRepeatedMoves(movementSequence, verticalDisplacement, "D");

    // Fifth path segment: Single L move
    movementSequence.push("L");

    const extendedVerticalDisplacement = verticalDisplacement + 1;
    const extendedHorizontalDisplacement = horizontalDisplacement + 1;

    // Sixth path segment: U moves with extended count
    appendRepeatedMoves(movementSequence, extendedVerticalDisplacement, "U");

    // Seventh path segment: R moves with extended count
    appendRepeatedMoves(movementSequence, extendedHorizontalDisplacement, "R");

    // Eighth path segment: Single D move
    movementSequence.push("D");

    // Ninth path segment: D moves with extended count
    appendRepeatedMoves(movementSequence, extendedVerticalDisplacement, "D");

    // Tenth path segment: L moves with extended count
    appendRepeatedMoves(movementSequence, extendedHorizontalDisplacement, "L");

    // Eleventh path segment: Single U move
    movementSequence.push("U");

    console.log(movementSequence.join(""));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
