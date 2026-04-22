((sourceData) => {
    let newlinePosition = sourceData.indexOf('\n');
    let numericSequence = sourceData.substring(0, newlinePosition);

    let collectedNumbers = numericSequence.match(/\d+/g).map(Number);

    let firstOperand = collectedNumbers[0];
    let secondOperand = collectedNumbers[1];

    let numeratorComponent = firstOperand - secondOperand;
    let denominatorComponent = secondOperand - 1;

    let calculatedValue = Math.trunc((numeratorComponent + denominatorComponent - 1) / denominatorComponent) + 1;

    process.stdout.write(String(calculatedValue) + '\n');
})(require('fs').readFileSync(0, 'utf8'));