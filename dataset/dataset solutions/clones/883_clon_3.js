const fileSystemUtility = require('fs');

/**
 * Reads the primary input string from standard input.
 * If stdin is interactive (TTY), it will provide a default string.
 * @returns {string} The first non-empty line of the input, or an empty string.
 */
function obtainPrimaryInputString() {
    let rawInputContent;
    if (process.stdin.isTTY) {
        console.warn("Notice: Standard input is interactive. Using a default string for processing: 'Hello, World!'");
        rawInputContent = "Hello, World!";
    } else {
        try {
            rawInputContent = fileSystemUtility.readFileSync(process.stdin.fd, 'utf8');
        } catch (errorReading) {
            console.error("Error reading from standard input:", errorReading.message);
            rawInputContent = "";
        }
    }

    const contentLines = rawInputContent.trim().split('\n');
    return contentLines.find(line => line.length > 0) || '';
}

/**
 * Generates a simple sequence by repeating a given sign character a specified number of times.
 * This is typically used for differences with small absolute magnitudes.
 * @param {string} signCharacter - The character to repeat (e.g., '+' or '-').
 * @param {number} repeatCount - The number of times the character should be repeated.
 * @returns {string} The constructed sequence of repeated characters.
 */
function constructSimpleRepeatSequence(signCharacter, repeatCount) {
    if (repeatCount <= 0) {
        return '';
    }
    return Array(repeatCount).fill(signCharacter).join('');
}

/**
 * Generates a more intricate Brainfuck-like sequence for differences with larger absolute magnitudes.
 * This method simulates multiplication using nested loops and accounts for any remainder.
 * @param {string} operationSign - The character representing the desired operation ('+' or '-').
 * @param {number} absoluteMagnitude - The absolute value of the difference to represent.
 * @returns {string} The complex generated sequence.
 */
function constructMultiplicationSequence(operationSign, absoluteMagnitude) {
    const generatedSegments = [];
    const integerSquareRoot = Math.floor(Math.sqrt(absoluteMagnitude));

    generatedSegments.push('>');
    generatedSegments.push(constructSimpleRepeatSequence('+', integerSquareRoot));
    generatedSegments.push('[<');
    generatedSegments.push(constructSimpleRepeatSequence(operationSign, integerSquareRoot));
    generatedSegments.push('>-]<');

    const remainderValue = absoluteMagnitude - (integerSquareRoot * integerSquareRoot);
    if (remainderValue > 0) {
        generatedSegments.push(constructSimpleRepeatSequence(operationSign, remainderValue));
    }

    return generatedSegments.join('');
}

/**
 * The primary function that orchestrates the entire character sequence generation process.
 * It reads input, analyzes character code differences, and constructs an output sequence.
 */
function executeSequenceGenerationProcess() {
    const sourceInputText = obtainPrimaryInputString();

    if (!sourceInputText) {
        console.log("");
        return;
    }

    const differenceMagnitudeThreshold = 16;
    const unicodeCodePoints = Array.from(sourceInputText, character => character.charCodeAt(0));

    const accumulatedOutputParts = [];
    let previousCodePoint = 0;

    for (let currentPosition = 0; currentPosition < unicodeCodePoints.length; currentPosition++) {
        const currentCharacterCode = unicodeCodePoints[currentPosition];
        const calculatedDifference = currentCharacterCode - previousCodePoint;

        if (calculatedDifference === 0) {
            accumulatedOutputParts.push('.');
        } else {
            const operationSymbol = calculatedDifference > 0 ? '+' : '-';
            const absoluteDifferenceMagnitude = Math.abs(calculatedDifference);

            if (absoluteDifferenceMagnitude < differenceMagnitudeThreshold) {
                accumulatedOutputParts.push(constructSimpleRepeatSequence(operationSymbol, absoluteDifferenceMagnitude));
            } else {
                accumulatedOutputParts.push(constructMultiplicationSequence(operationSymbol, absoluteDifferenceMagnitude));
            }
        }

        accumulatedOutputParts.push('.');
        previousCodePoint = currentCharacterCode;
    }

    console.log(accumulatedOutputParts.join(''));
}

executeSequenceGenerationProcess();