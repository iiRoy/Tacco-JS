const { inspect } = require("util");

/**
 * Primary processing routine to compute a combinatorial result from input.
 *
 * @param {Array<string>} inputSegments The collection of text lines provided for processing.
 * @returns {number} The final computed numerical value.
 */
function calculateCombinations( inputSegments ) {
  // Extract two distinct numerical values from the input stream.
  const [ valueOne, valueTwo ] = retrieveNumberArray();

  // Apply the combination formula C(n, 2) = n * (n - 1) / 2
  // and sum the results for both extracted values.
  const finalComputation = ( valueOne * ( valueOne - 1 ) / 2 ) +
                           ( valueTwo * ( valueTwo - 1 ) / 2 );
  
  return finalComputation; // Deliver the outcome.
}



// --- Input Acquisition Mechanisms ---

// Read all incoming data from standard input, process it, and split into lines.
const sourceDataLines = require("fs"). readFileSync("/dev/stdin", "utf8"). trim(). split("\n");

// A dynamic pointer indicating the current line being consumed.
let currentLineIdx = 0;

// Helper to fetch the next line as a raw string.
const fetchStringLine = () => sourceDataLines[ currentLineIdx++ ];

// Helper to convert the next line into a standard JavaScript Number.
const convertToNumber = () => Number( fetchStringLine() );

// Helper to transform the next line into a JavaScript BigInt.
const generateBigInt = () => BigInt( fetchStringLine() );

// Helper to split the next line by spaces into an array of string tokens.
const splitIntoStringTokens = () => fetchStringLine(). split(' ');

// Helper to parse the next line into an array of Numbers.
const retrieveNumberArray = () => splitIntoStringTokens(). map(Number);

// Helper to parse the next line into an array of BigInts.
const retrieveBigIntArray = () => splitIntoStringTokens(). map(BigInt);


// Initiate the main calculation process.
const programResult = calculateCombinations( sourceDataLines );

// Output the calculated result to the console for display.
console.log( programResult );