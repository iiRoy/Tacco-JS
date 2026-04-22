'use strict'; // Activate strict mode for cleaner code and fewer silent errors

const fileSystem = require('fs'); // Acquire the Node.js file system interface

let prodArr = [];       // Container for precomputed modular factorial values
let invArr = [];        // Container for precomputed modular multiplicative inverses
let invProdArr = [];    // Container for precomputed modular inverse factorial values

/**
 * Initializes global arrays for efficient modular arithmetic operations.
 * This function populates `prodArr`, `invArr`, and `invProdArr` up to a given limit.
 *
 * @param {number} upperLimit  - The maximum integer for which to precompute values.
 * @param {number} currentModulus - The modulus to be used for all calculations.
 */
function initializeModularProducts(upperLimit, currentModulus) {
  // Set base cases for the product and inverse product arrays
  prodArr[0] = prodArr[1] = 1;
  invProdArr[0] = invProdArr[1] = 1;
  invArr[1] = 1;

  // Iterate from 2 up to the specified upper limit
  for ( let idx = 2; idx <= upperLimit; idx++ ) {
    // Compute the modular inverse using the property: inv(i) = mod - (mod / i) * inv(mod % i) % mod
    // Note: Math.floor is used to ensure integer division behavior
    invArr[idx] = currentModulus - Math.floor(currentModulus / idx) * invArr[currentModulus % idx] % currentModulus;
    
    // Compute the modular factorial: prodArr[idx] = (prodArr[idx - 1] * idx) % currentModulus
    prodArr[idx] = ( prodArr[idx - 1] * idx ) % currentModulus;
    
    // Compute the modular inverse factorial: invProdArr[idx] = (invProdArr[idx - 1] * invArr[idx]) % currentModulus
    invProdArr[idx] = ( invProdArr[idx - 1] * invArr[idx] ) % currentModulus;
  }
}

/**
 * Computes the number of combinations (nCk) modulo a given value.
 * This function relies on the precomputed arrays from `initializeModularProducts`.
 *
 * @param {number} totalCount   - The total number of distinct items available.
 * @param {number} selectCount  - The number of items to select from the total.
 * @param {number} modulusValue - The modulus for the combination calculation.
 * @returns {number} The result of C(totalCount, selectCount) modulo modulusValue, or 0 if input is invalid.
 */
function calculateCombinations( totalCount, selectCount, modulusValue ) {
  // Check for invalid conditions: selecting more items than available or negative counts
  if ( totalCount < selectCount || selectCount < 0 || totalCount < 0 ) {
    return 0;
  }
  
  // Apply the formula for combinations modulo a prime P: C(n, k) = n! * (k!)^-1 * ((n-k)!)^-1 (mod P)
  return ( prodArr[totalCount] * ( invProdArr[selectCount] * invProdArr[totalCount - selectCount] % modulusValue ) ) % modulusValue;
}

/**
 * Determines a solution based on two input coordinates, involving modular combinations.
 *
 * @param {number} coordA - The first input coordinate.
 * @param {number} coordB - The second input coordinate.
 * @returns {number} The calculated result, or 0 if the coordinates do not satisfy the problem's conditions.
 */
function computeSolution( coordA, coordB ) {
  // First condition check: sum of coordinates must be divisible by 3
  if ( ( coordA + coordB ) % 3 > 0 ) {
    return 0;
  }

  // Calculate two derived counts, representing steps in a grid traversal problem
  let pathCountN = ( 2 * coordB - coordA ) / 3;
  let pathCountM = ( 2 * coordA - coordB ) / 3;

  // Second condition check: both derived counts must be non-negative
  if ( pathCountN < 0 || pathCountM < 0 ) {
    return 0;
  }

  // Define a large prime modulus for all arithmetic operations
  const largePrimeMod = 10000000007; // This is 10e9 + 7 from the original code

  // Precompute modular values up to the sum of the path counts
  initializeModularProducts( pathCountN + pathCountM, largePrimeMod );
  
  // Return the result of C(pathCountN + pathCountM, pathCountN) modulo largePrimeMod
  return calculateCombinations( pathCountN + pathCountM, pathCountN, largePrimeMod );
}

/**
 * The primary execution function of the program.
 * It reads input, processes it, and prints the final result.
 *
 * @param {string} programInputString - The raw string input obtained from the standard input.
 */
function executeProgram( programInputString ) {
  // Split the input string into individual numeric tokens
  const inputTokens = programInputString.split( /\s+/ );
  
  // Parse the first two tokens as base-10 integers
  let firstCoordinate = parseInt( inputTokens[0], 10 );
  let secondCoordinate = parseInt( inputTokens[1], 10 );
  
  // Output the computed solution to the standard console
  console.log( computeSolution( firstCoordinate, secondCoordinate ) );
}

// Read the entire content of standard input as a UTF-8 string and pass it to the execution function
executeProgram( fileSystem.readFileSync( '/dev/stdin', 'utf8' ) );