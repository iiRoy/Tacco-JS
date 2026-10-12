'use strict';

function transformCipherString(initialText, initialShiftValue) {
    const characterCodes = initialText.split('').map(symbol => symbol.charCodeAt(0));
    const textLength = characterCodes.length;

    const { processedCodes, remainingShift } = characterCodes.slice(0, textLength - 1).reduce(
        (accumulator, currentCode) => {
            const alphabetPosition = currentCode - 97; // 'a' is 0, 'b' is 1, etc.
            let currentShift = accumulator.remainingShift;
            let newCharacterCode = currentCode;

            if (alphabetPosition !== 0) { // If the character is not 'a'
                const costToResetToA = 26 - alphabetPosition; // Power needed to change to 'a'
                if (currentShift >= costToResetToA) {
                    currentShift -= costToResetToA;
                    newCharacterCode = 97; // Set to 'a'
                }
            }
            accumulator.processedCodes.push(newCharacterCode);
            accumulator.remainingShift = currentShift;
            return accumulator;
        },
        { processedCodes: [], remainingShift: initialShiftValue }
    );

    const originalLastCharCode = characterCodes[textLength - 1];
    const lastCharAlphabetPosition = originalLastCharCode - 97;
    const effectiveLastShift = remainingShift % 26;
    const finalLastCharPosition = (lastCharAlphabetPosition + effectiveLastShift) % 26;
    const finalLastCharCode = finalLastCharPosition + 97;

    processedCodes.push(finalLastCharCode);

    return String.fromCharCode(...processedCodes);
}

function processInputAndDisplayOutput(rawInputContent) {
    const inputLines = rawInputContent.split("\n");
    const sourceString = inputLines[0];
    const shiftMagnitude = parseInt(inputLines[1], 10);

    const finalStringResult = transformCipherString(sourceString, shiftMagnitude);
    console.log(finalStringResult);
}

processInputAndDisplayOutput(require("fs").readFileSync("/dev/stdin", "utf8"));
