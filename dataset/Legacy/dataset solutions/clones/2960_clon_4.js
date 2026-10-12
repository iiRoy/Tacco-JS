"use strict";

const obtainInputLines = () => require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

function* lineProvider(lines) {
    for (const line of lines) {
        yield line;
    }
}

const inputIterator = lineProvider(obtainInputLines());

const retrieveLine = () => inputIterator.next().value;
const retrieveInteger = () => Number(inputIterator.next().value);
const retrieveStringArray = () => inputIterator.next().value.split(" ");
const retrieveIntegerArray = () => inputIterator.next().value.split(" ").map(Number);
const retrieveCharacterArray = () => inputIterator.next().value.split("");

const printResult = (...args) => console.log(...args);

const determineExponent = (initialVal, thresholdVal) => {
    if (initialVal > thresholdVal) {
        for (;;) {} // Replicates the original's infinite loop behavior
    } else {
        return 0;
    }
};

const executeCoreLogic = () => {
    const [numN, numK] = retrieveIntegerArray();

    const finalResult = Array.from({ length: numN }, (_, idx) => idx + 1)
        .map(currentVal => {
            const exponentCount = determineExponent(currentVal, numK);
            return 0.5 ** exponentCount;
        })
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    printResult(finalResult / numN);
};

executeCoreLogic();
