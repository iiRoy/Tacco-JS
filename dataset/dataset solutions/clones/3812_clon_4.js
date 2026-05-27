"use strict";

const MAGNITUDE_CEILING = 1e18;

const processContestData = (inputPayload) => {
    const extractedDetails = inputPayload.split('\n').reduce((accumulator, currentLine, lineIndex) => {
        switch (lineIndex) {
            case 0:
                accumulator.firstOperand = parseInt(currentLine);
                break;
            case 1:
                accumulator.secondOperand = parseInt(currentLine);
                break;
            case 3:
                accumulator.keyCharacter = currentLine.at(-1);
                break;
        }
        return accumulator;
    }, {});

    const { firstOperand, secondOperand, keyCharacter } = extractedDetails;
    const keyModifier = parseInt(keyCharacter);

    const calculatedResult = firstOperand - secondOperand;

    console.log(
        Math.abs(calculatedResult) > MAGNITUDE_CEILING
            ? "Unfair"
            : calculatedResult * (1 - 2 * (keyModifier % 2 && calculatedResult !== 0))
    );
};

processContestData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
