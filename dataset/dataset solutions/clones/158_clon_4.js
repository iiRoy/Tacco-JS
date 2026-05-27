const numeralValues = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000
};

const sourceText = require("fs").readFileSync("/dev/stdin", "utf8");

let charPosition = 0;
let runningTotal = 0;
let priorNumeralValue = 0;

function evaluateCharacter(character, currentTotal, previousValue) {
    const currentNumeralValue = numeralValues[character];

    if (currentNumeralValue !== undefined) {
        const updatedTotal = currentTotal + (currentNumeralValue > previousValue ? currentNumeralValue - 2 * previousValue : currentNumeralValue);
        return {
            kind: 'roman',
            newTotal: updatedTotal,
            newPrior: currentNumeralValue
        };
    } else {
        return {
            kind: 'nonRoman',
            totalToPrint: currentTotal
        };
    }
}

while (charPosition < sourceText.length) {
    const currentChar = sourceText[charPosition];
    const evaluationResult = evaluateCharacter(currentChar, runningTotal, priorNumeralValue);

    if (evaluationResult.kind === 'roman') {
        runningTotal = evaluationResult.newTotal;
        priorNumeralValue = evaluationResult.newPrior;
    } else {
        console.log(evaluationResult.totalToPrint);
        runningTotal = 0;
        priorNumeralValue = 0;
    }

    charPosition++;
}
