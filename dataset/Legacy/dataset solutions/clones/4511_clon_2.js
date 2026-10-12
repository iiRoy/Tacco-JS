"use strict"; // Enforce strict mode for cleaner code practices

/**
 * Factory function to create an input reader utility.
 * This utility reads all lines from standard input and provides methods
 * to access them sequentially.
 * @returns {object} An object with methods to navigate input lines.
 */
const makeInputReader = () => {
    // Read the entire standard input, decode as UTF-8, remove leading/trailing whitespace,
    // and split into an array of lines.
    const rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

    // Create an object to manage the input data and its current position.
    const readerInstance = {
        dataLines: rawData, // Array holding all input lines
        currentLineIdx: 0,  // Current index for the next line to be read
        totalLines: rawData.length, // Total number of lines available

        /**
         * Checks if there are more lines to read.
         * @returns {boolean} True if more lines exist, false otherwise.
         */
        hasMoreData: function() {
            return this.currentLineIdx < this.totalLines;
        },

        /**
         * Retrieves the next line from the input.
         * Throws an error if no more lines are available.
         * @returns {string} The next line of input.
         */
        retrieveNextLine: function() {
            if (!this.hasMoreData()) {
                // Indicate an attempt to read beyond the available data.
                throw "ArrayIndexOutOfBoundsException";
            } else {
                // Return the current line and then increment the index.
                return this.dataLines[this.currentLineIdx++];
            }
        }
    };
    return readerInstance; // Return the configured reader object.
};

// Initialize the global input handler using the factory function.
const inputHandler = makeInputReader();

// Helper functions for convenient input parsing.

/**
 * Gets the next raw line from the input.
 * @returns {string} The next line.
 */
const getNextLine = () => inputHandler.retrieveNextLine();

/**
 * Parses the next line as an integer.
 * @returns {number} The integer value of the next line.
 */
const getInteger = () => parseInt(inputHandler.retrieveNextLine());

/**
 * Splits the next line by spaces into an array of strings.
 * @returns {string[]} An array of strings from the next line.
 */
const getStringArray = () => inputHandler.retrieveNextLine().split(" ");

/**
 * Splits the next line by spaces and parses each part as an integer.
 * @returns {number[]} An array of integers from the next line.
 */
const getIntegerArray = () => inputHandler.retrieveNextLine().split(" ").map(el => parseInt(el));

/**
 * Splits the next line into an array of individual characters.
 * @returns {string[]} An array of characters from the next line.
 */
const getCharacterArray = () => inputHandler.retrieveNextLine().split("");

/**
 * Checks if there is more data available in the input stream.
 * @returns {boolean} True if more data, false otherwise.
 */
const checkMoreData = () => inputHandler.hasMoreData();

/**
 * Custom output function that logs arguments to the console.
 * @param {...any} args - Arguments to be logged.
 */
const printOutput = (...args) => console.log(...args);

/**
 * Calculates the factorial of a given non-negative integer.
 * This function is defined but not used in the main logic.
 * @param {number} x - The number for which to calculate the factorial.
 * @returns {number} The factorial of x.
 */
const calculateFactorial = (x) => {
    let resultVal = 1; // Initialize result to 1 for factorial calculation
    // Loop from 1 up to x, multiplying resultVal by each number.
    for (let counterVar = 1; counterVar <= x; counterVar++) {
        resultVal *= counterVar;
    }
    return resultVal; // Return the computed factorial.
};

/**
 * Main execution function of the program.
 * Reads two integers, performs a conditional calculation, and prints the result.
 */
const executeProgram = () => {
    // Read two integers from the input line.
    const [firstNum, secondNum] = getIntegerArray();

    // Check if the absolute difference between the two numbers is greater than 1.
    // If so, print 0 and exit.
    if (Math.abs(firstNum - secondNum) > 1) {
        console.log(0);
        return; // Terminate function execution.
    }

    // Define a modulo constant for calculations to prevent overflow.
    const moduloConstant = 1e9 + 7;
    let finalResult = 1; // Initialize the final result for modular arithmetic.

    // Calculate (n! % MOD)
    for (let loopIterator = 1; loopIterator <= firstNum; loopIterator++) {
        finalResult = (finalResult % moduloConstant) * (loopIterator % moduloConstant);
        finalResult %= moduloConstant; // Ensure result stays within modulo range
    }

    // Calculate (m! % MOD) and multiply with the previous result.
    for (let loopIterator = 1; loopIterator <= secondNum; loopIterator++) {
        finalResult = (finalResult % moduloConstant) * (loopIterator % moduloConstant);
        finalResult %= moduloConstant; // Ensure result stays within modulo range
    }

    // Apply final conditional logic based on whether n and m are equal.
    if (firstNum === secondNum) {
        // If n equals m, multiply the result by 2 and apply modulo.
        console.log((2 * finalResult) % moduloConstant);
    } else {
        // Otherwise, just print the result modulo constant.
        console.log(finalResult % moduloConstant);
    }
};

// Invoke the main program execution function.
executeProgram();
