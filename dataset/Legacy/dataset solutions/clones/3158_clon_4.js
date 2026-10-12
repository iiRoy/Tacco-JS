"use strict";

const processInput = (inputData) => {
    const rawSequence = inputData.split("\n")[0];
    const initialLength = rawSequence.length;
    const characterBuffer = [];

    for (let charIndex = 0; charIndex < rawSequence.length; charIndex++) {
        const currentSymbol = rawSequence[charIndex];

        if (characterBuffer.length > 0) {
            const lastSymbol = characterBuffer[characterBuffer.length - 1];
            if ((lastSymbol === '0' && currentSymbol === '1') || (lastSymbol === '1' && currentSymbol === '0')) {
                characterBuffer.pop();
            } else {
                characterBuffer.push(currentSymbol);
            }
        } else {
            characterBuffer.push(currentSymbol);
        }
    }

    console.log(initialLength - characterBuffer.length);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
