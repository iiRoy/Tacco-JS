function processInputData(rawData) {
    const [firstOperand, secondOperand] = rawData.split(' ').map(Number);

    const operationResults = [
        firstOperand + secondOperand,
        firstOperand - secondOperand,
        firstOperand * secondOperand
    ];

    const computedMaximum = Math.max(...operationResults);

    const finalResult = (computedMaximum === -0) ? 0 : computedMaximum;

    console.log(finalResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
