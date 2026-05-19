const { count } = require("console"); // The 'count' property from the console module is imported, though not utilized in this specific script.

/**
 * The primary function responsible for processing input data and computing a final numerical result.
 * It reads two numbers from the input and applies a specific combinatorial formula.
 *
 * @param {string[]} inputData - An array of strings, where each string represents a line of input from the source.
 * @returns {number} The calculated numerical outcome based on the input values.
 */
function calculateResult(inputData) {
  // Retrieve two numerical values from the input stream using a helper function.
  const [firstValue, secondValue] = readNumbersArray();

  // Apply the core algorithm: calculate the sum of combinations (n C 2) for both numbers.
  // This formula is equivalent to (n * (n - 1)) / 2.
  const finalCalculation = (firstValue * (firstValue - 1)) / 2 + (secondValue * (secondValue - 1)) / 2;
  
  // Return the result of the computation.
  return finalCalculation;
}


// --- Utility Functions for Input Handling ---

// Reads the entire content from standard input, decodes it as UTF-8,
// removes leading/trailing whitespace, and then splits it into an array of lines.
const allInputLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

// A mutable index to keep track of which line is currently being processed from the input array.
let currentLineIndex = 0;

// A concise function to retrieve the next available line from the `allInputLines` array
// and automatically increment the line index for subsequent calls.
const fetchNextLine = () => allInputLines[currentLineIndex++];

// Converts the next fetched line into a standard JavaScript Number.
const readNumber = () => Number(fetchNextLine());

// Converts the next fetched line into a JavaScript BigInt.
const readBigInt = () => BigInt(fetchNextLine());

// Fetches the next line and splits it into an array of strings using a space character as the delimiter.
const splitLineIntoStrings = () => fetchNextLine().split(' ');

// Fetches the next line, splits it into strings, and then maps each string part to a Number.
const readNumbersArray = () => splitLineIntoStrings().map(Number);

// Fetches the next line, splits it into strings, and then maps each string part to a BigInt.
const readBigIntsArray = () => splitLineIntoStrings().map(BigInt);


// --- Program Execution Entry Point ---

// Invoke the main calculation function with the prepared input lines.
const programOutput = calculateResult(allInputLines);

// Display the final computed result to the standard output.
console.log(programOutput);
