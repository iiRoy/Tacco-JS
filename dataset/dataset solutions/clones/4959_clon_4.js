const fileSystem = require("fs");

const transformInput = (inputString, initialBudget) => {
    const characterSequence = Array.from(inputString);
    const processingResult = characterSequence.reduce((accumulator, currentCharacter, currentIndex, fullArray) => {
        const isLastElement = (currentIndex === fullArray.length - 1);
        const characterAsciiValue = currentCharacter.charCodeAt(0);
        let nextCharacter = currentCharacter;
        let budgetModification = 0;

        if (isLastElement) {
            const asciiBaseForA = 'a'.charCodeAt(0);
            const currentAlphabeticalOffset = characterAsciiValue - asciiBaseForA;
            const effectiveShiftAmount = accumulator.currentBudget % 26;
            const newAlphabeticalOffset = (currentAlphabeticalOffset + effectiveShiftAmount) % 26;
            nextCharacter = String.fromCharCode(asciiBaseForA + newAlphabeticalOffset);
        } else {
            const costToReachA = 123 - characterAsciiValue;
            if (costToReachA <= accumulator.currentBudget && currentCharacter !== 'a') {
                nextCharacter = 'a';
                budgetModification = -costToReachA;
            }
        }
        accumulator.processedCharacters.push(nextCharacter);
        accumulator.currentBudget += budgetModification;
        return accumulator;
    }, { processedCharacters: [], currentBudget: initialBudget });

    return processingResult.processedCharacters.join('');
};

const inputLines = fileSystem.readFileSync("/dev/stdin", "utf8").split("\n");
const sourceString = inputLines[0];
const initialShiftBudget = parseInt(inputLines[1]);

const finalOutput = transformInput(sourceString, initialShiftBudget);
console.log(finalOutput);
