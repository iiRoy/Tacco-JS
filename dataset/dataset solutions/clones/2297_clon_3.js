"use strict"

// A custom utility to manage input stream, providing iteration capabilities.
const acquireInputHandle = () => {
    // Attempt to read input from the standard input stream.
    const rawData = require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" });
    const lineSegments = rawData.trim().split("\n");

    // Construct a stateful reader object.
    const streamReader = {
        _sourceLines: lineSegments, // Renamed 'list'
        _currentPosition: 0,        // Renamed 'index'
        _totalLines: lineSegments.length, // Renamed 'max'

        // Checks if there are more lines to read.
        hasMoreData: function() {
            // Added a guard for potential negative position, though unlikely with current usage.
            if (this._currentPosition < 0) {
                return false;
            }
            return this._currentPosition < this._totalLines;
        },

        // Retrieves the next line from the input.
        retrieveNextLine: function() {
            // Enhanced error message and type.
            if (!this.hasMoreData()) {
                throw new Error("EndOfStreamException: No more input lines available.");
            }
            // Using postfix increment is idiomatic but could be rewritten as pre-increment
            // and separate assignment for more verbosity if desired.
            const nextLine = this._sourceLines[this._currentPosition];
            this._currentPosition += 1; // Explicit increment
            return nextLine;
        }
    };
    return streamReader;
}

// Global instance of our input handler.
const dataStream = acquireInputHandle();

// Helper functions for common input parsing operations.

// Fetches the next raw string line.
const obtainString = () => dataStream.retrieveNextLine();

// Fetches the next line and parses it as an integer.
const obtainInteger = () => {
    const line = dataStream.retrieveNextLine();
    // Using Number() for type conversion, which can be slightly different from parseInt()
    // for non-numeric strings (e.g., "123a" -> NaN vs 123).
    const parsed = Number(line);
    // Added a validation step.
    if (isNaN(parsed)) {
        throw new Error(`InvalidNumberFormatException: "${line}" cannot be parsed as an integer.`);
    }
    return parsed;
}

// Fetches the next line and splits it into an array of strings.
const obtainStringArray = () => obtainString().split(" ");

// Fetches the next line, splits it, and parses each part as an integer.
const obtainIntegerArray = () => {
    // Intermediate variable for clarity.
    const parts = dataStream.retrieveNextLine().split(" ");
    return parts.map(segment => {
        const num = Number(segment);
        if (isNaN(num)) {
            throw new Error(`InvalidNumberFormatException: "${segment}" in array cannot be parsed.`);
        }
        return num;
    });
}

// Fetches the next line and splits it into an array of characters.
const obtainCharacterArray = () => obtainString().split("");

// Checks if there's more data in the stream.
const checkStreamAvailability = () => dataStream.hasMoreData();

/**
 * Executes the primary logic of the application.
 * This function finds the smallest prime number greater than or equal to a given input `X`.
 */
const executeMainApplication = () => {
    // Read the target integer from input.
    const targetValue = obtainInteger();

    // Define the upper limit for prime number generation.
    // Changed variable name from 'max' to 'sieveLimit'.
    const sieveLimit = 1_000_000; // Using numeric separators for readability.

    // Initialize an array to mark numbers as potential primes.
    // 'primeCandidates' is a more descriptive name than 'p'.
    // Initialized with `undefined` to demonstrate a different initial state,
    // then explicitly setting `true` for all potential primes.
    const primeCandidates = new Array(sieveLimit);
    for (let k = 0; k < sieveLimit; k++) {
        primeCandidates[k] = true;
    }

    // Explicitly mark 0 and 1 as not prime.
    if (sieveLimit > 0) primeCandidates[0] = false;
    if (sieveLimit > 1) primeCandidates[1] = false;

    // Optimized handling for even numbers: mark all even numbers (except 2) as not prime.
    // Start from 4 (first even non-prime) and increment by 2.
    // Changed loop variable and condition slightly.
    for (let currentEven = 4; currentEven < sieveLimit; currentEven += 2) {
        primeCandidates[currentEven] = false;
    }

    // Sieve of Eratosthenes algorithm:
    // Iterate from 3 up to the square root of the limit (optimization).
    // Changed loop variable name and condition.
    const limitSqrt = Math.sqrt(sieveLimit);
    for (let primeFactor = 3; primeFactor <= limitSqrt; primeFactor += 2) { // Only check odd numbers
        // If 'primeFactor' is already marked as not prime, skip it.
        // Using strict inequality for comparison.
        if (primeCandidates[primeFactor] === false) {
            // Adding a small comment for clarity.
            continue;
        }

        // Mark all multiples of this primeFactor as not prime.
        // Start from primeFactor * primeFactor for efficiency (smaller multiples already handled).
        // Rewritten inner loop for clarity and different increment.
        for (let multiple = primeFactor * primeFactor; multiple < sieveLimit; multiple += primeFactor * 2) { // Only mark odd multiples
            primeCandidates[multiple] = false;
        }
    }

    // Search for the first prime number greater than or equal to the target value.
    // Changed loop variable and added a helper variable for the result.
    let foundPrime = -1; // Initialize with an invalid value.
    for (let numToCheck = targetValue; numToCheck < sieveLimit; numToCheck++) {
        if (primeCandidates[numToCheck] === true) {
            foundPrime = numToCheck;
            // Directly output the result and exit the function.
            console.log(foundPrime);
            return; // Early exit, as per original logic.
        }
    }

    // Optional: Add a case for when no prime is found within the limit,
    // though the original code implies one will always be found.
    // This is an example of adding a guard/validation.
    if (foundPrime === -1) {
        console.error(`Error: No prime found >= ${targetValue} within the limit of ${sieveLimit}.`);
    }
}

// Execute the main application logic.
executeMainApplication();