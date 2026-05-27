"use strict";

// Read input from standard input, splitting by spaces or newlines
let rawData = require("fs").readFileSync("/dev/stdin", "utf8");
let tokenStream = rawData.split(/ |\n/);
let tokenIndex = 0;

// Helper function to get the next number from the token stream
function getNextNum() {
    return +tokenStream[tokenIndex++];
}

// Helper function to get the next string from the token stream
function getNextStr() {
    return tokenStream[tokenIndex++];
}

// Helper function to get the next BigInt from the token stream
function getNextBigInt() {
    return BigInt(tokenStream[tokenIndex++]);
}

// Helper function to get an array of numbers or strings
function getNumsArray(count, convertToNum) {
    // If convertToNum is true, return strings; otherwise, convert to numbers
    return convertToNum ? tokenStream.slice(tokenIndex, tokenIndex += count) : tokenStream.slice(tokenIndex, tokenIndex += count).map(item => +item);
}

// Helper function to get a 2D matrix of numbers or strings
function getMatrix(height, width, asStrings) {
    let resultMatrix = [];
    let currentIdx = 0;
    if (asStrings) {
        for (; currentIdx < height; currentIdx++) {
            resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width));
        }
    } else {
        for (; currentIdx < height; currentIdx++) {
            resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(val => +val));
        }
    }
    return resultMatrix;
}

// Dynamically create a multi-dimensional array initialized with a value
function createMultiDimArray(initialValue) {
    let args = arguments;
    let argCount = args.length;
    // Construct the string for array creation using eval
    let arrayCreationString = "Array(args[" + --argCount + "]).fill().map(element => { return " + initialValue + "; })";
    while (--argCount) {
        arrayCreationString = "Array(args[" + argCount + "]).fill().map(element => " + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

// Define the prime modulus for arithmetic operations
const primeModulus = 998244353; // A common prime modulus for competitive programming

// Modular multiplication function for multiple operands
function multiplyMod() {
    for (let operands = arguments, product = operands[0], k = operands.length; --k;) {
        // Optimized modular multiplication to prevent overflow before modulo
        product = ((product >> 16) * operands[k] % primeModulus * 65536 + (product & 65535) * operands[k]) % primeModulus;
    }
    return product;
}

// Arrays for precomputed factorials, inverse factorials, modular inverses, and powers of two
let factorials = [];
let invFactorials = [];
let modularInverses = []; // Not used in this specific problem, but often precomputed
let powersOfTwo = [];     // Not used in this specific problem, but often precomputed

// Function to precompute factorials and inverse factorials up to a limit
function precomputeFactorials(limit) {
    factorials.length = limit + 1;
    factorials[0] = factorials[1] = 1;
    for (let current = 2; current <= limit;) {
        factorials[current] = multiplyMod(factorials[current - 1], current++);
    }

    invFactorials.length = limit + 1;
    invFactorials[0] = invFactorials[1] = 1;
    invFactorials[limit] = modInverse(factorials[limit]); // Compute inverse of largest factorial
    for (let current = limit; 2 < current;) {
        invFactorials[current - 1] = multiplyMod(invFactorials[current], current--); // Compute others using relation
    }

    // The following lines are commented out in the original and thus remain commented.
    // modularInverses.length = limit + 1; modularInverses[0] = modularInverses[1] = 1;
    // for (let current = 2; current <= limit;) modularInverses[current] = multiplyMod(factorials[current - 1], invFactorials[current++]);
    // powersOfTwo.length = limit + 1; powersOfTwo[0] = 1;
    // for (let current = 1; current <= limit; current++) powersOfTwo[current] = powersOfTwo[current - 1] * 2 % primeModulus;
}

// Function to compute modular multiplicative inverse using extended Euclidean algorithm
function modInverse(num) {
    let modulusVal = primeModulus;
    let uVal = 0, vVal = 1, tempVal;
    while (num) {
        tempVal = modulusVal / num | 0; // Integer division
        modulusVal -= tempVal * num;
        uVal -= tempVal * vVal;
        // Swap values
        tempVal = modulusVal; modulusVal = num; num = tempVal;
        tempVal = uVal; uVal = vVal; vVal = tempVal;
    }
    uVal %= primeModulus;
    return uVal < 0 ? uVal + primeModulus : uVal;
}

// Function to compute modular exponentiation (base^exponent % primeModulus)
function modPow(base, exponent) {
    let result = 1;
    while (exponent) {
        if (exponent & 1) { // If exponent is odd
            result = multiplyMod(base, result);
        }
        base = multiplyMod(base, base); // Square the base
        exponent >>= 1; // Divide exponent by 2
    }
    return result;
}

// Function to compute nCr (n choose r) modulo primeModulus
function nCrMod(nVal, rVal) {
    // nCr = n! / (r! * (n-r)!) = n! * (r!)^-1 * ((n-r)!)^-1
    return multiplyMod(factorials[nVal], invFactorials[rVal], invFactorials[nVal - rVal]);
}

// Function to compute nPr (n permute r) modulo primeModulus
function nPrMod(nVal, rVal) {
    // nPr = n! / (n-r)! = n! * ((n-r)!)^-1
    return multiplyMod(factorials[nVal], invFactorials[nVal - rVal]);
}

// Function to normalize a number to be within [0, primeModulus-1]
function normalizeMod(value) {
    return (value % primeModulus + primeModulus) % primeModulus;
}

// Execute the main logic of the program
let programResult = executeMainLogic();

// Output the result if it's not undefined
if (programResult !== undefined) {
    console.log(programResult);
}

// Main function containing the problem-specific logic
function executeMainLogic() {
    // Read four integer inputs
    let [valA, valB, valC, valD] = getNumsArray(4);

    // Initialize a 2D dynamic programming table with zeros
    let dynamicProgTable = createMultiDimArray(0, valC + 1, valD + 1);

    // Set the base case for the DP table
    dynamicProgTable[valA][valB] = 1;

    // Iterate through the DP table to fill it
    for (let rowIdx = valA; rowIdx <= valC; rowIdx++) {
        for (let colIdx = valB; colIdx <= valD; colIdx++) {
            // Apply the recurrence relation
            // The formula is for counting paths on a grid with specific rules,
            // often seen in problems involving combinations or arrangements.
            // The subtraction term corrects for overcounting.
            dynamicProgTable[rowIdx][colIdx] += dynamicProgTable[rowIdx - 1][colIdx] * colIdx + dynamicProgTable[rowIdx][colIdx - 1] * rowIdx - multiplyMod(dynamicProgTable[rowIdx - 1][colIdx - 1], rowIdx - 1, colIdx - 1);
            
            // Ensure the result stays within the modulo range
            dynamicProgTable[rowIdx][colIdx] %= primeModulus;
        }
    }

    // Return the final computed value, normalized by the modulus
    return normalizeMod(dynamicProgTable[valC][valD]);
}
