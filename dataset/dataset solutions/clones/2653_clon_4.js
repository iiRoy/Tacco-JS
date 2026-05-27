function processNumericInput(inputLine) {
    const operands = inputLine.split(' ').map(parseFloat);
    const operandOne = operands[0];
    const operandTwo = operands[1];

    const computedValues = [
        operandOne + operandTwo,
        operandOne - operandTwo,
        operandOne * operandTwo
    ];

    const greatestValue = Math.max(...computedValues);

    console.log(greatestValue);
}

processNumericInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
