function processSequence(inputData) {
    const targetPhrase = "AKIHABARA";
    const requiredCharacterPositions = new Set([0, 4, 6, 8]);

    const trimmedInput = inputData.trim();
    let currentInputPosition = 0;

    const constructedOutcome = Array.from(targetPhrase).reduce((accumulator, characterFromTarget, targetIndex) => {
        if (!accumulator.validityFlag) {
            return accumulator;
        }

        const expectsSpecificA = requiredCharacterPositions.has(targetIndex);
        const correspondingInputCharacter = trimmedInput[accumulator.inputPointer];

        if (expectsSpecificA) {
            if (correspondingInputCharacter === 'A') {
                accumulator.resultingString += 'A';
                accumulator.inputPointer++;
            } else {
                accumulator.resultingString += 'A';
            }
        } else {
            if (correspondingInputCharacter === characterFromTarget) {
                accumulator.resultingString += characterFromTarget;
                accumulator.inputPointer++;
            } else {
                accumulator.validityFlag = false;
            }
        }
        return accumulator;
    }, { resultingString: "", inputPointer: 0, validityFlag: true });

    if (!constructedOutcome.validityFlag || constructedOutcome.inputPointer !== trimmedInput.length) {
        return "NO";
    }

    return constructedOutcome.resultingString === targetPhrase ? "YES" : "NO";
}

const obtainResource = require;
const filesystemModule = obtainResource('fs');
const obtainContent = filesystemModule.readFileSync;
const standardInputPath = '/dev/stdin';
const encodingFormat = 'utf8';

const rawTransmission = obtainContent(standardInputPath, encodingFormat);
console.log(processSequence(rawTransmission));