const inputProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let dataNavigator = null;
const capturedInputLines = [];

inputProcessor.on('line', (incomingLine) => {
    capturedInputLines.push(incomingLine);
});

inputProcessor.on('close', () => {
    dataNavigator = setupInputNavigation(capturedInputLines);
    printDiagnosticMessage("--- Program Execution Started ---");
    const startTime = new Date();
    executeMainAlgorithm();
    const endTime = new Date();
    const elapsedTime = endTime - startTime;
    printDiagnosticMessage("--- Program Execution Finished ---");
    printDiagnosticMessage(`Time taken: ${elapsedTime} ms`);
    const currentMemoryUsage = process.memoryUsage().heapTotal;
    printDiagnosticMessage(`Memory consumed: ${Math.round(currentMemoryUsage / 1024)} KB`);
});

// Helper functions for convenient data retrieval from the navigated input stream.
const getNextInteger = () => convertInputItem(fetchNextDataUnit(), 1);
const getStringArray = () => convertInputItem(fetchNextDataUnit(), 2);
const getIntegerArray = () => convertInputItem(fetchNextDataUnit(), 4);
const getCharacterArray = () => convertInputItem(fetchNextDataUnit(), 6);

const fetchNextDataUnit = () => dataNavigator.retrieveNextEntry();
const hasMoreInputEntries = () => dataNavigator.hasMoreEntries();

/**
 * Initializes an input navigation object to sequentially access input lines.
 * @param {string[]} inputSource - An array of strings representing input lines.
 * @returns {object} An object with methods to check for and retrieve input entries.
 */
function setupInputNavigation(inputSource) {
    if (!Array.isArray(inputSource)) {
        console.error("Error: Input source must be an array of strings.");
        return {
            hasMoreEntries: () => false,
            retrieveNextEntry: () => { throw new Error("Input source is invalid."); }
        };
    }

    const navigationContext = {
        sourceCollection: inputSource,
        currentPointer: 0,
        maxEntries: inputSource.length,

        /**
         * Checks if there are more entries available in the input source.
         * @returns {boolean} True if more entries exist, false otherwise.
         */
        hasMoreEntries: function() {
            return this.currentPointer < this.maxEntries;
        },

        /**
         * Retrieves the next entry from the input source.
         * @returns {string} The next input line.
         * @throws {Error} If no more entries are available.
         */
        retrieveNextEntry: function() {
            if (!this.hasMoreEntries()) {
                throw new Error("Input Boundary Exceeded: No further input elements are available.");
            }
            const nextEntry = this.sourceCollection[this.currentPointer];
            this.currentPointer++;
            return nextEntry;
        }
    };
    return navigationContext;
}

/**
 * Outputs a message to the standard console.
 * @param {any} message - The content to be displayed.
 */
function displayOutput(message) {
    console.log(message);
}

/**
 * Prints a debug or diagnostic message to the standard error stream.
 * Includes detailed inspection for complex objects.
 * @param {any} debugInfo - The information to log for debugging.
 */
function printDiagnosticMessage(debugInfo) {
    const utility = require("util");
    console.error(`[DIAG]: ${utility.inspect(debugInfo, { showHidden: false, depth: 3, colors: true })}`);
}

/**
 * Transforms an input item based on a specified conversion operation code.
 * @param {any} itemToConvert - The data item to be transformed.
 * @param {number} conversionCode - An integer code specifying the conversion type.
 *   1: Parse as a base-10 integer.
 *   2: Split string by space into an array of strings.
 *   4: Split string by space into an array of numbers.
 *   6: Split string by character into an array of characters.
 *   7: Split string by character into an array of numbers.
 *   8: Join array elements with a single space.
 *   9: Join array elements with a newline.
 *   0: Join array elements without any separator.
 * @returns {any} The result of the conversion, or the original item if conversion fails or is unknown.
 */
function convertInputItem(itemToConvert, conversionCode) {
    try {
        if (itemToConvert === null || itemToConvert === undefined) {
            printDiagnosticMessage(`Warning: Attempted conversion on null/undefined item with code ${conversionCode}.`);
            return itemToConvert;
        }
        switch (conversionCode) {
            case 1:
                return Number.parseInt(itemToConvert, 10);
            case 2:
                return String(itemToConvert).split(" ");
            case 4:
                return String(itemToConvert).split(" ").map(Number);
            case 6:
                return String(itemToConvert).split("");
            case 7:
                return String(itemToConvert).split("").map(Number);
            case 8:
                return Array.isArray(itemToConvert) ? itemToConvert.join(" ") : String(itemToConvert);
            case 9:
                return Array.isArray(itemToConvert) ? itemToConvert.join("\n") : String(itemToConvert);
            case 0:
                return Array.isArray(itemToConvert) ? itemToConvert.join("") : String(itemToConvert);
            default:
                printDiagnosticMessage(`Notice: Unrecognized conversion code '${conversionCode}'. Item returned as-is: ${itemToConvert}`);
                return itemToConvert;
        }
    } catch (conversionProblem) {
        printDiagnosticMessage(`Error during conversion (code ${conversionCode}) for item '${itemToConvert}': ${conversionProblem.message}`);
        return itemToConvert; // Return original on error to maintain flow.
    }
}

//------------------- End of core utilities and input/output system --------------------

/**
 * Orchestrates the primary logic of the program.
 * Reads an integer 'N', then processes its divisors and (N-1)'s divisors
 * based on specific mathematical rules to count unique outcomes.
 */
function executeMainAlgorithm() {
    const targetNumberN = getNextInteger();

    // Early exit for invalid or non-positive input to prevent errors in divisor calculations.
    if (isNaN(targetNumberN) || targetNumberN <= 0) {
        printDiagnosticMessage(`Input error: 'N' must be a positive integer. Received: ${targetNumberN}`);
        displayOutput(0);
        return;
    }

    const collectionOfDivisorsForN = findPositiveDivisors(targetNumberN);
    const predecessorOfN = targetNumberN - 1;
    const collectionOfDivisorsForNMinusOne = findPositiveDivisors(predecessorOfN);

    const resultSet = new Set(); // Stores unique valid divisors

    // Phase 1: Include all divisors of (N-1), excluding 1, into the result set.
    // The original loop (i=1) implies skipping the first element (which is 1 after sorting).
    for (let currentIdx = 1; currentIdx < collectionOfDivisorsForNMinusOne.length; currentIdx++) {
        resultSet.add(collectionOfDivisorsForNMinusOne[currentIdx]);
    }

    // Phase 2: Iterate through divisors of N and apply a custom reduction rule.
    for (let idxN = 0; idxN < collectionOfDivisorsForN.length; idxN++) {
        const potentialDivisor = collectionOfDivisorsForN[idxN];

        // Skip 1 as a divisor for this specific rule, as it would lead to infinite loops
        // or trivial results not intended by the core logic.
        if (potentialDivisor === 1) {
            continue;
        }

        let workingValue = targetNumberN; // A temporary mutable copy of N
        const divisorForReduction = potentialDivisor;

        // Apply a specialized reduction: repeatedly divide by 'divisorForReduction' if divisible,
        // otherwise take the modulo. Continue until the working value is less than the divisor.
        while (workingValue >= divisorForReduction) {
            if (workingValue % divisorForReduction === 0) {
                workingValue /= divisorForReduction;
            } else {
                workingValue %= divisorForReduction;
            }
        }

        // If, after all reductions, the working value becomes 1, then 'potentialDivisor'
        // is considered a valid candidate for the result set.
        if (workingValue === 1) {
            resultSet.add(potentialDivisor);
        }
    }

    displayOutput(resultSet.size);
}

/**
 * Calculates and returns a sorted list of all positive divisors for a given integer.
 * @param {number} inputNumber - The integer for which to find divisors.
 * @returns {number[]} An array of divisors, sorted in ascending order. Returns an empty array for non-positive input.
 */
function findPositiveDivisors(inputNumber) {
    if (inputNumber <= 0) {
        return []; // No positive divisors for non-positive numbers.
    }
    if (inputNumber === 1) {
        return [1]; // Special case: 1 is its only divisor.
    }

    const identifiedDivisors = [];
    // Only need to check factors up to the square root of the number.
    const squareRootLimit = Math.sqrt(inputNumber);

    for (let currentFactor = 1; currentFactor <= squareRootLimit; currentFactor++) {
        if (inputNumber % currentFactor === 0) {
            identifiedDivisors.push(currentFactor);
            // If currentFactor is not the square root itself, then inputNumber / currentFactor
            // is also a distinct divisor.
            if (currentFactor * currentFactor !== inputNumber) {
                identifiedDivisors.push(inputNumber / currentFactor);
            }
        }
    }
    // Ensure the list of divisors is sorted numerically.
    identifiedDivisors.sort((valA, valB) => valA - valB);
    return identifiedDivisors;
}

/**
 * Checks if a given integer is a prime number using an optimized algorithm.
 * @param {number} numToCheck - The integer to test for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
function checkIntegerPrimality(numToCheck) {
    // Handle trivial cases and even numbers efficiently.
    if (numToCheck === null || numToCheck <= 1) {
        return false;
    }
    if (numToCheck === 2 || numToCheck === 3) {
        return true;
    }
    if (numToCheck % 2 === 0 || numToCheck % 3 === 0) {
        return false;
    }

    // Optimized loop: All primes greater than 3 can be expressed in the form 6k ± 1.
    // We only need to check divisibility by numbers of this form up to the square root.
    const checkUpperLimit = Math.floor(Math.sqrt(numToCheck));
    for (let factor = 5; factor <= checkUpperLimit; factor += 6) {
        if (numToCheck % factor === 0 || numToCheck % (factor + 2) === 0) {
            return false;
        }
    }
    return true;
}

/**
 * Decomposes a given integer into its prime factors and counts their occurrences.
 * Returns a Map where keys are prime factors and values are their corresponding exponents.
 * @param {number} numberToFactorize - The integer to be factorized.
 * @returns {Map<number, number>} A Map containing prime factors and their counts.
 */
function decomposeIntoPrimeFactors(numberToFactorize) {
    const primeFactorExponents = new Map();
    if (numberToFactorize <= 1) {
        return primeFactorExponents; // 1 and non-positive numbers have no prime factors.
    }

    let remainingNum = numberToFactorize;
    let candidateFactor = 2;

    // Helper function to update factor counts in the map.
    const recordFactorOccurrence = (factor) => {
        primeFactorExponents.set(factor, (primeFactorExponents.get(factor) || 0) + 1);
    };

    // First, handle the prime factor 2.
    while (remainingNum % 2 === 0) {
        recordFactorOccurrence(2);
        remainingNum /= 2;
    }

    // Now, handle odd prime factors starting from 3.
    candidateFactor = 3;
    while (remainingNum > 1 && candidateFactor * candidateFactor <= remainingNum) {
        if (remainingNum % candidateFactor === 0) {
            recordFactorOccurrence(candidateFactor);
            remainingNum /= candidateFactor;
            // Optimization: If the remaining number is now prime, add it and finish.
            if (checkIntegerPrimality(remainingNum)) {
                recordFactorOccurrence(remainingNum);
                remainingNum = 1;
                break;
            }
        } else {
            candidateFactor += 2; // Move to the next odd number.
        }
    }

    // If after all divisions, remainingNum is still greater than 1, it must be a prime factor itself.
    if (remainingNum > 1) {
        recordFactorOccurrence(remainingNum);
    }

    return primeFactorExponents;
}