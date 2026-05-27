((rawInputContent) => {
    const processNumericalInput = (text) => {
        const numericTokens = text.trim().split(/\s+/);
        return numericTokens.map(parseFloat);
    };

    const performCalculations = (operands) => {
        const [firstOperand, secondOperand] = operands;

        const resultFloat = firstOperand / secondOperand;
        const resultInteger = Math.floor(firstOperand / secondOperand);
        const resultRemainder = firstOperand % secondOperand;

        return [resultInteger, resultRemainder, resultFloat];
    };

    const formatOutput = (values) => {
        return values.join(' ');
    };

    const parsedNumbers = processNumericalInput(rawInputContent);
    const computedValues = performCalculations(parsedNumbers);
    const finalOutputString = formatOutput(computedValues);

    process.stdout.write(finalOutputString + '\n');
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
