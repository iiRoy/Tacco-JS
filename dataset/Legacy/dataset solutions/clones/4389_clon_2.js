/*
 * This file provides a collection of JavaScript utility functions.
 * It includes methods for array manipulation, number theory calculations,
 * and input string processing.
 *
 * Available functions:
 * - convert1dTo2d(Array): Transforms a one-dimensional array of strings into a two-dimensional array of characters.
 * - primeFactorizeObject(N): Computes the prime factorization of N, returning an object mapping factors to their exponents.
 * - findGreatestCommonDivisor(a, b): Determines the greatest common divisor of two integers.
 * - findLeastCommonMultiple(a, b): Computes the least common multiple of two integers.
 * - compareNumbers(a, b): A comparison function suitable for sorting numbers in ascending order (a - b).
 * - checkIfPrime(n): Verifies if a given number is a prime number.
 * - validateIsNumber(n): Checks if a string represents a valid non-negative integer.
 * - sumArrayElements(arr): Calculates the sum of all numeric values within an array.
 * - binarySearchClosest(arr, n): Performs a binary search to find the index of the largest element less than or equal to n.
 * - splitByNewline(input): Divides a string into an array of substrings based on newline characters.
 */

const dbgFlag = false; // A boolean flag to control debug logging.
const inf = Number.MAX_SAFE_INTEGER; // Represents the maximum safe integer value in JavaScript.
const primeModulus = 1000000007; // A frequently used large prime number for modulo operations.

/**
 * The primary function to process the input data and compute the final result.
 * It reads cost parameters and an amount, then applies an optimization strategy.
 * @param {string} rawData - The complete input string, typically from standard input.
 */
function ProcessInput(rawData) {
    rawData = rawData.split("\n"); // Separate the input into individual lines.
    let valueArray = rawData[0].split(" "); // Parse the first line, which contains cost values.

    // Implement a cost optimization logic: if a higher-level cost is more than
    // twice a lower-level cost, cap it to twice the lower-level cost.
    if (valueArray[0] * 2 < valueArray[1]) {
        valueArray[1] = valueArray[0] * 2;
    }
    if (valueArray[1] * 2 < valueArray[2]) {
        valueArray[2] = valueArray[1] * 2;
    }
    if (valueArray[2] * 2 < valueArray[3]) {
        valueArray[3] = valueArray[2] * 2;
    }

    // Calculate the total optimized cost and output it to the console.
    // This involves integer division and modulo for the second input line.
    console.log(Math.floor(rawData[1] / 2) * valueArray[3] + (rawData[1] % 2) * valueArray[2]);
}

// Execute the main processing function by reading input from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/**
 * Computes a sum related to the lexicographical order of a permutation.
 * Note: This function relies on a global or implicitly available 'input' variable,
 * specifically 'input[0]', which is not passed as a parameter.
 * @param {Array<number>} inputSequence - The array representing a permutation.
 * @returns {number} The calculated sum.
 */
function lexicographicalOrderSum(inputSequence) {
    let availableNumbers = [];
    // The 'input' variable here refers to the 'rawData' from ProcessInput,
    // which is a global side effect of the Main function's execution.
    for (let i = 0; i < input[0]; i++) {
        availableNumbers.push(i + 1);
    }

    let totalSum = 0;
    for (let i = 0; i < inputSequence.length; i++) {
        let foundIndex = availableNumbers.findIndex(val => val == inputSequence[i]);
        totalSum += calculateFactorial(inputSequence.length - 1 - i) * foundIndex;
        availableNumbers.splice(foundIndex, 1); // Remove the number once it's used.
    }
    return totalSum;
}

/**
 * Calculates the sum of all elements in a given array.
 * Elements are coerced to numbers before summing.
 * @param {Array<string|number>} numericArray - The array containing elements to sum.
 * @returns {number} The aggregate sum of the array's elements.
 */
function sumArrayElements(numericArray) {
    let currentSum = 0;
    for (let i = 0, arrayLength = numericArray.length; i < arrayLength; ++i) {
        currentSum += numericArray[i] - 0; // Convert string to number using subtraction.
    }
    return currentSum;
}

/**
 * Outputs a message to the console only if the debug flag is set to true.
 * @param {*} messageContent - The data or message to be logged.
 */
function logDebugMessage(messageContent) {
    if (dbgFlag === true) {
        console.log(messageContent);
    }
}

/**
 * Identifies the index of the largest element within an array.
 * @param {Array<number>} targetArray - The array to be scanned.
 * @returns {number} The zero-based index of the maximum element, or -1 if the array is empty.
 */
function findMaxElementIndex(targetArray) {
    let maxValue = Number.MIN_SAFE_INTEGER;
    let maxIndex = -1;
    for (let i = 0; i < targetArray.length; i++) {
        if (maxValue < targetArray[i]) {
            maxValue = targetArray[i];
            maxIndex = i;
        }
    }
    return maxIndex;
}

/**
 * Identifies the index of the smallest element within an array.
 * @param {Array<number>} targetArray - The array to be scanned.
 * @returns {number} The zero-based index of the minimum element, or -1 if the array is empty.
 */
function findMinElementIndex(targetArray) {
    let minValue = Number.MAX_SAFE_INTEGER;
    let minIndex = -1;
    for (let i = 0; i < targetArray.length; i++) {
        if (minValue > targetArray[i]) {
            minValue = targetArray[i];
            minIndex = i;
        }
    }
    return minIndex;
}

/**
 * Transforms a one-dimensional array of strings into a two-dimensional array of characters.
 * Each string in the input array is split into its individual characters.
 * @param {Array<string>} inputArray - The 1D array of strings.
 * @returns {Array<Array<string>>} The resulting 2D array of characters.
 */
function convert1dTo2d(inputArray) {
    for (let i = 0; i < inputArray.length; i++) {
        inputArray[i] = inputArray[i].split(""); // Convert each string element to a character array.
    }
    return inputArray;
}

/**
 * Determines if a given number is a prime number.
 * @param {number} testNumber - The integer to check for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
function checkIfPrime(testNumber) {
    if (false === Number.isInteger(testNumber)) {
        return false; // Non-integers cannot be prime.
    }
    if (testNumber <= 1) {
        return false; // Numbers less than or equal to 1 are not prime.
    }
    if (2 === testNumber) {
        return true; // 2 is the smallest and only even prime.
    }
    if (0 === testNumber % 2) {
        return false; // Even numbers greater than 2 are not prime.
    }
    let sqrtValue = Math.floor(Math.sqrt(testNumber)); // Optimize by checking divisors up to the square root.
    for (let i = 3; i <= sqrtValue; i += 2) {
        if (0 === testNumber % i) {
            return false; // Found an odd divisor, so not prime.
        }
    }
    return true; // No divisors found, it is prime.
}

/**
 * Validates if a string represents a non-negative integer (0 or positive).
 * @param {string} checkValue - The string value to be validated.
 * @returns {boolean} True if the string matches the pattern for a non-negative integer, false otherwise.
 */
function validateIsNumber(checkValue) {
    const numberPattern = /^([1-9]\d*|0)$/; // Regular expression for non-negative integers.
    return numberPattern.test(checkValue);
}

/**
 * Computes the factorial of a non-negative integer using recursion.
 * @param {number} inputNum - The number for which to calculate the factorial.
 * @returns {number} The factorial of inputNum.
 */
function calculateFactorial(inputNum) {
    if (inputNum === 0) {
        return 1; // Base case: 0! is 1.
    }
    return inputNum * calculateFactorial(inputNum - 1); // Recursive step.
}

/**
 * Rotates a 2D matrix 90 degrees clockwise.
 * @param {Array<Array<any>>} originalMatrix - The matrix to be rotated.
 * @returns {Array<Array<any>>} A new matrix representing the clockwise rotation.
 */
function rotateMatrix(originalMatrix) {
    const matrixRows = originalMatrix.length;
    const matrixCols = originalMatrix[0].length;
    const lastRowIndex = matrixRows - 1;

    let rotatedMatrix = new Array(matrixCols); // The new matrix will have dimensions swapped.
    for (let c = 0; c < matrixCols; c++) {
        rotatedMatrix[c] = new Array(matrixRows);
        for (let r = 0; r < matrixRows; r++) {
            rotatedMatrix[c][r] = originalMatrix[lastRowIndex - r][c]; // Apply rotation logic.
        }
    }
    return rotatedMatrix;
}

/**
 * Inserts elements from a source array into a base array starting at a specified index.
 * This function modifies the base array directly.
 * @param {Array<any>} baseArray - The array into which elements will be inserted.
 * @param {Array<any>} elementsToInsert - The elements to be inserted.
 * @param {number} startIndex - The zero-based index in the base array where insertion begins.
 * @returns {Array<any>} The modified base array.
 */
function insertPartialArray(baseArray, elementsToInsert, startIndex) {
    for (let i = startIndex, pushIndex = 0; pushIndex < elementsToInsert.length; i++, pushIndex++) {
        baseArray[i] = elementsToInsert[pushIndex];
    }
    return baseArray;
}

/**
 * Reverses a specific segment of an array between two 1-based indices.
 * @param {Array<any>} dataArray - The array to modify.
 * @param {number} startPos - The 1-based starting index of the segment to reverse.
 * @param {number} endPos - The 1-based ending index of the segment to reverse.
 * @returns {Array<any>} The array with the specified segment reversed.
 */
function reversePartialArray(dataArray, startPos, endPos) {
    // Extract the segment, reverse it, and then re-insert it into the original array.
    let reversedSegment = dataArray.slice(startPos - 1, endPos);
    reversedSegment.reverse();
    dataArray = insertPartialArray(dataArray, reversedSegment, startPos - 1);
    return dataArray;
}

/**
 * Pads a number with leading zeros to achieve a desired total length.
 * The original implementation uses a very long string of zeros for padding.
 * @param {number|string} inputNumber - The number or string to be padded.
 * @param {number} desiredLength - The target length of the output string.
 * @returns {string} The zero-padded string representation of the number.
 */
function padWithZeros(inputNumber, desiredLength) {
    return (inputNumber + '000000000000000000000000000000000').slice(0, desiredLength);
}

/**
 * Performs prime factorization on a given number and returns the factors
 * and their corresponding exponents in an object.
 * @param {number} targetNum - The number to factorize.
 * @returns {Object<string, number>} An object where keys are prime factors and values are their counts.
 */
function primeFactorizeObject(targetNum) {
    let factorCounts = {};

    if (targetNum === 1) {
        return { "1": 1 }; // Special case: 1 has itself as a factor with exponent 1.
    }

    let currentDivisor = 2; // Start checking for factors from 2.

    while (targetNum !== 1) {
        let divisorCandidate = currentDivisor;
        // Iterate to find the next prime factor of the remaining targetNum.
        while (divisorCandidate < Number.MAX_SAFE_INTEGER) {
            if (targetNum % divisorCandidate === 0) {
                targetNum /= divisorCandidate; // Divide targetNum by the found factor.
                if (!(factorCounts[divisorCandidate] > 0)) {
                    factorCounts[divisorCandidate] = 0; // Initialize count for a new factor.
                }
                factorCounts[divisorCandidate]++; // Increment the exponent for this factor.
                break; // Found a factor, break to re-evaluate targetNum with the updated value.
            }
            divisorCandidate++; // Move to the next potential divisor.
        }
        currentDivisor = divisorCandidate; // Update the starting point for the next search iteration.
    }
    return factorCounts;
}

/**
 * Calculates the greatest common divisor (GCD) of two non-negative integers
 * using the Euclidean algorithm.
 * @param {number} numA - The first integer.
 * @param {number} numB - The second integer.
 * @returns {number} The GCD of numA and numB.
 */
function findGreatestCommonDivisor(numA, numB) {
    if (numB === 0) {
        return numA; // Base case: GCD(a, 0) = a.
    }
    return findGreatestCommonDivisor(numB, numA % numB); // Recursive step.
}

/**
 * Calculates the least common multiple (LCM) of two non-negative integers.
 * It uses the relationship: LCM(a, b) = |a * b| / GCD(a, b).
 * @param {number} numA - The first integer.
 * @param {number} numB - The second integer.
 * @returns {number} The LCM of numA and numB.
 */
function findLeastCommonMultiple(numA, numB) {
    // A local helper function for GCD, mirroring the original structure.
    const gcdFunction = (n, m) => m ? gcdFunction(m, n % m) : n;
    return numA * numB / gcdFunction(numA, numB);
}

/**
 * A simple comparison function for sorting numbers in ascending order.
 * It returns the difference between the first and second value.
 * @param {number} valA - The first value for comparison.
 * @param {number} valB - The second value for comparison.
 * @returns {number} A negative value if valA < valB, zero if valA == valB, and a positive value if valA > valB.
 */
function compareNumbers(valA, valB) {
    return valA - valB;
}

/**
 * Performs a binary search on a sorted array to find the index of the largest element
 * that is less than or equal to the target value. If the exact value is not found,
 * it returns the insertion point (index where the value would be inserted to maintain order).
 * @param {Array<number>} sortedArray - The array to search, which must be sorted in ascending order.
 * @param {number} targetValue - The value to search for.
 * @returns {number} The index of the found element, or the appropriate insertion point.
 */
function binarySearchClosest(sortedArray, targetValue) {
    let resultIndex = -1; // Initialize the result index.

    let leftBound = 0; // The left boundary of the search range.
    let rightBound = sortedArray.length - 1; // The right boundary of the search range.

    // Continue the search as long as the left boundary does not exceed the right boundary.
    while (leftBound <= rightBound) {
        let midPoint = Math.floor((leftBound + rightBound) / 2); // Calculate the middle index.

        if (sortedArray[midPoint] === targetValue) {
            resultIndex = midPoint; // Exact match found.
            break;
        } else if (sortedArray[midPoint] < targetValue) {
            leftBound = midPoint + 1; // Target value is in the right half.
        } else {
            rightBound = midPoint - 1; // Target value is in the left half.
        }
    }
    // If an exact match was found, return its index. Otherwise, return 'leftBound',
    // which represents the index where the targetValue would be inserted.
    if (resultIndex !== -1) {
        return resultIndex;
    } else {
        return leftBound;
    }
}

/**
 * Splits a given string into an array of substrings, using the newline character
 * as the delimiter.
 * @param {string} rawInputString - The string to be split.
 * @returns {Array<string>} An array where each element is a line from the input string.
 */
function splitByNewline(rawInputString) {
    return rawInputString.split("\n");
}

/**
 * Checks if an array of numbers is sorted in strictly ascending order.
 * @param {Array<number>} checkArray - The array to verify.
 * @returns {boolean} True if the array is sorted ascending, false otherwise.
 */
function isSortedAscending(checkArray) {
    let isSortedFlag = true;
    for (let i = 1; i < checkArray.length; i++) {
        if (checkArray[i - 1] > checkArray[i]) {
            isSortedFlag = false; // Found an element out of order.
            break;
        }
    }
    return isSortedFlag;
}

/**
 * Performs prime factorization of a number, returning an object with factors and their exponents.
 * This is an alternative implementation to `primeFactorizeObject`.
 * @param {number} numberToFactor - The number to be factorized.
 * @returns {Object<string, number>} An object where keys are prime factors and values are their counts.
 */
function getPrimeFactors(numberToFactor) {
    let sqrtOfN = Math.floor(Math.sqrt(numberToFactor)); // Calculate square root for optimization.
    let exponentCount = 0; // Counter for the exponent of a prime factor.
    let factorMap = {}; // Object to store the prime factors and their exponents.

    // Iterate from 2 up to the square root of the number.
    for (let currentFactor = 2; currentFactor <= sqrtOfN; currentFactor++) {
        if ((numberToFactor % currentFactor) === 0) {
            exponentCount = 0; // Reset exponent count for the new factor.
            do {
                exponentCount++; // Increment the exponent.
                numberToFactor = numberToFactor / currentFactor; // Divide the number by the factor.
            } while ((numberToFactor % currentFactor) === 0); // Continue as long as it's divisible.
            factorMap[currentFactor] = exponentCount; // Store the factor and its exponent.
        }
    }

    // If, after the loop, the remaining numberToFactor is greater than 1,
    // it means the remaining number is a prime factor itself.
    if (numberToFactor > sqrtOfN) {
        factorMap[numberToFactor] = 1;
    }

    return factorMap;
}
