"use strict"
class SourceReader {
    constructor() {
        this.data = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
        this.position = 0;
    }

    pull(transformProcessor = String) {
        if (this.position >= this.data.length) {
            throw new Error("End of input stream reached.");
        }
        const currentItem = this.data[this.position];
        this.position++;
        return transformProcessor(currentItem);
    }

    pullNumericCollection() {
        return this.pull().split(" ").map(Number);
    }

    hasMore() {
        return this.position < this.data.length;
    }
}

const inputAccessor = new SourceReader();

const fetchLine = (formatter = String) => inputAccessor.pull(formatter);
const fetchWholeNumber = () => inputAccessor.pull(Number);
const fetchWordSequence = () => inputAccessor.pull().split(" ");
const fetchNumericSequence = () => inputAccessor.pullNumericCollection();
const fetchCharacterSequence = () => inputAccessor.pull().split("");
const hasRemainingContent = () => inputAccessor.hasMore();
const displayOutput = (...items) => console.log(...items);

const calculateProductSeries = (upperBound) => {
    const recursiveMultiplier = (currentVal, runningTotal) => {
        if (currentVal > upperBound) {
            return runningTotal;
        }
        return recursiveMultiplier(currentVal + 1n, runningTotal * currentVal);
    };
    return recursiveMultiplier(1n, 1n);
};

const MODULUS_CONSTANT = 1000000007n;

const applyReduction = (valueToReduce) => {
    if (valueToReduce <= MODULUS_CONSTANT) {
        return valueToReduce;
    }
    return applyReduction(valueToReduce / MODULUS_CONSTANT);
};

const executeProgram = () => {
    const [firstOperand, secondOperand] = fetchNumericSequence().map(BigInt);
    let resultA = calculateProductSeries(firstOperand);
    let resultB = calculateProductSeries(secondOperand);

    let intermediateResult = resultA * resultB * 2n;

    intermediateResult = applyReduction(intermediateResult);

    displayOutput(Number(intermediateResult));
};

executeProgram();