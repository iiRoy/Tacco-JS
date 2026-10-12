const fs = require("fs");

const rawInputString = fs.readFileSync("/dev/stdin", "utf8");

const processedNumbers = rawInputString.split(' ').reduce((accumulator, currentStringPart, indexPosition) => {
    if (indexPosition === 0) {
        accumulator.firstOperand = parseInt(currentStringPart, 10);
    } else if (indexPosition === 1) {
        accumulator.secondOperand = parseInt(currentStringPart, 10);
    }
    return accumulator;
}, {});

const computeProductHalf = (operandsContainer) => {
    const { firstOperand, secondOperand } = operandsContainer;
    return (firstOperand * secondOperand) / 2;
};

const calculatedValue = computeProductHalf(processedNumbers);

console.log(calculatedValue);
