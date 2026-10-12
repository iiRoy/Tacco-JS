/*
 * Utility Function Catalog
 *
 * transform1dTo2d(inputArray) - Converts a one-dimensional array into a two-dimensional one.
 * primeFactorize(numberVal) - Returns an object containing the prime factorization of a number.
 * findGCD(val1, val2) - Computes the greatest common divisor of two numbers.
 * findLCM(val1, val2) - Computes the least common multiple of two numbers.
 * subtractValues(valA, valB) - Returns the difference (valA - valB), useful for sorting.
 * checkPrime(value) - Determines if a number is prime, returning a boolean.
 * isNumericValue(value) - Checks if a given value is a number, returning a boolean.
 * calculateArraySum(numericArray) - Calculates the sum of all elements in an array.
 * binarySearchLargestLessEqual(sortedArray, targetValue) - Finds the index of the largest element less than or equal to a target in a sorted array.
 * splitByNewline(inputString) - Splits an input string by newline characters.
 */
const traceEnabled = false;
const maxIntVal = Number.MAX_SAFE_INTEGER;
const primeModulo = 1000000007;

function ProcessInput(rawContent) {
    rawContent = rawContent.split("\n");
    let dataList = rawContent[1].split(" ").map(Number);
    let xorAccumulator = 0;
    dataList.forEach(function(item) {
        xorAccumulator = xorAccumulator ^ item;
    });
    let resultArray = [];
    dataList.forEach(function(item) {
        resultArray.push(xorAccumulator ^ item);
    });
    console.log(resultArray.join(" "));
}
ProcessInput(require("node:fs").readFileSync("/dev/stdin", "utf8").trim());

function raiseToPower(baseVal, exponentVal) {
    let finalResult = 0; // Initialize result variable
    for (let counter = 0n; counter < exponentVal; counter += 1n) { // Loop from zero up to the exponent using BigInts
        if (finalResult === 0) { // Check if result is still zero
            finalResult = baseVal; // First iteration, assign base
        } else {
            finalResult *= baseVal; // Subsequent iterations, multiply by base
        }
    }
    return baseVal; // Original code returns 'baseVal' instead of 'finalResult', preserving this behavior.
}

function lexicographicalRank(sequence) {
    let availableNumbers = [];
    // 'rawContent' is implicitly expected from the global scope, mirroring the original's 'input[0]' bug.
    for (let index = 0; index < rawContent[0]; index++) {
        availableNumbers.push(index + 1);
    }
    let totalRank = 0;
    for (let idx = 0; idx < sequence.length; idx++) {
        let foundIdx = availableNumbers.findIndex(element => element === sequence[idx]);
        totalRank += calculateFactorial(sequence.length - 1 - idx) * foundIdx;
        availableNumbers.splice(foundIdx, 1);
    }
    return totalRank;
}

function calculateArrayTotal(inputArray) {
    let currentTotal = 0;
    for (let counter = 0, arrayLength = inputArray.length; counter < arrayLength; ++counter) {
        currentTotal += inputArray[counter] - 0; // Ensure numeric conversion
    }
    return currentTotal;
}

function logTrace(debugValue) {
    if (traceEnabled === true) {
        console.log(debugValue);
    }
}

function findMaxElementIndex(dataSet) {
    let maximumValue = Number.MIN_SAFE_INTEGER;
    let maximumIndex = -1;
    for (let elementIndex = 0; elementIndex < dataSet.length; elementIndex++) {
        if (maximumValue < dataSet[elementIndex]) {
            maximumValue = dataSet[elementIndex];
            maximumIndex = elementIndex;
        }
    }
    return maximumIndex;
}

function findMinElementIndex(dataSet) {
    let minimumValue = Number.MAX_SAFE_INTEGER;
    let minimumIndex = -1;
    for (let elementIndex = 0; elementIndex < dataSet.length; elementIndex++) {
        if (minimumValue > dataSet[elementIndex]) {
            minimumValue = dataSet[elementIndex];
            minimumIndex = elementIndex;
        }
    }
    return minimumIndex;
}

function checkPrime(testNumber) {
    if (false === Number.isInteger(testNumber)) {
        return false;
    }
    if (testNumber <= 1) {
        return false;
    }
    if (2 === testNumber) {
        return true;
    }
    if (0 === testNumber % 2) {
        return false;
    }
    let currentSqrt = Math.floor(Math.sqrt(testNumber));
    for (let divisor = 3; divisor <= currentSqrt; divisor += 2) {
        if (0 === testNumber % divisor) {
            return false;
        }
    }
    return true;
}

function isNumericValue(testValue) {
    const numericPattern = /^([1-9]\d*|0)$/;
    return numericPattern.test(testValue);
}

function calculateFactorial(inputNum) {
    if (inputNum === 0) {
        return 1;
    }
    return inputNum * calculateFactorial(inputNum - 1);
}

function transform1dTo2d(dataCollection) {
    for (let idx = 0; idx < dataCollection.length; idx++) {
        dataCollection[idx] = dataCollection[idx].split(" ").map(Number);
    }
    return dataCollection;
}

function rotateMatrix(inputMatrix) {
    const MATRIX_ROWS = inputMatrix.length;
    const MATRIX_COLS = inputMatrix[0].length;
    const lastRowIndex = MATRIX_ROWS - 1;
    let rotatedGrid = new Array(MATRIX_COLS);
    for (let colIndex = 0; colIndex < MATRIX_COLS; colIndex++) {
        rotatedGrid[colIndex] = new Array(MATRIX_ROWS);
        for (let rowIndex = 0; rowIndex < MATRIX_ROWS; rowIndex++) {
            rotatedGrid[colIndex][rowIndex] = inputMatrix[lastRowIndex - rowIndex][colIndex];
        }
    }
    return rotatedGrid;
}

function insertPartialArray(targetArray, sourceSegment, startIndex) {
    for (let targetIndex = startIndex, sourceIndex = 0; sourceIndex < sourceSegment.length; targetIndex++, sourceIndex++) {
        targetArray[targetIndex] = sourceSegment[sourceIndex];
    }
    return targetArray;
}

function reverseSegment(mainArray, startPos, endPos) {
    let segmentToReverse = mainArray.slice(startPos - 1, endPos);
    segmentToReverse.reverse();
    mainArray = insertPartialArray(mainArray, segmentToReverse, startPos - 1);
    return mainArray;
}

function padWithZeros(inputNumber, desiredLength) {
    return (inputNumber + '000000000000000000000000000000000').slice(0, desiredLength);
}

function calculateCollectionTotal(valueCollection) {
    let totalSum = 0;
    for (let counter = 0, collectionSize = valueCollection.length; counter < collectionSize; ++counter) {
        totalSum += valueCollection[counter] - 0; // Explicitly convert to number
    }
    return totalSum;
}

function primeFactorize(inputNumber) {
    let factorCounts = {};

    if (inputNumber === 1) {
        return {
            "1": 1
        };
    }

    let currentDivisor = 2;

    while (inputNumber !== 1) {
        let potentialFactor = currentDivisor;
        while (potentialFactor < maxIntVal) {
            if (inputNumber % potentialFactor === 0) {
                inputNumber /= potentialFactor;
                if (!(factorCounts[potentialFactor] > 0)) {
                    factorCounts[potentialFactor] = 0;
                }
                factorCounts[potentialFactor]++;
                break;
            }
            potentialFactor++;
        }
        currentDivisor = potentialFactor;
    }
    return factorCounts;
}

function findGCD(valA, valB) {
    if (valB === 0) {
        return valA;
    }
    return findGCD(valB, valA % valB);
}

function findLCM(firstNum, secondNum) {
    let commonDivisor = (x, y) => y ? commonDivisor(y, x % y) : x; // Renaming internal function 'g'
    return (firstNum * secondNum) / commonDivisor(firstNum, secondNum);
}

function subtractValues(operandA, operandB) {
    return operandA - operandB;
}

function binarySearchLargestLessEqual(sortedData, targetValue) {
    let resultIndex = -1;

    // Index representing the left boundary for searching
    let leftBoundary = 0;

    // Index representing the right boundary for searching
    let rightBoundary = sortedData.length - 1;

    // Continue the search loop as long as there are elements between the boundaries
    while (leftBoundary <= rightBoundary) {

        // Calculate the middle index for the current search range
        let midPoint = Math.floor((leftBoundary + rightBoundary) / 2);

        // Compare the value at the midpoint with the target search value
        if (sortedData[midPoint] === targetValue) {
            // If a match is found, store the index and terminate the search
            resultIndex = midPoint;
            break;
        } else if (sortedData[midPoint] < targetValue) {
            // If the midpoint value is smaller, shift the left boundary to the right of the midpoint
            leftBoundary = midPoint + 1;
        } else {
            // If the midpoint value is larger, shift the right boundary to the left of the midpoint
            rightBoundary = midPoint - 1;
        }
    }
    if (resultIndex !== -1) return resultIndex;
    else return leftBoundary;
}

function splitByNewline(textInput) {
    return textInput.split("\n");
}

function checkIfSorted(inputArray) {
    let sortedStatus = true;
    for (let currentIndex = 1; currentIndex < inputArray.length; currentIndex++) {
        if (inputArray[currentIndex - 1] > inputArray[currentIndex]) {
            sortedStatus = false;
            break;
        }
    }
    return sortedStatus;
}

function decomposeIntoPrimes(targetNumber) {

    // Store the square root of the target number
    let squareRootVal = Math.floor(Math.sqrt(targetNumber));

    let exponentCount = 0;

    let primeFactorsMap = {};

    // Find prime factors starting from 2 up to the square root
    for (let currentFactor = 2; currentFactor <= squareRootVal; currentFactor++) {

        if ((targetNumber % currentFactor) === 0) {

            exponentCount = 0; // Reset exponent counter for the new prime factor

            do {
                exponentCount++; // Increment exponent count
                targetNumber = targetNumber / currentFactor; // Divide number by its factor
            } while ((targetNumber % currentFactor) === 0);

            // Store the prime factor and its exponent
            primeFactorsMap[currentFactor] = exponentCount;
        }
    }

    // Add any remaining prime number (if n > 1 after division)
    if (targetNumber > 1) {
        primeFactorsMap[targetNumber] = 1;
    }

    return primeFactorsMap;
}