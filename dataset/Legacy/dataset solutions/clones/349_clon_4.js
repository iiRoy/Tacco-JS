function performLargeSum(firstOperand, secondOperand) {
    const firstDigits = String(firstOperand).split('').reverse().map(Number);
    const secondDigits = String(secondOperand).split('').reverse().map(Number);
    const resultDigits = [];
    let currentCarry = 0;
    let digitIndex = 0;

    while (digitIndex < firstDigits.length || digitIndex < secondDigits.length || currentCarry > 0) {
        const digitFromFirst = firstDigits[digitIndex] || 0;
        const digitFromSecond = secondDigits[digitIndex] || 0;

        const totalSum = digitFromFirst + digitFromSecond + currentCarry;
        resultDigits.push(totalSum % 10);
        currentCarry = Math.floor(totalSum / 10);
        digitIndex++;
    }

    while (resultDigits.length > 1 && resultDigits[resultDigits.length - 1] === 0) {
        resultDigits.pop();
    }

    return resultDigits.reverse().join('');
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const problemStatements = fileContent.trim().split('\n');

problemStatements.forEach(statementLine => {
    const components = statementLine.split(/[\+\=]/);
    const leftTermPattern = components[0];
    const rightTermPattern = components[1];
    const expectedOutcomePattern = components[2];

    const candidateDigits = Array.from({ length: 10 }, (_, idx) => idx);
    const matchingSolutions = candidateDigits.filter(digitValue => {
        const substitutedLeft = Number(leftTermPattern.replace(/X/g, digitValue));
        const substitutedRight = Number(rightTermPattern.replace(/X/g, digitValue));
        const substitutedOutcome = expectedOutcomePattern.replace(/X/g, digitValue);

        return performLargeSum(substitutedLeft, substitutedRight) === substitutedOutcome;
    });

    if (matchingSolutions.length === 1) {
        console.log(matchingSolutions[0]);
    } else {
        console.log("NA");
    }
});
