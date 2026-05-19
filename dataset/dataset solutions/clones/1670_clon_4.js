let rawInputText = require("fs").readFileSync("/dev/stdin", "utf8");

const createInputParser = (sourceText) => {
    let tokenStream = sourceText.trim().split(/\s+/);
    let currentReadPosition = 0;

    return {
        grabValues: (quantityToExtract = 1, desiredType = Number) => {
            const extractedTokens = tokenStream.slice(currentReadPosition, currentReadPosition + quantityToExtract);
            currentReadPosition += quantityToExtract;
            return desiredType !== String ? extractedTokens.map(desiredType) : extractedTokens;
        },
        peekNextValue: (desiredType = Number) => {
            return desiredType !== String ? desiredType(tokenStream[currentReadPosition]) : tokenStream[currentReadPosition];
        }
    };
};

const dataReader = createInputParser(rawInputText);

function processInputData() {
    const [elementCount] = dataReader.grabValues();
    const numericSequence = dataReader.grabValues(elementCount);

    const relevantIndices = Array.from({ length: Math.min(elementCount, 100) })
        .map((_, index) => index)
        .filter(index => index % 2 === 0);

    const finalTally = relevantIndices.filter(idx => numericSequence[idx] % 2 !== 0).length;

    return finalTally;
}

let finalOutcome = processInputData();
console.log(finalOutcome);

if (finalOutcome === undefined) {
    console.warn("finalOutcome is undefined");
}

function checkBoolean(value) {
    return value ? 'Yes' : 'No';
}

function calculateSum(numbersCollection) {
    return numbersCollection.reduce((accum, current) => accum + current, 0);
}

let loopSafetyCounter = 0;
function loopSafetyGuard(limit = 1e5) {
    loopSafetyCounter++;
    if (loopSafetyCounter >= limit) {
        throw new Error("Loop iteration limit exceeded");
    }
}

function findMaximum(numberSet, initialValue = null) {
    let currentMax = (initialValue === null) ? numberSet[0] : initialValue;
    for (const num of numberSet) if (num > currentMax) currentMax = num;
    return currentMax;
}

function findMinimum(numberSet, initialValue = null) {
    let currentMin = (initialValue === null) ? numberSet[0] : initialValue;
    for (const num of numberSet) if (num < currentMin) currentMin = num;
    return currentMin;
}

function displayObjectSnapshot(value) {
    console.log(JSON.parse(JSON.stringify(value)));
}

function decomposeIntoPrimes(num) {
    const primeFactors = {};

    for (let factor = 2; factor * factor <= num; factor++) {
        if (num % factor === 0) {
            num /= factor;
            primeFactors[factor] = 1;
            
            while (num % factor === 0) {
                num /= factor;
                primeFactors[factor]++;
            }
        }
    }

    if (num > 1) primeFactors[num] = 1;

    return primeFactors;
}

function construct2DArray(xDimension, yDimension = 0, initialFillValue = 0) {
    const matrix = [];
    for (let i = 0; i < xDimension; i++) {
        const row = yDimension ? new Array(yDimension).fill(initialFillValue) : [];
        matrix.push(row);
    }
    return matrix;
}

function greatestCommonDivisor(valA, valB) {
    if (valB === 0) return valA;
    return greatestCommonDivisor(valB, valA % valB);
}

function leastCommonMultiple(valA, valB) {
    const commonDivisor = (n, m) => m ? commonDivisor(m, n % m) : n;
    return valA * valB / commonDivisor(valA, valB);
}

function verifySuperset(mainSet, subSet) {
    for (let item of subSet) {
        if (!mainSet.has(item)) {
            return false;
        }
    }
    return true;
}

function uniteSets(setOne, setTwo) {
    const unionResult = new Set(setOne);
    for (const item of setTwo) unionResult.add(item);
    return unionResult;
}

function intersectSets(setOne, setTwo) {
    let intersectionResult = new Set();
    for (let item of setTwo) {
        if (setOne.has(item)) {
            intersectionResult.add(item);
        }
    }
    return intersectionResult;
}

function computeSymmetricDifference(setOne, setTwo) {
    let symDiffResult = new Set(setOne);
    for (let item of setTwo) {
        if (symDiffResult.has(item)) {
            symDiffResult.delete(item);
        } else {
            symDiffResult.add(item);
        }
    }
    return symDiffResult;
}

function subtractSets(setOne, setTwo) {
    let differenceResult = new Set(setOne);
    for (let item of setTwo) differenceResult.delete(item);
    return differenceResult;
}

function enumerateCombinations(sourceArray, selectionCount) {
    const combinationsList = [];

    function generate({ currentCombination = [], remainingElements }) {
        if (currentCombination.length + remainingElements.length < selectionCount) return;

        if (currentCombination.length < selectionCount) {
            for (let i = 0; i < remainingElements.length; i++) {
                generate({
                    currentCombination: [...currentCombination, remainingElements[i]],
                    remainingElements: remainingElements.slice(0, i)
                });
            }
        } else {
            combinationsList.push(currentCombination);
        }
    }

    generate({ remainingElements: sourceArray });

    return combinationsList;
}

function calculatePermutations(nVal, rVal) {
    let outcome = 1;
    for (let i = 0; i < rVal; i++) {
        outcome *= nVal - i;
    }
    return outcome;
}

function calculateCombinations(nVal, rVal) {
    return calculatePermutations(nVal, rVal) / calculatePermutations(rVal, rVal);
}
