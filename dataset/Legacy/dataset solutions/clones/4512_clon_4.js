"use strict";

const obtainInputLines = function* () {
    const rawContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
    const lines = rawContent.split("\n");
    for (const line of lines) {
        yield line;
    }
};

const lineSource = obtainInputLines();

const retrieveNextLine = () => {
    const { value, done } = lineSource.next();
    if (done) {
        throw new Error("Input stream exhausted");
    }
    return value;
};

const retrieveNextInteger = () => parseInt(retrieveNextLine());
const retrieveNextStringArray = () => retrieveNextLine().split(" ");
const retrieveNextIntegerArray = () => retrieveNextLine().split(" ").map(Number);
const retrieveNextCharacterArray = () => retrieveNextLine().split("");

const emitOutput = (...items) => console.log(...items);

const calculateFactorialRecursive = (numValue) => {
    if (numValue <= 1n) {
        return 1n;
    }
    return numValue * calculateFactorialRecursive(numValue - 1n);
};

const MODULUS_VALUE = 1000000007n;

const reduceByRepeatedDivision = (initialVal, divisor) => {
    if (initialVal <= divisor) {
        return initialVal;
    }
    return reduceByRepeatedDivision(initialVal / divisor, divisor);
};

const executeMainProcess = () => {
    const [firstNum, secondNum] = retrieveNextIntegerArray();

    let intermediateResult = calculateFactorialRecursive(BigInt(firstNum)) * calculateFactorialRecursive(BigInt(secondNum)) * 2n;

    let finalProcessedResult = reduceByRepeatedDivision(intermediateResult, MODULUS_VALUE);

    emitOutput(Number(finalProcessedResult));
};

executeMainProcess();
