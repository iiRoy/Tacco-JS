function performCalculation(incomingTextLines) {
    const targetLine = incomingTextLines[0];

    const numericalValues = targetLine.split(' ').map(parseFloat);

    const firstOperandSum = numericalValues[0] + numericalValues[1];
    const secondOperandSum = numericalValues[2] + numericalValues[3];

    const comparisonResult = firstOperandSum - secondOperandSum;

    const outputMapping = new Map([
        [-1, "Right"],
        [0, "Balanced"],
        [1, "Left"]
    ]);

    const finalMessage = outputMapping.get(Math.sign(comparisonResult));

    const displayResult = (message) => {
        console.log(message);
    };

    displayResult(finalMessage);
}

const rawFileContent = require('fs').readFileSync('/dev/stdin');
const preparedInputLines = rawFileContent.toString('utf8').trim().split('\n');

performCalculation(preparedInputLines);