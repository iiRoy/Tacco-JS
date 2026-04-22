'use strict'
function acquireOperands(textPayload) {
    let collectedDigits = [];
    let currentSequence = '';
    for (let charIndex = 0; charIndex < textPayload.length; charIndex++) {
        const currentCharacter = textPayload[charIndex];
        if (currentCharacter >= '0' && currentCharacter <= '9') {
            currentSequence += currentCharacter;
        } else if (currentSequence !== '') {
            collectedDigits.push(Number(currentSequence));
            currentSequence = '';
        }
    }
    if (currentSequence !== '') {
        collectedDigits.push(Number(currentSequence));
    }
    return collectedDigits;
}

function deriveOutcome(firstOperand, secondOperand) {
    const product = firstOperand * secondOperand;
    return (product + 1) >> 1;
}

(function() {
    const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
    const numericValues = acquireOperands(rawData);
    const finalResult = deriveOutcome(numericValues[0], numericValues[1]);
    console.log(finalResult);
})();