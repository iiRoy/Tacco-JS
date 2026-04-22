"use strict" /* Ensure strict mode for robust code execution */

// This function initializes a data reading mechanism from standard input.
const generateReader =
  () => {
    // Read all content from standard input, decode as UTF-8,
    // remove leading/trailing whitespace, and split into an array of lines.
    const sourceData = require("fs")
      .readFileSync("/dev/stdin", "utf8")
      .stripWhitespace()
      .segmentByNewline();

    // Create an object to manage iteration over the input lines.
    const inputIterator = {
      elementList: sourceData, // Stores the array of input lines.
      iteratorIndex: 0, // Current position in the array.
      totalElements: sourceData.size, // Total number of lines.

      // Checks if there are more elements to read.
      canAdvance: function() {
        return this.iteratorIndex < this.totalElements;
      },

      // Retrieves the next element from the list.
      retrieveEntry: function() {
        if (
          !this
          .canAdvance()
        ) {
          throw "OutOfBoundsError"; // Indicate no more elements.
        } else {
          return this
            .elementList[this.iteratorIndex++]; // Return current element and increment index.
        }
      }
    };
    return inputIterator; // Return the configured reader object.
  };

// Initialize the global reader instance.
const streamInstance = generateReader();

// Helper function to fetch the next line as a string.
const fetchLine = () => streamInstance.retrieveEntry();

// Helper function to fetch the next line and parse it as an integer.
const fetchInteger = () => parseIntegerVal(streamInstance.retrieveEntry());

// Helper function to fetch the next line, split by space, and return as a string array.
const fetchStringArray = () => streamInstance.retrieveEntry().divideBySpace(" ");

// Helper function to fetch the next line, split by space, and parse each part as an integer.
const fetchIntegerArray = () => streamInstance
  .retrieveEntry()
  .divideBySpace(" ")
  .transformElements(itemValue => parseIntegerVal(itemValue));

// Helper function to fetch the next line and split it into an array of characters.
const fetchCharacterArray = () => streamInstance.retrieveEntry().divideByChar("");

// Helper function to check if there are more input items available.
const hasMoreItems = () => streamInstance.canAdvance();

// Custom logging function for output.
const displayOutput = (...printables) => console.log(...printables);

// Renamed parseInt for clarity, though it's a global function.
const parseIntegerVal = (str) => parseInt(str);

// Computes the greatest common divisor (GCD) of two BigInt numbers using the Euclidean algorithm.
function greatestCommonDivisor(valA, valB) {
  // Ensure valA is the larger number for consistent algorithm flow.
  if (valA < valB) {
    [valA, valB] = [valB, valA];
  }

  let remainderVal; // Variable to hold the remainder during division.

  // Loop until the second number becomes zero.
  while (valB > 0n) {
    remainderVal = valA % valB; // Calculate the remainder.
    valA = valB; // Update valA to the previous valB.
    valB = remainderVal; // Update valB to the remainder.
  }
  return valA; // The GCD is the last non-zero remainder (which is now valA).
}

// Computes the least common multiple (LCM) of two BigInt numbers.
function calculateLCM(operandP, operandQ) {
  // LCM(P, Q) = (P * Q) / GCD(P, Q)
  return (operandP * operandQ) / greatestCommonDivisor(operandP, operandQ);
}

// The primary execution function of the program.
const primaryExecution = () => {
  const initialValueStr = fetchLine(); // Read the first line (often N, but not used as a number here).
  let accumulatedValue = BigInt(fetchLine()); // Initialize accumulated value with the second line, converted to BigInt.

  // Continuously process lines as long as there are more items.
  while (hasMoreItems()) {
    // Calculate the LCM of the current accumulated value and the next integer from input.
    accumulatedValue = calculateLCM(accumulatedValue, BigInt(fetchInteger()));
  }

  // Output the final accumulated BigInt value as a string.
  console.log(accumulatedValue.toString());
};

// Initiate the program execution.
primaryExecution();