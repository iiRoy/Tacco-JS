"use strict";

class PrimalityOracle {
    #upperBound;
    #truthArray;

    constructor(limit) {
        this.#upperBound = limit;
        this.#truthArray = new Array(limit + 1).fill(true);
        this.#truthArray[0] = false;
        this.#truthArray[1] = false;

        for (let factor = 2; factor * factor <= limit; ++factor) {
            if (this.#truthArray[factor]) {
                for (let multiple = factor * factor; multiple <= limit; multiple += factor) {
                    this.#truthArray[multiple] = false;
                }
            }
        }
    }

    query(numberToCheck) {
        if (numberToCheck < 0 || numberToCheck > this.#upperBound) {
            return false;
        }
        return this.#truthArray[numberToCheck];
    }

    *iteratePrimes(startFrom = 2, maxNumber = this.#upperBound) {
        for (let candidate = startFrom; candidate <= maxNumber; ++candidate) {
            if (this.#truthArray[candidate]) {
                yield candidate;
            }
        }
    }
}

function obtainCombinations(sourceSet, selectionCount) {
    if (selectionCount < 0 || selectionCount > sourceSet.length) {
        return [];
    }
    if (selectionCount === 0) {
        return [[]];
    }
    if (selectionCount === sourceSet.length) {
        return [sourceSet];
    }
    if (sourceSet.length === 0) {
        return [];
    }

    const firstItem = sourceSet[0];
    const remainder = sourceSet.slice(1);

    const combosExcludingFirst = obtainCombinations(remainder, selectionCount);
    const combosIncludingFirst = obtainCombinations(remainder, selectionCount - 1).map(
        subCombo => [firstItem, ...subCombo]
    );

    return [...combosExcludingFirst, ...combosIncludingFirst];
}

function processQuery(rawData) {
    const desiredQuantity = parseInt(rawData, 10);
    const upperPrimeBound = 55555;
    const maxPossibleSumValue = 5 * upperPrimeBound;
    
    const primeChecker = new PrimalityOracle(maxPossibleSumValue);

    let currentWindow = [];
    const primeGenerator = primeChecker.iteratePrimes(2, upperPrimeBound);

    for (const currentNumber of primeGenerator) {
        currentWindow.push(currentNumber);

        if (currentWindow.length < desiredQuantity) {
            continue;
        }

        if (currentWindow.length > desiredQuantity) {
            currentWindow.shift();
        }

        const allFiveMemberSubsets = obtainCombinations(currentWindow, 5);

        let conditionMet = false;
        if (allFiveMemberSubsets.length > 0) {
            const firstSubset = allFiveMemberSubsets[0];
            const sumOfFirstSubset = firstSubset.reduce((total, val) => total + val, 0);
            conditionMet = !primeChecker.query(sumOfFirstSubset);
        }

        if (conditionMet) {
            console.log(currentWindow.join(' '));
            return;
        }
    }
}

processQuery(require('fs').readFileSync('/dev/stdin', 'utf8'));