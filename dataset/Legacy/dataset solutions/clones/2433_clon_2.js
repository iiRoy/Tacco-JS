'use strict';
// Import the Node.js file system module for input operations
const fs = require('fs');

// Global arrays to store precomputed factorials, modular inverses, and inverse factorials
let factArr = [];  // Stores factorials modulo M
let invArr = [];   // Stores modular multiplicative inverses
let finvArr = [];  // Stores inverse factorials modulo M

/**
 * Precomputes factorials, modular inverses, and inverse factorials up to a specified limit.
 * This function is essential for efficient calculation of combinations modulo a prime.
 * @param {number} limitVal - The maximum value for which to precompute.
 * @param {number} moduloVal - The prime modulus for all calculations.
 */
function initializeFactorialModulo(limitVal, moduloVal) {
    // Base cases for factorial and inverse factorial arrays
    factArr[0] = factArr[1] = 1;
    finvArr[0] = finvArr[1] = 1;
    invArr[1] = 1; // The modular inverse of 1 is always 1

    // Iterate from 2 up to the limit to fill the arrays
    for (let idx = 2; idx <= limitVal; idx++) {
        // Calculate the modular inverse of 'idx' using the property:
        // inv[i] = mod - floor(mod / i) * inv[mod % i] % mod
        // Math.floor is crucial here to ensure integer division behavior in JavaScript.
        invArr[idx] = moduloVal - Math.floor(moduloVal / idx) * invArr[moduloVal % idx] % moduloVal;
        // Calculate factorial: factArr[idx] = (idx * factArr[idx-1]) % moduloVal
        factArr[idx] = factArr[idx - 1] * idx % moduloVal;
        // Calculate inverse factorial: finvArr[idx] = (finvArr[idx-1] * invArr[idx]) % moduloVal
        finvArr[idx] = finvArr[idx - 1] * invArr[idx] % moduloVal;
    }
}

/**
 * Computes the number of combinations (nCk) modulo a given prime.
 * This function relies on the `initializeFactorialModulo` function having been called
 * with `totalElements` as the limit or greater.
 * @param {number} totalElements - The total number of items (n).
 * @param {number} selectElements - The number of items to choose (k).
 * @param {number} moduloValC - The prime modulus.
 * @returns {number} The value of C(n, k) modulo `moduloValC`. Returns 0 for invalid inputs.
 */
function calculateCombinationModulo(totalElements, selectElements, moduloValC) {
    // If k is greater than n, or if n or k are negative, the combination is 0.
    if (totalElements < selectElements) return 0;
    if (totalElements < 0 || selectElements < 0) return 0;

    // C(n, k) = n! / (k! * (n-k)!) = n! * (k!)^-1 * ((n-k)!)^-1 (mod M)
    // Using precomputed factorials and inverse factorials:
    return factArr[totalElements] * (finvArr[selectElements] * finvArr[totalElements - selectElements] % moduloValC) % moduloValC;
}

/**
 * Solves a specific combinatorial problem related to reaching a target coordinate (x, y)
 * using only steps of (1,2) and (2,1).
 * @param {number} coordX - The target X-coordinate.
 * @param {number} coordY - The target Y-coordinate.
 * @returns {number} The number of ways to reach (coordX, coordY) modulo 10^9 + 7.
 */
function computeSolution(coordX, coordY) {
    // A necessary condition for reaching (x,y) is that (x+y) must be divisible by 3.
    // If not, no valid path exists.
    if ((coordX + coordY) % 3 > 0) {
        return 0;
    }

    // Derive the number of (1,2) steps (valN) and (2,1) steps (valM) required.
    // These formulas are derived from solving the system of equations:
    // valM + 2*valN = coordX
    // 2*valM + valN = coordY
    let valN = (2 * coordY - coordX) / 3;
    let valM = (2 * coordX - coordY) / 3;

    // If either valN or valM is negative, it means the target is unreachable with positive steps.
    if (valN < 0 || valM < 0) {
        return 0;
    }

    // Define the large prime modulus, commonly used in competitive programming.
    const largePrime = 10e9 + 7; // Represents 1,000,000,007

    // Initialize the factorial arrays up to the sum of valN and valM, which is the total number of steps.
    initializeFactorialModulo(valN + valM, largePrime);

    // The problem reduces to finding the number of ways to arrange valN steps of one type
    // and valM steps of another type, which is C(valN + valM, valN).
    return calculateCombinationModulo(valN + valM, valN, largePrime);
}

/**
 * The main entry point of the program.
 * Reads input from stdin, parses it, and prints the computed solution.
 * @param {string} inputString - The raw string content read from standard input.
 */
function entryPoint(inputString) {
    // Split the input string by whitespace to get the coordinate values.
    const inputParts = inputString.split(/\s/);
    // Parse the first part as the X-coordinate.
    let inputX = parseInt(inputParts[0], 10);
    // Parse the second part as the Y-coordinate.
    let inputY = parseInt(inputParts[1], 10);

    // Call the solution function with the parsed coordinates and print the result.
    console.log(computeSolution(inputX, inputY));
}

// Read the entire content of standard input as a UTF-8 string and pass it to the entry point.
entryPoint(fs.readFileSync('/dev/stdin', 'utf8'));
