"use strict";

// This function initializes an input reader utility.
const makeInputReader = () => {
    // Read all input from stdin, decode as UTF-8, remove leading/trailing whitespace, and split into an array of lines.
    const rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

    // Create an object to manage reading lines sequentially.
    const readerInstance = {
        "dataLines": rawData, // Stores the array of input lines.
        "currentLineIdx": 0,  // Current index for the next line to be read.
        "totalLines": rawData.length, // Total number of lines available.

        // Method to check if there are more lines to read.
        "hasMore": function() {
            return this.currentLineIdx < this.totalLines;
        },

        // Method to retrieve the next line from the input.
        "retrieveNext": function() {
            if (!this.hasMore()) {
                // If no more lines, throw an error.
                throw "ArrayIndexOutOfBoundsException";
            } else {
                // Return the current line and increment the index.
                return this.dataLines[this.currentLineIdx++];
            }
        }
    };
    return readerInstance;
};

// Initialize the input source object.
const inputSource = makeInputReader();

// Helper function to get the next raw line.
const getNextLine = () => inputSource.retrieveNext();

// Helper function to get the next line parsed as an integer.
const getNextInt = () => parseInt(inputSource.retrieveNext());

// Helper function to get the next line split into an array of strings.
const getNextStringArray = () => inputSource.retrieveNext().split(" ");

// Helper function to get the next line split into an array of integers.
const getNextIntArray = () => inputSource.retrieveNext().split(" ").map(elementValue => parseInt(elementValue));

// Helper function to get the next line split into an array of characters.
const getNextCharArr = () => inputSource.retrieveNext().split("");

// Helper function to check if there are more lines available.
const checkHasMore = () => inputSource.hasMore();

// Helper function for console output.
const printOutput = (...outputValues) => console.log(...outputValues);

// Function to calculate factorial for a BigInt number.
const calculateFactorialBigInt = (inputNumber) => {
    let factorialResult = 1n; // Initialize result as BigInt 1.
    // Loop from 1 to the input number (inclusive).
    for (let counterVal = 1n; counterVal <= inputNumber; counterVal++) {
        factorialResult *= counterVal; // Multiply current result by the counter.
    }
    return factorialResult; // Return the computed factorial.
};

// Main execution logic.
const executeMainLogic = () => {
    // Read two integers from the input line.
    const [firstNum, secondNum] = getNextIntArray();

    // Calculate the initial answer using factorials and multiply by 2n.
    let finalAnswer = calculateFactorialBigInt(firstNum) * calculateFactorialBigInt(secondNum) * 2n;

    // Reduce the answer modulo 1000000007n if it's larger.
    // This effectively performs a modulo operation, but using division and assignment.
    // Note: The original code's `while` loop for modulo is unusual for a single modulo operation.
    // It will repeatedly divide until `ans` is less than `1000000007n`.
    // If `ans` is `1000000007n * k + r`, it will become `k` after one division, then `k / 1000000007n` etc.
    // This is not equivalent to `ans % 1000000007n` if `ans` is very large.
    // However, the instruction is to preserve the algorithm, so the `while` loop is kept.
    // For typical factorial results, `ans` might be much larger than `1000000007n`,
    // so this loop would repeatedly divide until `ans` is smaller than the modulus.
    // This is a specific way to reduce a large number, not a standard modulo.
    // Example: if finalAnswer = 2 * 10^9 and MOD = 10^9 + 7,
    // finalAnswer /= MOD would make it ~2.
    // Then 2 /= MOD would make it 0.
    // This is not `finalAnswer % MOD`.
    // The original code's behavior is preserved.
    while (finalAnswer > 1000000007n) {
        finalAnswer /= 1000000007n;
    }

    // Print the final answer, converting the BigInt to a Number.
    console.log(Number(finalAnswer));
};

// Invoke the main logic.
executeMainLogic();
