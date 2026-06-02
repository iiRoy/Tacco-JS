process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputLines = [];
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

function computeSpecialProduct(baseOperand, exponentOperand) {
    const decrementedBase = baseOperand - 1;
    const decrementedExponent = exponentOperand - 1;

    const powerResult = Math.pow(decrementedBase, decrementedExponent);

    const finalCalculatedValue = powerResult * baseOperand;

    return finalCalculatedValue;
}

inputReader.on('close', () => {
    const rawInputParts = inputLines[0].split(" ");

    const firstStringValue = rawInputParts[0];
    const secondStringValue = rawInputParts[1];

    const firstNumericValue = Number(firstStringValue);
    const secondNumericValue = Number(secondStringValue);

    const finalOutput = computeSpecialProduct(secondNumericValue, firstNumericValue);

    console.log(finalOutput);
});

const findMinimum = (...valuesArray) => {
    return valuesArray.reduce((currentMin, nextVal) => Math.min(currentMin, nextVal), valuesArray[0]);
};
