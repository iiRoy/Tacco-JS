"use strict"

// Function to create an input reader utility
const makeInputReader = () => {
    // Read all content from standard input, decode as UTF-8, remove leading/trailing whitespace, and split into an array of lines.
    const rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

    // Construct an object to manage the input lines and provide utility methods.
    const readerObj = {
        "dataLines": rawData, // Stores the array of input lines.
        "currentIdx": 0,      // Keeps track of the current line index being processed.
        "totalLines": rawData.length, // Total number of lines available in the input.

        // Method to determine if there are more lines to read.
        "hasMore": function() {
            return this.currentIdx < this.totalLines;
        },

        // Method to retrieve the next line from the input.
        "fetchNext": function() {
            // If no more lines are available, throw an error to indicate out-of-bounds access.
            if (!this.hasMore()) {
                throw "ArrayIndexOutOfBoundsException";
            } else {
                // Return the current line and then increment the index for the next call.
                return this.dataLines[this.currentIdx++];
            }
        }
    };
    return readerObj; // Return the fully configured input reader object.
}

// Initialize the global input handler instance.
const inputHandler = makeInputReader();

// Utility function to get the next raw string line from input.
const getNextLine = () => inputHandler.fetchNext();

// Utility function to get the next line parsed as an integer.
const getNextInt = () => parseInt(inputHandler.fetchNext());

// Utility function to get the next line split into an array of strings by space.
const getNextStrArr = () => inputHandler.fetchNext().split(" ");

// Utility function to get the next line split into an array of integers by space.
const getNextIntArr = () => inputHandler.fetchNext().split(" ").map(elementVal => parseInt(elementVal));

// Utility function to get the next line split into an array of individual characters.
const getNextCharArr = () => inputHandler.fetchNext().split("");

// Utility function to check if there's more input available.
const checkHasMore = () => inputHandler.hasMore();

// Utility function for printing output to the console.
const printOutput = (...outputArgs) => console.log(...outputArgs);

// The main execution function of the program.
const ExecuteProgram = () => {
    // Read the integer value X from the input.
    const targetNum = getNextInt();

    // Define the upper limit for the Sieve of Eratosthenes algorithm.
    const upperBound = 1000000;

    // Create a boolean array, initially assuming all numbers up to 'upperBound' are prime.
    const isPrimeFlags = new Array(upperBound).fill(true);

    // Sieve of Eratosthenes: Mark all even numbers (starting from 4) as not prime.
    for (let idx = 4; idx < upperBound; idx = idx + 2) {
        isPrimeFlags[idx] = false;
    }

    // Explicitly mark 0 and 1 as non-prime numbers.
    isPrimeFlags[1] = false;
    isPrimeFlags[0] = false;

    // Continue the Sieve for odd numbers.
    for (let idx = 3; idx < upperBound; idx = idx + 2) {
        // If the current number 'idx' has already been marked as not prime, skip to the next iteration.
        if (isPrimeFlags[idx] == false) {
            continue;
        }
        // If 'idx' is prime, mark all its multiples as not prime.
        for (let multiplier = 2; idx * multiplier < upperBound; multiplier++) {
            isPrimeFlags[multiplier * idx] = false;
        }
    }

    // Search for the first prime number that is greater than or equal to 'targetNum'.
    for (let idx = targetNum; idx < upperBound; idx++) {
        if (isPrimeFlags[idx] == true) {
            // Once the first such prime is found, print it to the console.
            console.log(idx);
            // Terminate the function as the required prime has been found.
            return;
        }
    }
};

// Invoke the main program function to begin execution.
ExecuteProgram();
