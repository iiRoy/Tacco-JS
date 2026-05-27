var rawData = `4
3 5 6 4`; // Initial sample data for processing.

// Another set of sample input values, currently commented out.
// var rawData = `4
// 141421356 17320508 22360679 244949`;

// Divide the entire input string into an array of separate lines.
const inputLines = rawData.split('\n');

// Extract the first number from the input, representing the count of elements.
let countElements = Number(inputLines[0]);

// Process the second line: split it by spaces and convert each part to a numerical value.
let numericArray = inputLines[1].split(' ').map(val => parseInt(val, 10));

// Define the constant modulus value used for all arithmetic operations.
const MOD_VAL = 1000000007;

// Initialize an array to store cumulative sums (prefix sums).
// The first element is zero to simplify calculations.
const prefixSums = [0];

// Populate the prefixSums array by iterating through the numericArray.
// Each element `prefixSums[idx + 1]` holds the sum of `numericArray[0]` through `numericArray[idx]`, modulo MOD_VAL.
for (let idx = 0; idx < countElements; ++idx) {
    prefixSums[idx + 1] = (prefixSums[idx] + numericArray[idx]) % MOD_VAL;
}

/**
 * Performs modular multiplication for two numbers, handling potential intermediate overflows.
 * This function splits the first operand into high and low 16-bit parts to ensure
 * that intermediate products remain within manageable limits before applying the modulo.
 *
 * @param {number} operandA - The first integer operand.
 * @param {number} operandB - The second integer operand.
 * @returns {number} The product of operandA and operandB, taken modulo MOD_VAL.
 */
function multiplyModulo(operandA, operandB) {
    // The calculation is based on the property: (X * Y) % M = (((X_high * 2^16) % M) * Y % M + (X_low * Y) % M) % M
    // Here, (operandA >>> 16) is X_high, (operandA & 0xFFFF) is X_low, and 65536 is 2^16.
    return ( ( (operandA >>> 16) * operandB % MOD_VAL * 65536 ) + ( (operandA & 0xFFFF) * operandB ) ) % MOD_VAL;
}

// Initialize a variable to store the final aggregated result.
let finalResult = 0;

// Iterate through the prefixSums array, starting from the second element
// and ending before the last element, to perform the core calculation.
for (let currentIdx = 1; currentIdx < prefixSums.length - 1; currentIdx++) {
    // Accumulate the product of the current prefix sum and the corresponding element from the original array.
    // The multiplication is performed using the custom modular multiplication function.
    finalResult += multiplyModulo(prefixSums[currentIdx], numericArray[currentIdx]);
}

// Display the final computed result, ensuring it is within the modulo range.
console.log(finalResult % MOD_VAL);
