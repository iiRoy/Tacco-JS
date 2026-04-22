"use strict";

// A utility class for parsing input text line by line and token by token.
// It allows for a custom transformation function for each token.
function LineByLineParser(sourceTextContent, valueConverterFunction) {
    // Stores the input text split into individual lines.
    this.sourceLinesArray = sourceTextContent.split("\n");
    // Current index within the tokens of the current line.
    this.currentSegmentIndex = 0;
    // Current line number being processed.
    this.currentLinePointer = 0;
    // Function to apply to each read token (e.g., parseInt, parseFloat).
    this.valueConverter = valueConverterFunction || parseInt; // Default to parseInt
    // Cache for tokens of the current line to avoid re-splitting.
    this.cachedLineTokens = [];
}

// Fetches the next available token from the input stream.
LineByLineParser.prototype.fetchToken = function() {
    // If the current line's tokens are exhausted or not yet split, prepare the next line.
    if (this.currentSegmentIndex >= this.cachedLineTokens.length) {
        // Advance line pointer until a non-empty line is found or end of input.
        while (this.currentLinePointer < this.sourceLinesArray.length &&
               (!this.sourceLinesArray[this.currentLinePointer] || this.sourceLinesArray[this.currentLinePointer].trim() === '')) {
            this.currentLinePointer++;
        }

        // If no more lines, return null to indicate end of input.
        if (this.currentLinePointer >= this.sourceLinesArray.length) {
            return null;
        }

        // Split the current line into tokens using one or more spaces as a delimiter.
        this.cachedLineTokens = this.sourceLinesArray[this.currentLinePointer].trim().split(/\s+/);
        this.currentSegmentIndex = 0; // Reset token index for the new line.
        this.currentLinePointer++;    // Move to the next line for future reads.
    }

    // Retrieve the token and advance the segment index.
    const tokenString = this.cachedLineTokens[this.currentSegmentIndex];
    this.currentSegmentIndex++;

    // Apply the configured value converter and return the result.
    return this.valueConverter(tokenString);
};

// Reads all tokens from the current line and returns them as an array.
// This method advances the line pointer after reading.
LineByLineParser.prototype.processLine = function() {
    // Advance line pointer until a non-empty line is found or end of input.
    while (this.currentLinePointer < this.sourceLinesArray.length &&
           (!this.sourceLinesArray[this.currentLinePointer] || this.sourceLinesArray[this.currentLinePointer].trim() === '')) {
        this.currentLinePointer++;
    }

    // If no more lines, return an empty array.
    if (this.currentLinePointer >= this.sourceLinesArray.length) {
        return [];
    }

    // Get the current line, split it, convert tokens, and then advance line pointer.
    const rawLine = this.sourceLinesArray[this.currentLinePointer];
    this.currentLinePointer++;
    this.currentSegmentIndex = 0; // Reset segment index as we've consumed the line.

    return rawLine.trim().split(/\s+/).map(this.valueConverter);
};

/**
 * Generates a list of prime numbers up to a specified upper bound using the Sieve of Eratosthenes algorithm.
 * @param {number} upperBound - The maximum number to check for primality.
 * @returns {number[]} An array containing all prime numbers less than or equal to 'upperBound'.
 */
function findPrimesSieve(upperBound) {
    if (upperBound < 2) {
        return []; // No primes below 2
    }
    // Initialize a boolean array 'isPrimeCandidate' where isPrimeCandidate[i] is true if i is potentially prime.
    const isPrimeCandidate = new Array(upperBound + 1).fill(true);
    isPrimeCandidate[0] = false; // 0 is not prime
    isPrimeCandidate[1] = false; // 1 is not prime

    const resultantPrimes = []; // To store the found prime numbers.

    // Iterate from 2 up to the upper bound.
    for (let currentNum = 2; currentNum <= upperBound; ++currentNum) {
        // If currentNum is marked as prime, add it to our list and mark its multiples as not prime.
        if (isPrimeCandidate[currentNum]) {
            resultantPrimes.push(currentNum);

            // Start marking multiples from currentNum * currentNum, as smaller multiples would have been marked already.
            let multipleEliminator = currentNum * currentNum;
            while (multipleEliminator <= upperBound) {
                isPrimeCandidate[multipleEliminator] = false;
                multipleEliminator += currentNum; // Move to the next multiple.
            }
        }
    }
    return resultantPrimes;
}

// Precompute prime numbers up to 100,000 for later use.
const precomputedPrimes = findPrimesSieve(100000);

/**
 * Calculates the Greatest Common Divisor (GCD) of two non-negative integers using the Euclidean algorithm (iterative).
 * @param {number} firstValue - The first integer.
 * @param {number} secondValue - The second integer.
 * @returns {number} The greatest common divisor of firstValue and secondValue.
 */
function greatestCommonDivisor(firstValue, secondValue) {
    // Ensure inputs are non-negative. For this problem, they should be.
    firstValue = Math.abs(firstValue);
    secondValue = Math.abs(secondValue);

    while (secondValue !== 0) {
        const temporaryRemainder = firstValue % secondValue;
        firstValue = secondValue;
        secondValue = temporaryRemainder;
    }
    return firstValue;
}

/**
 * Helper function to check the complex divisibility condition for a given prime.
 * @param {number[]} dataSequence - The array of numbers.
 * @param {number} primeCandidate - The prime number to check against.
 * @param {number} maxIndex - The maximum index in the dataSequence to consider (equivalent to original 'n').
 * @returns {boolean} True if the condition holds for the prime, false otherwise.
 */
function checkPrimeCondition(dataSequence, primeCandidate, maxIndex) {
    // Condition 1: The first element of the sequence must be divisible by the prime.
    if (dataSequence[0] % primeCandidate !== 0) {
        return false;
    }

    // Condition 2: For each 'offset' from 1 to primeCandidate-1,
    // the sum of elements at indices (offset, offset + (primeCandidate-1), offset + 2*(primeCandidate-1), ...)
    // must be divisible by the prime.
    for (let offset = 1; offset < primeCandidate; ++offset) {
        let currentSumOfSegment = 0;
        let currentIndex = offset;
        while (currentIndex <= maxIndex) {
            currentSumOfSegment += dataSequence[currentIndex];
            currentIndex += primeCandidate - 1; // Advance by (prime-1)
        }
        if (currentSumOfSegment % primeCandidate !== 0) {
            return false;
        }
    }
    return true; // All conditions met for this prime.
}


/**
 * Main function to solve the problem by processing input and calculating results.
 * @param {string} rawDataInput - The raw input string from stdin.
 */
function solveProblem(rawDataInput) {
    // Initialize the parser to read numbers.
    const dataStreamReader = new LineByLineParser(rawDataInput, parseInt);

    // Read the count 'N' (which represents the highest index of the following array).
    const dataCount = dataStreamReader.fetchToken();
    if (dataCount === null || isNaN(dataCount) || dataCount < 0) {
        console.error("Error: Invalid or missing data count N.");
        return;
    }

    // Read N+1 numbers into an array.
    let inputValues = [];
    for (let iter = 0; iter <= dataCount; ++iter) {
        const val = dataStreamReader.fetchToken();
        if (val === null || isNaN(val)) {
            console.error(`Error: Invalid or missing number at index ${iter}.`);
            return;
        }
        inputValues.push(val);
    }

    // The problem logic requires the array to be reversed.
    inputValues.reverse();

    // Calculate the Greatest Common Divisor (GCD) of all elements in the inputValues array.
    // If the array is empty after reversal (shouldn't happen with N >= 0), handle it.
    if (inputValues.length === 0) {
        // This case should ideally be caught by dataCount validation above.
        // If dataCount was -1, this could happen.
        return;
    }

    // Use reduce to find the GCD of all elements.
    let overallCommonDivisor = inputValues.reduce((accumulator, currentValue) =>
        greatestCommonDivisor(accumulator, currentValue)
    );

    // If the overall GCD is 0 (e.g., all input values were 0), special handling.
    if (overallCommonDivisor === 0) {
        // If all numbers are 0, their GCD is 0. The problem context usually implies positive integers.
        // For competitive programming, if all zeros, output 0 or specific error.
        // Assuming non-zero positive integers for problem constraints.
        // If the problem implies GCD of (0,0) is 0, this might be okay.
        // Otherwise, it indicates an issue or a trivial case.
        if (inputValues.every(val => val === 0)) {
            console.log(0); // Or handle as per problem spec for all zeros.
            return;
        }
        // If some are non-zero but overallCommonDivisor became zero, it's an error.
        console.error("Error: GCD calculation resulted in zero unexpectedly.");
        return;
    }


    // Divide each element in the array by the overall GCD.
    // This simplifies the numbers while preserving their relative divisibility properties.
    const simplifiedValues = inputValues.map(item => item / overallCommonDivisor);

    // Array to store the prime factors found through the problem's criteria.
    const finalPrimeFactors = [];

    // First phase: Check precomputed primes against the simplified values.
    // Iterate through each precomputed prime number.
    for (const currentPrimeCandidate of precomputedPrimes) {
        // Use the helper function to encapsulate the complex divisibility logic.
        if (checkPrimeCondition(simplifiedValues, currentPrimeCandidate, dataCount)) {
            finalPrimeFactors.push(currentPrimeCandidate);
        }
    }

    // Second phase: Factorize the original overallCommonDivisor (before simplification).
    // This ensures all prime factors of the original GCD are included.
    let remainingGCD = overallCommonDivisor;
    let primeIndex = 0;

    // Iterate through precomputed primes to factorize remainingGCD.
    while (remainingGCD > 1 && primeIndex < precomputedPrimes.length) {
        const currentPrime = precomputedPrimes[primeIndex];
        if (remainingGCD % currentPrime === 0) {
            finalPrimeFactors.push(currentPrime);
            // Remove all occurrences of this prime factor from remainingGCD.
            while (remainingGCD % currentPrime === 0) {
                remainingGCD /= currentPrime;
            }
        }
        primeIndex++;
    }

    // If, after dividing by all precomputed primes, remainingGCD is still greater than 1,
    // it means remainingGCD is a prime factor larger than our precomputed limit.
    if (remainingGCD > 1) {
        finalPrimeFactors.push(remainingGCD);
    }

    // Sort the collected prime factors in ascending order.
    finalPrimeFactors.sort((a, b) => a - b);

    // Print unique prime factors. Using a Set is an efficient way to handle uniqueness.
    const uniquePrimeResults = new Set(finalPrimeFactors);
    uniquePrimeResults.forEach(factor => {
        console.log(factor);
    });
}

// Read input from stdin and execute the main logic.
try {
    solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
} catch (error) {
    console.error("An error occurred during input processing or execution:", error.message);
}