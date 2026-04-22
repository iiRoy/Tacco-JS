"use strict" // Enforce strict parsing and error handling for better code quality.

// Function to set up an input stream handler.
const buildInputHandler = () => {
    /*
     * Reads all lines from standard input,
     * trims whitespace, and splits into an array of strings.
     */
    const sourceLines = require('fs')
                                  .readFileSync('/dev/stdin', 'utf8')
                                  .trim()
                                  .split('\n');

    // Creates an object to manage iteration over the input lines.
    const lineIterator = {
        "dataItems": sourceLines, // The array of input lines.
        "currentPosition": 0,     // Current index in the array.
        "totalCount": sourceLines.length, // Total number of lines.

        // Checks if there are more lines to read.
        "hasRemaining": function() {
            return this.currentPosition < this.totalCount;
        },

        // Retrieves the next line from the input.
        "retrieveNext": function() {
            if (!this.hasRemaining()) {
                throw "EndOfInputReachedError"; // Custom error message for out-of-bounds access.
            } else {
                return this.dataItems[this.currentPosition++]; // Return and increment position.
            }
        }
    };
    return lineIterator; // Returns the configured iterator.
};

// Initialize the global input reader instance.
const readerInstance = buildInputHandler();

// Helper functions for reading various data types from input.
const fetchNextLine     = () => readerInstance.retrieveNext(); // Gets the next raw string line.
const fetchNextInteger  = () => parseInt(readerInstance.retrieveNext(), 10); // Converts next line to integer.
const fetchStringArray  = () => readerInstance.retrieveNext().split(" "); // Splits next line into string array.
const fetchIntegerArray = () => readerInstance.retrieveNext().split(" ").map(elementItem => parseInt(elementItem, 10)); // Splits and converts to integer array.
const fetchCharacterArray = () => readerInstance.retrieveNext().split(""); // Splits next line into character array.

// Checks if there are more items available in the input stream.
const checkHasMore      = () => readerInstance.hasRemaining();

// Utility for logging output to the console.
const displayOutput     = (...outputArgs) => console.log(...outputArgs);


// Main application logic processing.
const executePrimaryLogic = () => {

    const targetValue = fetchNextInteger(); // Read the starting number X.
    const upperLimit = 1000000; // Define the maximum boundary for prime number search.

    // Initialize a boolean array for the Sieve of Eratosthenes.
    // All numbers are initially considered prime.
    const primeFlags = new Array(upperLimit).fill(true);

    // Optimize: Mark all even numbers (except 2) as not prime.
    for ( let idx = 4; idx < upperLimit; idx += 2 ) {
        primeFlags[idx] = false;
    }

    // Explicitly mark 0 and 1 as not prime.
    primeFlags[1] = false;
    primeFlags[0] = false;

    // Apply the Sieve of Eratosthenes algorithm.
    // Iterate through odd numbers starting from 3.
    for ( let counter = 3; counter < upperLimit; counter += 2 ) {
        if ( primeFlags[counter] === false ) {
            continue; // Skip if 'counter' is already marked as not prime.
        }
        // Mark all multiples of the current prime 'counter' as not prime.
        for ( let multiplier = 2; counter * multiplier < upperLimit; multiplier++ ) {
            primeFlags[counter * multiplier] = false;
        }
    }

    // Find the smallest prime number greater than or equal to 'targetValue'.
    for ( let idx = targetValue; idx < upperLimit; idx++ ) {
        if ( primeFlags[idx] === true ) {
            console.log(idx); // Output the first found prime.
            return; // Exit the function after finding and printing.
        }
    }
};

// Invoke the primary execution flow of the program.
executePrimaryLogic();