'use strict';

const ASCII_LOWER_A_CODE = 97;
const ASCII_LOWER_Z_CODE = 122;
const ALPHABET_LENGTH_COUNT = 26;
const COST_TO_CONVERT_TO_A_BASE_VALUE = 27;

function determineConversionCostToA(charValue) {
    const charCode = charValue.charCodeAt(0);
    return COST_TO_CONVERT_TO_A_BASE_VALUE - (charCode - ASCII_LOWER_A_CODE + 1);
}

function performCharacterRotation(charValue, rotationAmount) {
    let currentCode = charValue.charCodeAt(0);
    let newCode = currentCode + rotationAmount;
    if (newCode > ASCII_LOWER_Z_CODE) {
        newCode -= ALPHABET_LENGTH_COUNT;
    }
    return String.fromCharCode(newCode);
}

function ProcessInputAndTransform(rawInput) {
    let parsedLines = rawInput.split("\n");
    let targetString = parsedLines[0];
    let remainingPoints = parseInt(parsedLines[1]);

    let charArray = Array.from(targetString);
    let currentCharacterIndex = 0;
    const totalStringLength = charArray.length;

    while (remainingPoints > 0) {
        let currentCharacter = charArray[currentCharacterIndex];

        if (currentCharacter === 'a') {
            currentCharacterIndex++;
        } else {
            let costToMakeCurrentCharA = determineConversionCostToA(currentCharacter);

            if (costToMakeCurrentCharA <= remainingPoints) {
                remainingPoints -= costToMakeCurrentCharA;
                charArray[currentCharacterIndex] = 'a';
                currentCharacterIndex++;
            } else {
                if (currentCharacterIndex === totalStringLength - 1) {
                    let effectiveRotationAmount = remainingPoints % ALPHABET_LENGTH_COUNT;
                    charArray[currentCharacterIndex] = performCharacterRotation(currentCharacter, effectiveRotationAmount);
                    remainingPoints = 0;
                } else {
                    currentCharacterIndex++;
                }
            }
        }
    }
    console.log(charArray.join(''));
}

ProcessInputAndTransform(require("fs").readFileSync("/dev/stdin", "utf8"));
