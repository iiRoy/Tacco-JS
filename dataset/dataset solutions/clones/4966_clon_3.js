const fileSystem = require("fs");

const getNumericValueFromLine = (linesCollection, lineIndex) => {
    const lineContent = linesCollection[lineIndex];
    return Number(lineContent);
};

const computeTrapezoidArea = (baseA, baseB, heightVal) => {
    const sumOfParallelSides = baseA + baseB;
    const areaDivisor = 2;
    return (sumOfParallelSides * heightVal) / areaDivisor;
};

const rawInputLines = fileSystem.readFileSync("/dev/stdin", "UTF-8").trim().split("\n");

const firstBase = getNumericValueFromLine(rawInputLines, 0);
const secondBase = getNumericValueFromLine(rawInputLines, 1);
const trapezoidHeight = getNumericValueFromLine(rawInputLines, 2);

const finalResult = computeTrapezoidArea(firstBase, secondBase, trapezoidHeight);

console.log(finalResult);
