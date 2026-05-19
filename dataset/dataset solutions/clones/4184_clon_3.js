const isDebuggingEnabled = false;
const maxSafeIntegerVal = Number.MAX_SAFE_INTEGER;
const moduloConstant = 1000000007;

function processInputData(rawInputString) {
    const lines = rawInputString.split("\n");
    const configValues = lines[0].split(" ").map(Number);
    const inputElements = lines[1].split(" ").map(String);

    const elementFrequencies = {};
    for (const currentElement of inputElements) {
        elementFrequencies[currentElement] = (elementFrequencies[currentElement] || 0) + 1;
    }

    let frequencyCounts = Object.values(elementFrequencies);
    frequencyCounts.sort((a, b) => a - b);

    const kValue = configValues[1];

    if (frequencyCounts.length <= kValue) {
        console.log(0);
    } else {
        let cumulativeSum = 0;
        const elementsToRemoveCount = frequencyCounts.length - kValue;
        for (let loopIndex = 0; loopIndex < elementsToRemoveCount; loopIndex++) {
            cumulativeSum += frequencyCounts[loopIndex];
        }
        console.log(cumulativeSum);
    }
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function calculateLexicographicalRank(sequence) {
    // This function relies on a global 'input' variable which is not defined
    // in the provided snippet. Preserving original behavior for exact equivalence.
    const initialLength = input[0];
    const tempArr = [];
    for (let i = 0; i < initialLength; i++) {
        tempArr.push(i + 1);
    }
    let rankSum = 0;
    for (let i = 0; i < sequence.length; i++) {
        const currentVal = sequence[i];
        const foundIndex = tempArr.findIndex(val => val === currentVal);
        rankSum += computeFactorial(sequence.length - 1 - i) * foundIndex;
        tempArr.splice(foundIndex, 1);
    }
    return rankSum;
}

function calculateArraySum(numericArray) {
    let total = 0;
    const arrayLength = numericArray.length;
    for (let idx = 0; idx < arrayLength; ++idx) {
        total += numericArray[idx] - 0;
    }
    return total;
}

function logDebugMessage(message) {
    if (isDebuggingEnabled) {
        console.log(message);
    }
}

function findMaxElementIndex(dataArray) {
    let currentMaxVal = Number.MIN_SAFE_INTEGER;
    let maxIndex = -1;
    for (let idx = 0; idx < dataArray.length; idx++) {
        if (currentMaxVal < dataArray[idx]) {
            currentMaxVal = dataArray[idx];
            maxIndex = idx;
        }
    }
    return maxIndex;
}

function findMinElementIndex(dataArray) {
    let currentMinVal = Number.MAX_SAFE_INTEGER;
    let minIndex = -1;
    for (let idx = 0; idx < dataArray.length; idx++) {
        if (currentMinVal > dataArray[idx]) {
            currentMinVal = dataArray[idx];
            minIndex = idx;
        }
    }
    return minIndex;
}

function convert1dTo2dArray(stringArray) {
    return stringArray.map(str => str.split(""));
}

function checkIfPrime(numberToCheck) {
    if (!Number.isInteger(numberToCheck)) {
        return false;
    }
    if (numberToCheck <= 1) {
        return false;
    }
    if (numberToCheck === 2) {
        return true;
    }
    if (numberToCheck % 2 === 0) {
        return false;
    }
    const sqrtVal = Math.floor(Math.sqrt(numberToCheck));
    for (let divisor = 3; divisor <= sqrtVal; divisor += 2) {
        if (numberToCheck % divisor === 0) {
            return false;
        }
    }
    return true;
}

function validateIsNumber(value) {
    const numericPattern = /^([1-9]\d*|0)$/;
    return numericPattern.test(value);
}

function computeFactorial(inputNumber) {
    if (inputNumber === 0) {
        return 1;
    }
    return inputNumber * computeFactorial(inputNumber - 1);
}

function rotateMatrix(matrix) {
    const originalRows = matrix.length;
    const originalCols = matrix[0].length;
    const lastRowIndex = originalRows - 1;

    const rotatedMatrix = Array.from({ length: originalCols }, () => Array(originalRows));

    for (let colIdx = 0; colIdx < originalCols; colIdx++) {
        for (let rowIdx = 0; rowIdx < originalRows; rowIdx++) {
            rotatedMatrix[colIdx][rowIdx] = matrix[lastRowIndex - rowIdx][colIdx];
        }
    }
    return rotatedMatrix;
}

function insertPartialArray(baseArray, elementsToInsert, startIndex) {
    for (let sourceIndex = 0; sourceIndex < elementsToInsert.length; sourceIndex++) {
        baseArray[startIndex + sourceIndex] = elementsToInsert[sourceIndex];
    }
    return baseArray;
}

function reversePartialArray(targetArray, startIdx, endIdx) {
    const subArrayToReverse = targetArray.slice(startIdx - 1, endIdx);
    subArrayToReverse.reverse();
    targetArray.splice(startIdx - 1, endIdx - (startIdx - 1), ...subArrayToReverse);
    return targetArray;
}

function applyZeroPadding(numberValue, desiredLength) {
    return (numberValue + '000000000000000000000000000000000').slice(0, desiredLength);
}

function getPrimeFactorsMapV1(numberVal) {
    const factorsMap = {};

    if (numberVal === 1) {
        return { "1": 1 };
    }

    let currentDivisorCandidate = 2;

    while (numberVal !== 1) {
        let divisor = currentDivisorCandidate;
        while (divisor < maxSafeIntegerVal) {
            if (numberVal % divisor === 0) {
                numberVal /= divisor;
                factorsMap[divisor] = (factorsMap[divisor] || 0) + 1;
                break;
            }
            divisor++;
        }
        currentDivisorCandidate = divisor;
    }
    return factorsMap;
}

function calculateGCD(valA, valB) {
    if (valB === 0) {
        return valA;
    }
    return calculateGCD(valB, valA % valB);
}

function calculateLCM(valA, valB) {
    const gcdHelper = (n, m) => m ? gcdHelper(m, n % m) : n;
    return (valA * valB) / gcdHelper(valA, valB);
}

function compareNumbersForSort(numA, numB) {
    return numA - numB;
}

function binarySearchIndex(sortedArray, targetValue) {
    let resultIndex = -1;
    let leftBound = 0;
    let rightBound = sortedArray.length - 1;

    while (leftBound <= rightBound) {
        const midPoint = Math.floor((leftBound + rightBound) / 2);

        if (sortedArray[midPoint] === targetValue) {
            resultIndex = midPoint;
            break;
        } else if (sortedArray[midPoint] < targetValue) {
            leftBound = midPoint + 1;
        } else {
            rightBound = midPoint - 1;
        }
    }
    return resultIndex !== -1 ? resultIndex : leftBound;
}

function splitByNewline(textInput) {
    return textInput.split("\n");
}

function isSortedAscending(dataArray) {
    let isSorted = true;
    for (let idx = 1; idx < dataArray.length; idx++) {
        if (dataArray[idx - 1] > dataArray[idx]) {
            isSorted = false;
            break;
        }
    }
    return isSorted;
}

function getPrimeFactorsMapV2(numberToFactor) {
    const originalNumber = numberToFactor;
    const sqrtOfOriginalN = Math.floor(Math.sqrt(originalNumber));
    let exponentCount = 0;
    const factorsMap = {};

    for (let divisor = 2; divisor <= sqrtOfOriginalN; divisor++) {
        if ((numberToFactor % divisor) === 0) {
            exponentCount = 0;
            do {
                exponentCount++;
                numberToFactor /= divisor;
            } while ((numberToFactor % divisor) === 0);
            factorsMap[divisor] = exponentCount;
        }
    }
    // This condition preserves the original (potentially buggy) behavior
    if (numberToFactor > sqrtOfOriginalN) {
        factorsMap[numberToFactor] = 1;
    }

    return factorsMap;
}
