"use strict";

const processInputAndFindLength = (inputData) => {
    const inputLines = inputData.split("\n");
    const characterSequence = inputLines[0].split("");

    const analysisResult = characterSequence.reduce((accumulator, currentCharacter, charIndex) => {
        let { currentSequenceStartIdx, greatestSpan } = accumulator;

        if (currentCharacter === "A") {
            if (currentSequenceStartIdx === -1) {
                currentSequenceStartIdx = charIndex;
            }
        } else if (currentCharacter === "Z") {
            if (currentSequenceStartIdx !== -1) {
                const calculatedSpan = charIndex - currentSequenceStartIdx;
                greatestSpan = Math.max(greatestSpan, calculatedSpan);
                currentSequenceStartIdx = -1;
            }
        }
        
        return { currentSequenceStartIdx, greatestSpan };
    }, { currentSequenceStartIdx: -1, greatestSpan: -Infinity });

    return analysisResult.greatestSpan === -Infinity ? -Infinity : analysisResult.greatestSpan + 1;
};

const executeProgram = (programArgument) => {
    const finalComputedValue = processInputAndFindLength(programArgument);
    console.log(finalComputedValue);
};

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
