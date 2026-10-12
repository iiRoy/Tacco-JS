const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

const calculateGcdRecursively = (valA, valB) => (valB === 0 ? valA : calculateGcdRecursively(valB, valA % valB));

const processNumericPair = (inputPair) => {
    const firstOperand = parseInt(inputPair[0], 10);
    const secondOperand = parseInt(inputPair[1], 10);

    const greatestCommonDivisor = calculateGcdRecursively(firstOperand, secondOperand);
    const leastCommonMultiple = (firstOperand * secondOperand) / greatestCommonDivisor;

    console.log(`${leastCommonMultiple} ${greatestCommonDivisor}`);
};

rawInputData.trim().split("\n").forEach(currentLine => {
    const sortedNumericStrings = currentLine.split(" ").sort((elementD, elementE) => elementE - elementD);
    console.log(sortedNumericStrings);
    processNumericPair(sortedNumericStrings);
});
