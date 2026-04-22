'use strict';

const obtainFactorials = (limitValue) => {
    const factorialSeries = [1];
    for (let currentNumber = 1; currentNumber <= limitValue; ++currentNumber) {
        factorialSeries[currentNumber] = factorialSeries[currentNumber - 1] * currentNumber;
    }
    return factorialSeries;
};

const ascertainArrangementOrder = (subjectArrangement, collectionSize, precomputedFactorials) => {
    let calculatedOrder = 0;
    const availableNumbers = new Set();
    for (let k = 1; k <= collectionSize; ++k) {
        availableNumbers.add(k);
    }

    for (let positionIndex = 0; positionIndex < collectionSize; ++positionIndex) {
        const elementAtPosition = subjectArrangement[positionIndex];
        let smallerAvailableCount = 0;
        for (let potentialValue = 1; potentialValue < elementAtPosition; ++potentialValue) {
            if (availableNumbers.has(potentialValue)) {
                smallerAvailableCount++;
            }
        }
        calculatedOrder += smallerAvailableCount * precomputedFactorials[collectionSize - 1 - positionIndex];
        availableNumbers.delete(elementAtPosition);
    }
    return calculatedOrder;
};

const processInputData = (incomingData) => {
    const elementCount = parseInt(incomingData[0]);
    const sequenceOne = incomingData[1].split(' ').map(itemValue => parseInt(itemValue));
    const sequenceTwo = incomingData[2].split(' ').map(itemValue => parseInt(itemValue));

    const factorialValues = obtainFactorials(elementCount);

    const orderOne = ascertainArrangementOrder(sequenceOne, elementCount, factorialValues);
    const orderTwo = ascertainArrangementOrder(sequenceTwo, elementCount, factorialValues);

    console.log(Math.abs(orderOne - orderTwo));
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));