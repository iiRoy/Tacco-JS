"use strict" /* Ensure strict mode for cleaner code */

/* Function to set up an input stream handler */
const makeInputHandler = () => {
  /* Read all input from standard input, decode as UTF-8, trim whitespace, and split into lines */
  const incomingText = require("fs").readFileSync("/dev/stdin", "utf8") .trim() .split("\n");

  // Create an object to manage input lines
  const lineProcessor = {
    "lineBuffer": incomingText, /* Store all lines read from input */
    "readPointer": 0,           /* Current position in the line buffer */
    "totalLines": incomingText.length, /* Total number of lines available */

    /**
     * Checks if there are more lines to read.
     * @returns {boolean} True if more lines are available, false otherwise.
     */
    "hasMoreEntries": function() {
      return this.readPointer < this.totalLines;
    },

    /**
     * Retrieves the next line from the buffer and advances the pointer.
     * Throws an error if no more lines are available.
     * @returns {string} The next line of input.
     */
    "fetchNextEntry": function() {
      if (!this.hasMoreEntries()) {
        throw "EndOfInputException"; // Custom error for out of bounds access
      }
      return this.lineBuffer[this.readPointer++];
    }
  };
  return lineProcessor;
};

/* Initialize the global input stream object */
const dataStream = makeInputHandler();

/* Helper function to get the next raw line */
const obtainLine = () => dataStream.fetchNextEntry();

/* Helper function to get the next line parsed as an integer */
const obtainInteger = () => parseInt(dataStream.fetchNextEntry());

/* Helper function to get the next line split into a string array */
const obtainStringArray = () => dataStream.fetchNextEntry().split(" ");

/* Helper function to get the next line split into an array of integers */
const obtainIntegerArray = () => dataStream.fetchNextEntry().split(" ").map(elementItem => parseInt(elementItem));

/* Helper function to get the next line split into a character array */
const obtainCharacterArray = () => dataStream.fetchNextEntry().split("");

/* Helper function to check if more input is available */
const checkAvailability = () => dataStream.hasMoreEntries();

/* Helper function for console output */
const outputResult = (...outputValues) => console.log(...outputValues);

/**
 * Computes the factorial of a given BigInt number.
 * @param {BigInt} valueToFactorial - The number to compute the factorial for.
 * @returns {BigInt} The factorial of the input number.
 */
const factorialBigInt = (valueToFactorial) => {
  let productAccumulator = 1n; // Initialize accumulator as BigInt
  for (let counterVariable = 1n; counterVariable <= valueToFactorial; counterVariable++) {
    productAccumulator *= counterVariable; // Multiply using BigInt arithmetic
  }
  return productAccumulator;
};

/* Main application logic execution point */
const runApplication = () => {
  const [firstValue, secondValue] = obtainIntegerArray(); // Read two integer values from input
  
  // Calculate initial result: (factorial of firstValue) * (factorial of secondValue) * 2
  let calculatedAnswer = factorialBigInt(firstValue) * factorialBigInt(secondValue) * 2n;
  
  const MODULO_VALUE = 1000000007n; // Define the large BigInt modulo value
  
  // Repeatedly divide the answer by MODULO_VALUE until it's smaller than MODULO_VALUE
  // Note: This is not a standard modulo operation (%) but a repeated division.
  while (calculatedAnswer > MODULO_VALUE) {
    calculatedAnswer /= MODULO_VALUE;
  }
  
  // Convert the final BigInt result to a standard Number and print it
  console.log(Number(calculatedAnswer));
};

// Start the program execution
runApplication();