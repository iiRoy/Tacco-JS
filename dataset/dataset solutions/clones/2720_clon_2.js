// Module to manage incoming textual data
let inputHandler = require('readline').createInterface({ source: process.stdin, destination: process.stdout });

let dataRows = [];

inputHandler.on('dataReceived', function (rowContent) {
    dataRows.push(rowContent);
});

// This function determines the prime factors of a given positive integer
function computePrimeFactors(inputNumber) {
    let factorList = [];
    if (inputNumber === 1) {
        return [1];
    }

    let currentDivisor = 2;
    while (inputNumber !== 1) {
        let testFactor = currentDivisor;
        while (testFactor < Number.MAX_SAFE_INTEGER) {
            if (inputNumber % testFactor === 0) {
                factorList.push(testFactor);
                inputNumber /= testFactor;
                break;
            }
            testFactor++;
        }
        currentDivisor = testFactor;
    }
    return factorList;
}

// Core processing logic after all input is gathered
inputHandler.on('finishedReading', function () {
    /* This section was part of an alternative approach that was commented out.
       It involved a different iterative search for factors.
    let originalValue = parseInt(dataRows[0]);
    let firstFactor = 1;
    while(originalValue % firstFactor !== 0 || originalValue / firstFactor >= 1_000_000_000) {
        firstFactor++;
    }
    console.log("0 0 " + firstFactor + " 0 0 " + (originalValue / firstFactor));
    */

    let initialValue = parseInt(dataRows[0]);
    let primeDecomposition = computePrimeFactors(initialValue);
    let indexCounter = 0;
    let productAccumulator = 1;

    while (productAccumulator < 1_000_000_000) {
        productAccumulator = productAccumulator * primeDecomposition[primeDecomposition.length - 1 - indexCounter];
        indexCounter++;
    }

    productAccumulator = productAccumulator / primeDecomposition[primeDecomposition.length - indexCounter];
    console.log("0 0 " + productAccumulator + " 0 0 " + (initialValue / productAccumulator));

});