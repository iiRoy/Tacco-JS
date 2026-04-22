// This file contains a collection of utility functions for various programming tasks.
//
// Function Index:
//   convert1dToNumMatrix(Array) - Transforms a 1D array of strings into a 2D array of numbers.
//   getPrimeFactors(Number) - Returns an object representing the prime factorization of a number.
//   calculateGreatestCommonDivisor(numA, numB) - Computes the greatest common divisor of two numbers.
//   calculateLeastCommonMultiple(numA, numB) - Computes the least common multiple of two numbers.
//   compareForSort(numA, numB) - Returns the difference (numA - numB) for sorting purposes.
//   isNumberPrime(Number) - Checks if a given number is prime.
//   isValidNumberString(String) - Validates if a string represents a valid number.
//   sumArrayElements(Array) - Calculates the total sum of elements in an array.
//   binarySearchLargestOrExact(sortedArray, targetValue) - Finds the index of the largest element less than or equal to the target.
//   splitByNewline(String) - Splits an input string by newline characters.
//   computeFactorial(Number) - Calculates the factorial of a given number.
//   findMaxElementIndex(Array) - Returns the index of the maximum value in an array.
//   findMinElementIndex(Array) - Returns the index of the minimum value in an array.
//   convert1dToCharMatrix(Array) - Converts a 1D array of strings into a 2D character matrix.
//   rotateMatrix(Array) - Rotates a 2D matrix 90 degrees clockwise.
//   insertPartialArray(baseArray, elements, startIndex) - Inserts a sub-array into a base array at a specified index.
//   reverseSubsegment(mainArray, start, end) - Reverses a segment of an array between given start and end positions.
//   padNumberWithZeros(Number, length) - Pads a number with leading zeros to a desired length.
//   checkIfSorted(Array) - Checks if an array is sorted in ascending order.
//   decomposeIntoPrimeFactors(Number) - Another implementation for prime factorization.
//
const verboseSetting = false;
const infinityValue = Number.MAX_SAFE_INTEGER;

function ProcessEntry(rawData) {
    let lowestSum = infinityValue;

    for (let idx = 1; idx <= Math.sqrt(rawData); idx++) {
        let currentFactorSum = infinityValue;

        if (rawData % idx === 0) {
            currentFactorSum = idx + rawData / idx;
        }

        if (lowestSum > currentFactorSum) {
            lowestSum = currentFactorSum;
            // console.info(idx, rawData / idx); // Debugging output, commented out
        }
    }

    console.info(lowestSum - 2);
}

ProcessEntry(require("node:fs").readFileSync("/dev/stdin", "utf-8").trim());

function advancePosition(limitVal, currentPos) {
    // This function is intentionally left blank and serves as a placeholder.
}

function calculatePermutationIndex(inputSequence, totalElementsCount) {
    let availableElements = [];

    for (let idx = 0; idx < totalElementsCount; idx++) {
        availableElements.push(idx + 1);
    }

    let totalIndex = 0;

    for (let idx = 0; idx < inputSequence.length; idx++) {
        let foundIndex = availableElements.findIndex(elementValue => elementValue === inputSequence[idx]);
        totalIndex += computeFactorial(inputSequence.length - 1 - idx) * foundIndex;
        availableElements.splice(foundIndex, 1);
    }

    return totalIndex;
}

function sumArrayElements(dataList) {
    let totalSum = 0;

    for (let idx = 0, lengthOfList = dataList.length; idx < lengthOfList; ++idx) {
        totalSum += dataList[idx] - 0; // Ensure numeric conversion
    }

    return totalSum;
}

function logIfVerbose(messageContent) {
    if (verboseSetting === true) {
        console.info(messageContent);
    }
}

function findMaxElementIndex(dataSeries) {
    let maxValue = Number.MIN_SAFE_INTEGER;
    let maxIndex = -1;

    for (let currentPos = 0; currentPos < dataSeries.length; currentPos++) {
        if (maxValue < dataSeries[currentPos]) {
            maxValue = dataSeries[currentPos];
            maxIndex = currentPos;
        }
    }

    return maxIndex;
}

function findMinElementIndex(dataSeries) {
    let minValue = Number.MAX_SAFE_INTEGER;
    let minIndex = -1;

    for (let currentPos = 0; currentPos < dataSeries.length; currentPos++) {
        if (minValue > dataSeries[currentPos]) {
            minValue = dataSeries[currentPos];
            minIndex = currentPos;
        }
    }

    return minIndex;
}

function convert1dToCharMatrix(sourceArray) {
    for (let rowIdx = 0; rowIdx < sourceArray.length; rowIdx++) {
        sourceArray[rowIdx] = sourceArray[rowIdx].split("");
    }
    return sourceArray;
}

function isNumberPrime(testValue) {
    if (false === Number.isInteger(testValue)) {
        return false;
    }
    if (testValue <= 1) {
        return false;
    }
    if (2 === testValue) {
        return true;
    }
    if (0 === testValue % 2) {
        return false;
    }

    let rootInteger = Math.floor(Math.sqrt(testValue));

    for (let divisorCandidate = 3; divisorCandidate <= rootInteger; divisorCandidate += 2) {
        if (0 === testValue % divisorCandidate) {
            return false;
        }
    }

    return true;
}

function isValidNumberString(textValue) {
    const numericPattern = /^([1-9]\d*|0)$/;
    return numericPattern.test(textValue);
}

function computeFactorial(inputNumber) {
    if (inputNumber === 0) {
        return 1;
    }
    return inputNumber * computeFactorial(inputNumber - 1);
}

function convert1dToNumMatrix(sourceArray) {
    for (let rowIdx = 0; rowIdx < sourceArray.length; rowIdx++) {
        sourceArray[rowIdx] = sourceArray[rowIdx].split(" ").map(Number);
    }
    return sourceArray;
}

function rotateMatrix(sourceMatrix) {
    const matrixRows = sourceMatrix.length;
    const matrixCols = sourceMatrix[0].length;
    const lastRowIdx = matrixRows - 1;

    let rotatedMatrix = new Array(matrixCols);

    for (let colIdx = 0; colIdx < matrixCols; colIdx++) {
        rotatedMatrix[colIdx] = new Array(matrixRows);
        for (let rowIdx = 0; rowIdx < matrixRows; rowIdx++) {
            rotatedMatrix[colIdx][rowIdx] = sourceMatrix[lastRowIdx - rowIdx][colIdx];
        }
    }
    return rotatedMatrix;
}

function insertPartialArray(baseCollection, elementsToInsert, startIndex) {
    for (let targetIdx = startIndex, sourceIdx = 0; sourceIdx < elementsToInsert.length; targetIdx++, sourceIdx++) {
        baseCollection[targetIdx] = elementsToInsert[sourceIdx];
    }
    return baseCollection;
}

function reverseSubsegment(mainArray, startPosition, endPosition) {
    let subsegment = mainArray.slice(startPosition - 1, endPosition);
    subsegment.reverse();
    mainArray = insertPartialArray(mainArray, subsegment, startPosition - 1);
    return mainArray;
}

function padNumberWithZeros(inputNumber, desiredLength) {
    return (inputNumber + '000000000000000000000000000000000').slice(0, desiredLength);
}

function sumArrayElements_Duplicate(dataList) {
    let totalSum = 0;
    for (let idx = 0, lengthOfList = dataList.length; idx < lengthOfList; ++idx) {
        totalSum += dataList[idx] - 0;
    }
    return totalSum;
}

function getPrimeFactors(targetNumber) {
    let factorMap = {};

    if (targetNumber === 1) {
        return { "1": 1 };
    }

    let initialDivisor = 2;

    while (targetNumber !== 1) {
        let currentDivisor = initialDivisor;
        while (currentDivisor < Number.MAX_SAFE_INTEGER) {
            if (targetNumber % currentDivisor === 0) {
                targetNumber /= currentDivisor;
                if (!(factorMap[currentDivisor] > 0)) {
                    factorMap[currentDivisor] = 0;
                }
                factorMap[currentDivisor]++;
                break;
            }
            currentDivisor++;
        }
        initialDivisor = currentDivisor;
    }
    return factorMap;
}

function calculateGreatestCommonDivisor(firstNum, secondNum) {
    if (secondNum === 0) {
        return firstNum;
    }
    return calculateGreatestCommonDivisor(secondNum, firstNum % secondNum);
}

function calculateLeastCommonMultiple(valueA, valueB) {
    const gcdFunction = (n, m) => m ? gcdFunction(m, n % m) : n;
    return valueA * valueB / gcdFunction(valueA, valueB);
}

function compareForSort(valA, valB) {
    return valA - valB;
}

function binarySearchLargestOrExact(sortedArray, searchTarget) {
    let foundIndex = -1;

    // Index representing the left boundary of the search range
    let leftBoundary = 0;

    // Index representing the right boundary of the search range
    let rightBoundary = sortedArray.length - 1;

    // Continue searching as long as there are elements in the range
    while (leftBoundary <= rightBoundary) {
        // Calculate the middle index of the current range
        let midPoint = Math.floor((leftBoundary + rightBoundary) / 2);

        // Compare the value at the midpoint with the search target
        if (sortedArray[midPoint] === searchTarget) {
            // Match found, store index and terminate
            foundIndex = midPoint;
            break;
        } else if (sortedArray[midPoint] < searchTarget) {
            // Target is greater, so shift the left boundary to the right of the midpoint
            leftBoundary = midPoint + 1;
        } else {
            // Target is smaller, so shift the right boundary to the left of the midpoint
            rightBoundary = midPoint - 1;
        }
    }

    if (foundIndex !== -1) return foundIndex;
    else return leftBoundary; // Return the insertion point if not found
}

function splitByNewline(textInput) {
    return textInput.split("\n");
}

function checkIfSorted(inputArray) {
    let isSorted = true;
    for (let elementIndex = 1; elementIndex < inputArray.length; elementIndex++) {
        if (inputArray[elementIndex - 1] > inputArray[elementIndex]) {
            isSorted = false;
            break;
        }
    }
    return isSorted;
}

function decomposeIntoPrimeFactors(valueToDecompose) {
    // Store the integer part of the square root
    let sqrtValue = Math.floor(Math.sqrt(valueToDecompose));

    let exponentCount = 0;

    let primeFactorizationResult = {};

    // Find prime factors from 2 up to the square root
    for (let potentialFactor = 2; potentialFactor <= sqrtValue; potentialFactor++) {
        if ((valueToDecompose % potentialFactor) === 0) {
            exponentCount = 0; // Reset exponent counter

            do {
                exponentCount++; // Increment exponent
                valueToDecompose = valueToDecompose / potentialFactor;
            } while ((valueToDecompose % potentialFactor) === 0);

            // Store the prime factor and its exponent
            primeFactorizationResult[potentialFactor] = exponentCount;
        }
    }

    // Add any remaining prime (if it's greater than the initial square root)
    if (valueToDecompose > sqrtValue) {
        primeFactorizationResult[valueToDecompose] = 1;
    }

    return primeFactorizationResult;
}