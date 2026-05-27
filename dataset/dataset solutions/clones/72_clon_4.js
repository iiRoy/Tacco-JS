const baseLetterCode = 'a'.charCodeAt(0);
const totalLetters = 26;

function applyCipherShift(sourceText, shiftValue) {
    return Array.from(sourceText).reduce((accumulator, currentCharacter) => {
        const charNumericalValue = currentCharacter.charCodeAt(0);
        if (charNumericalValue >= baseLetterCode && charNumericalValue < baseLetterCode + totalLetters) {
            const shiftedIndex = (charNumericalValue - baseLetterCode + shiftValue) % totalLetters;
            return accumulator + String.fromCharCode(baseLetterCode + shiftedIndex);
        }
        return accumulator + currentCharacter;
    }, '');
}

const fileSystemModule = require("fs");
const inputDataLines = fileSystemModule.readFileSync("/dev/stdin", "utf8").split('\n');

const shiftSequence = Array.from({ length: totalLetters }, (_, index) => totalLetters - 1 - index);

const targetPhrasePattern = /th(e|is|at)/;

inputDataLines.forEach(currentInputLine => {
    shiftSequence.forEach(currentShiftAmount => {
        const transformedLine = applyCipherShift(currentInputLine, currentShiftAmount);
        if (targetPhrasePattern.test(transformedLine)) {
            console.log(transformedLine);
        }
    });
});
