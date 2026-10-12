function calculateAndDisplayMax(sourceData) {
    const lineComponents = sourceData[0].split(' ');
    const firstOperand = Number(lineComponents[0]);
    const secondOperand = Number(lineComponents[1]);

    const sumResult = firstOperand + secondOperand;
    const differenceResult = firstOperand - secondOperand;
    const productResult = firstOperand * secondOperand;

    let currentHighestValue;

    currentHighestValue = (sumResult > differenceResult) ? sumResult : differenceResult;

    currentHighestValue = (productResult > currentHighestValue) ? productResult : currentHighestValue;

    console.log(currentHighestValue);
}

calculateAndDisplayMax(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
