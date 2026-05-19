"use strict";

const fileSystem = require("fs");

function* numericTokenStream(sourceText) {
    const rawTokens = sourceText.match(/\S+/g);
    if (rawTokens) {
        for (const tokenString of rawTokens) {
            yield Number(tokenString);
        }
    }
}

let currentTokenIterator;

const retrieveNextNumericOperand = () => currentTokenIterator.next().value;

const derivePairCombinations = (itemCount) => {
    if (itemCount < 2) {
        return 0;
    }
    let cumulativeSum = 0;
    for (let counter = 1; counter < itemCount; counter++) {
        cumulativeSum += counter;
    }
    return cumulativeSum;
};

function orchestrateCalculation() {
    const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    currentTokenIterator = numericTokenStream(rawInputContent);

    const firstQuantity = retrieveNextNumericOperand();
    const secondQuantity = retrieveNextNumericOperand();

    return derivePairCombinations(firstQuantity) + derivePairCombinations(secondQuantity);
}

const computedOutcome = orchestrateCalculation();
console.log(computedOutcome);
