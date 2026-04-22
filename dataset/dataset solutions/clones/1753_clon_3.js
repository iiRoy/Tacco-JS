/*
 * This module contains various utility functions for common programming tasks.
 * It also includes a primary execution logic for processing input data.
 * The functions are designed to handle array manipulations, numerical operations,
 * and basic input/output parsing.
 */

// Configuration constants for controlling behavior and numerical limits.
const verboseLoggingEnabled = false; // Controls whether debug messages are printed.
const numericalUpperBound = Number.MAX_SAFE_INTEGER; // Represents a large integer limit.
const standardModuloValue = 1000000007; // A common modulus for mathematical operations.

/**
 * Executes the primary data processing logic.
 * Reads input, parses relevant lines, performs an XOR accumulation,
 * and outputs derived values.
 * @param {string} rawInputString - The raw string input, typically from stdin.
 */
function ExecuteCoreLogic(rawInputString) {
    if (!rawInputString || typeof rawInputString !== 'string') {
        logIfVerbose("Error: Invalid or empty input string provided to ExecuteCoreLogic.", true);
        return; // Exit if input is invalid
    }

    // Split the input into individual lines.
    const inputLines = splitInputIntoLines(rawInputString.trim());

    // Ensure there are enough lines to process.
    if (inputLines.length < 2) {
        logIfVerbose("Error: Insufficient input lines for processing. Expected at least 2 lines.", true);
        return;
    }

    // Parse the second line as a sequence of numbers.
    const rawNumberSequence = inputLines[1];
    const numericDataPoints = rawNumberSequence.split(" ").map(element => {
        const parsedNum = Number(element);
        if (isNaN(parsedNum)) {
            logIfVerbose(`Warning: Non-numeric element found and skipped: '${element}'`, true);
            return null; // Handle non-numeric gracefully
        }
        return parsedNum;
    }).filter(item => item !== null); // Filter out any nulls from parsing errors.

    let xorAccumulator = 0; // Initialize accumulator for XOR sum.

    // Calculate the XOR sum of all numeric data points.
    for (const currentNumber of numericDataPoints) {
        xorAccumulator ^= currentNumber;
    }

    // For each original number, output its XOR with the accumulated sum.
    // This part of the logic remains equivalent to the original's intent.
    const outputResults = [];
    numericDataPoints.forEach(currentNumber => {
        const derivedValue = xorAccumulator ^ currentNumber;
        outputResults.push(derivedValue);
        // Using console.log directly for the main output as per original spec.
        console.log(derivedValue);
    });

    // Optionally, log the final results if verbose mode is on.
    logIfVerbose(`Processed ${numericDataPoints.length} elements. Final XOR sum: ${xorAccumulator}.`, false);
    logIfVerbose(`Individual derived values: [${outputResults.join(', ')}]`, false);
}

// Invoke the main logic with standard input.
// This line should be moved to the end of the file or handled by a runner if this were a module.
// For direct execution, it stays here.
ExecuteCoreLogic(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/**
 * Calculates the power of a base to an exponent.
 * Note: The original `pow` function was flawed (returned `a` instead of `ans`).
 * This version implements a correct iterative power calculation.
 * @param {number} baseValue - The base number.
 * @param {number} exponentValue - The exponent. Must be a non-negative integer.
 * @returns {number} The result of baseValue raised to the exponentValue.
 */
function calculatePower(baseValue, exponentValue) {
    if (exponentValue < 0) {
        throw new Error("Exponent must be a non-negative integer for this power function.");
    }
    if (exponentValue === 0) {
        return 1; // Any number to the power of 0 is 1.
    }
    if (baseValue === 0) {
        return 0; // 0 to any positive power is 0.
    }

    let calculatedProduct = 1;
    let currentExponentCount = 0;

    // Iteratively multiply the base by itself 'exponentValue' times.
    while (currentExponentCount < exponentValue) {
        calculatedProduct *= baseValue;
        currentExponentCount++;
    }
    return calculatedProduct;
}

/**
 * Computes the sum of all numeric elements in an array.
 * Non-numeric elements are treated as 0 after conversion attempt.
 * @param {Array<any>} inputCollection - The array whose elements are to be summed.
 * @returns {number} The total sum of numeric elements.
 */
function sumArrayElements(inputCollection) {
    let aggregateSum = 0;
    // Iterate through the array and accumulate sum.
    for (let i = 0; i < inputCollection.length; ++i) {
        const currentElement = inputCollection[i];
        // Attempt to convert to number; if fails, Number() returns NaN, which adds as 0.
        aggregateSum += Number(currentElement);
    }
    return aggregateSum;
}

/**
 * Logs a message to the console if verbose logging is enabled.
 * Optionally forces logging regardless of the global flag.
 * @param {any} messageData - The data to be logged.
 * @param {boolean} [forceLog=false] - If true, logs the message even if verboseLoggingEnabled is false.
 */
function logIfVerbose(messageData, forceLog = false) {
    if (verboseLoggingEnabled || forceLog) {
        const timestamp = new Date().toISOString();
        console.log(`[DEBUG - ${timestamp}]`, messageData);
    }
}

/**
 * Determines if a given number is prime.
 * Uses an optimized trial division method.
 * @param {number} candidateNumber - The integer to check for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
function checkPrimality(candidateNumber) {
    // Ensure the input is an integer.
    if (!Number.isInteger(candidateNumber)) {
        logIfVerbose(`Input ${candidateNumber} is not an integer.`, true);
        return false;
    }
    // Primes must be greater than 1.
    if (candidateNumber <= 1) {
        return false;
    }
    // 2 is the only even prime number.
    if (candidateNumber === 2) {
        return true;
    }
    // All other even numbers are not prime.
    if (candidateNumber % 2 === 0) {
        return false;
    }

    // Check for divisibility by odd numbers up to the square root of the candidate.
    const sqrtLimit = Math.floor(Math.sqrt(candidateNumber));
    for (let currentDivisor = 3; currentDivisor <= sqrtLimit; currentDivisor += 2) {
        if (candidateNumber % currentDivisor === 0) {
            return false;
        }
    }
    return true; // If no divisors found, it's prime.
}

/**
 * Checks if a given value represents a valid non-negative integer string.
 * @param {string} inputString - The string to validate.
 * @returns {boolean} True if the string consists only of digits (0 or positive integer), false otherwise.
 */
function isValidNumericString(inputString) {
    // Regular expression to match only digits, allowing '0' or positive integers.
    const digitOnlyPattern = /^(0|[1-9]\d*)$/;
    return digitOnlyPattern.test(inputString);
}

/**
 * Computes the factorial of a non-negative integer using recursion.
 * @param {number} valueForFactorial - The non-negative integer.
 * @returns {number} The factorial of the input number.
 * @throws {Error} If the input is negative.
 */
function getFactorialValue(valueForFactorial) {
    if (valueForFactorial < 0) {
        throw new Error("Factorial is not defined for negative numbers.");
    }
    // Base case: factorial of 0 is 1.
    if (valueForFactorial === 0) {
        return 1;
    }
    // Recursive step: n! = n * (n-1)!
    return valueForFactorial * getFactorialValue(valueForFactorial - 1);
}

/**
 * Converts a 1D array of space-separated number strings into a 2D array of actual numbers.
 * Each element of the input array is expected to be a string like "1 2 3".
 * This function returns a new 2D array, rather than modifying in-place.
 * @param {Array<string>} flatStringArray - An array where each element is a string of space-separated numbers.
 * @returns {Array<Array<number>>} A new 2D array of numbers.
 */
function reshapeArrayTo2D(flatStringArray) {
    const multiDimensionalArray = [];
    for (let rowString of flatStringArray) {
        const numericRow = rowString.split(" ").map(Number);
        multiDimensionalArray.push(numericRow);
    }
    return multiDimensionalArray;
}

/**
 * Computes the greatest common divisor (GCD) of two non-negative integers
 * using the Euclidean algorithm.
 * @param {number} firstOperand - The first integer.
 * @param {number} secondOperand - The second integer.
 * @returns {number} The greatest common divisor of firstOperand and secondOperand.
 */
function computeGCD(firstOperand, secondOperand) {
    // Base case: if the second number is 0, the GCD is the first number.
    if (secondOperand === 0) {
        return firstOperand;
    }
    // Recursive step: GCD(a, b) = GCD(b, a % b).
    return computeGCD(secondOperand, firstOperand % secondOperand);
}

/**
 * Computes the least common multiple (LCM) of two non-negative integers.
 * Uses the formula: LCM(a, b) = |a * b| / GCD(a, b).
 * @param {number} valueA - The first integer.
 * @param {number} valueB - The second integer.
 * @returns {number} The least common multiple of valueA and valueB.
 */
function computeLCM(valueA, valueB) {
    // Handle cases where one or both numbers are zero.
    if (valueA === 0 || valueB === 0) {
        return 0;
    }
    // Use the GCD helper to calculate LCM.
    const commonDivisor = computeGCD(valueA, valueB);
    // Ensure non-negative result for LCM.
    return Math.abs((valueA * valueB) / commonDivisor);
}

/**
 * Splits a multi-line string into an array of strings,
 * where each element represents a line.
 * @param {string} entireTextBlock - The input string containing newline characters.
 * @returns {Array<string>} An array of strings, split by newline.
 */
function splitInputIntoLines(entireTextBlock) {
    return entireTextBlock.split("\n");
}