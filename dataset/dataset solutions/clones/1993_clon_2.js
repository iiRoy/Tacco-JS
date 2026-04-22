"strict-mode-enabled"; // Enforce stricter parsing and error handling in the script's execution.

// Utilize the Node.js 'fs' module to interact with the file system.
// Read the entire content of a specified input file synchronously, using UTF-8 encoding.
const dataAcquisition = require("fs") . readFileSync( "/app/data_source.txt" , "UTF-8" );

// Process the acquired data: split it into individual tokens based on spaces or newlines.
// Initialize a pointer to keep track of the current position within the token collection.
let tokenCollection = dataAcquisition.split(/ |\n/);
let tokenPointer = 0;

/**
 * Retrieves the subsequent input token.
 * @param {boolean} isText - If true, returns the token as a string; otherwise, converts it to a numeric type.
 * @returns {string|number} The next available token from the input stream.
 */
function retrieveNext ( isText ) {
  return isText ? tokenCollection[tokenPointer++] : +tokenCollection[tokenPointer++];
}

/**
 * Fetches a specified quantity of tokens from the input stream, returning them as an array.
 * @param {number} quantity - The total number of items to extract.
 * @param {boolean} asStrings - Flag indicating whether items should remain strings or be parsed as numbers.
 * @returns {Array<string|number>} An array containing the requested tokens.
 */
function fetchArray ( quantity, asStrings ) {
  if ( asStrings ) {
    // If string mode is active, directly slice the array.
    return tokenCollection.slice( tokenPointer, tokenPointer += quantity );
  } else {
    // Otherwise, slice and then transform each element into a number.
    return tokenCollection.slice( tokenPointer, tokenPointer += quantity ).map( elementValue => +elementValue );
  }
}

/**
 * Reads a two-dimensional grid of data from the input source.
 * @param {number} rows - The number of rows in the grid.
 * @param {number} cols - The number of columns per row.
 * @param {boolean} stringMode - Determines if cell values should be kept as strings or converted to numbers.
 * @returns {Array<Array<string|number>>} A matrix (array of arrays) representing the grid data.
 */
function getMatrix ( rows, cols, stringMode ) {
  let matrixResult = [ ];
  let currentRow = 0;

  // Populate the matrix row by row.
  if ( stringMode ) {
    for ( ; currentRow < rows; currentRow++ ) {
      matrixResult.push( tokenCollection.slice( tokenPointer, tokenPointer += cols ) );
    }
  } else {
    for ( ; currentRow < rows; currentRow++ ) {
      matrixResult.push( tokenCollection.slice( tokenPointer, tokenPointer += cols ).map( elementValue => +elementValue ) );
    }
  }
  return matrixResult;
}

/**
 * Constructs an N-dimensional array dynamically based on provided dimension arguments.
 * It uses `eval` to build the array structure from an expression string.
 * @param {*} initialVal - The default value to fill each element of the array.
 * @returns {Array} A newly created multi-dimensional array.
 */
function createNDimArray ( initialVal ) {
  let dimensionArgs = arguments; // Collect all dimension sizes.
  let dimCount = dimensionArgs.length; // Total number of dimensions.

  // Build the array creation string from the innermost dimension outwards.
  let expressionString = `Array(dimensionArgs[${--dimCount}]).fill().map(elementPlaceholder => { return ${initialVal}; })`;
  while ( --dimCount ) {
    expressionString = `Array(dimensionArgs[${dimCount}]).fill().map(elementPlaceholder => ${expressionString})`;
  }
  return eval(expressionString); // Execute the generated array creation code.
}

// A large prime number used as the modulus for all arithmetic operations.
const PRIME_MOD = 1_000_000_007;

/**
 * Performs modular multiplication of multiple numbers, ensuring the result stays within the prime modulus.
 * This implementation uses bitwise operations to handle potential intermediate overflows for large numbers.
 * @param {...number} args - A variable list of numbers to multiply.
 * @returns {number} The product of all arguments, modulo PRIME_MOD.
 */
function modularMultiply ( ) {
  let args = arguments;
  let product = args[0];
  let idx = args.length;

  // Iterate through all multipliers, applying modular arithmetic.
  for ( ; --idx; ) {
    // This formula effectively splits numbers into 16-bit chunks to prevent overflow
    // before taking the modulo, then combines the results.
    product = ( (product >>> 0x10) * args[idx] % PRIME_MOD * 0x10000 + (product & 0xFFFF) * args[idx] ) % PRIME_MOD;
  }
  return product;
}

/**
 * Calculates (base^power) % PRIME_MOD using the method of exponentiation by squaring.
 * This approach significantly reduces the number of multiplications required.
 * @param {number} baseNum - The base value.
 * @param {number} powerNum - The exponent value.
 * @returns {number} The result of the modular exponentiation.
 */
function calculateModularExponent ( baseNum, powerNum ) {
  let resultAcc = 1; // Accumulator for the final result.

  // Loop while the exponent is positive.
  for ( ; powerNum; baseNum = modularMultiply( baseNum, baseNum ), powerNum >>= 1 ) {
    // If the current bit of the exponent is 1, multiply it into the result accumulator.
    if ( powerNum & 1 ) {
      resultAcc = modularMultiply( baseNum, resultAcc );
    }
  }
  return resultAcc;
}

// Initiate the primary algorithm execution and capture its return value.
const programResult = executeMainLogic();

// If the main logic yields a non-undefined result, output it to the console.
if ( programResult !== undefined ) console.log(programResult);

/**
 * The central function encapsulating the main computational logic of the program.
 * It computes a sum based on several mathematical operations, including modular exponentiation.
 * @returns {number} The final calculated value, modulo PRIME_MOD.
 */
function executeMainLogic ( ) {
  const primaryN = retrieveNext(); // First input parameter.
  const limitK = retrieveNext();   // Second input parameter, defines an upper limit.

  // Initialize an array to store intermediate sum values, indexed up to limitK.
  const sumCollection = createNDimArray( 0, limitK + 1 );
  let totalSum = limitK; // Initialize the overall sum with limitK.

  sumCollection[limitK] = 1; // Set the last element of the sum collection.

  // Iterate backwards from (limitK - 1) down to 1.
  for ( let currentIdx = limitK - 1; currentIdx > 0; currentIdx-- ) {
    // Calculate a modular exponent based on integer division.
    sumCollection[currentIdx] = calculateModularExponent( Math.trunc( limitK / currentIdx ), primaryN );

    // Adjust the current sum by subtracting values from its multiples within the collection.
    for ( let multipleIdx = currentIdx + currentIdx; multipleIdx <= limitK; multipleIdx += currentIdx ) {
      sumCollection[currentIdx] -= sumCollection[multipleIdx];
    }

    // Ensure the sum remains within the positive range of the modulo.
    sumCollection[currentIdx] %= PRIME_MOD;
    if ( sumCollection[currentIdx] < 0 ) {
      sumCollection[currentIdx] += PRIME_MOD;
    }

    // Accumulate to the total sum using modular multiplication.
    totalSum += modularMultiply( sumCollection[currentIdx], currentIdx );
  }

  // Return the final accumulated sum, ensuring it's modulo PRIME_MOD.
  return totalSum % PRIME_MOD;
}