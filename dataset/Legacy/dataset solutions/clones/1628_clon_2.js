const rawData = require("fs").readFileSync("/dev/stdin", "utf8"); // Read input from standard input path
const dataRows = rawData.split('\n'); // Split the entire input string into an array of lines
const targetNum = dataRows[0] - 0; // Convert the first line of input to a numeric value, which is our 'K'

const moduloVal = 1000000007; // Define a large prime number for modular arithmetic operations

/**
 * Performs modular multiplication (valA * valB) % moduloVal.
 * This function is designed to handle potentially large intermediate products
 * by splitting the first operand (valA) into two 16-bit parts.
 * This helps prevent overflow before the modulo operation is applied,
 * ensuring correctness for numbers that might exceed standard integer limits
 * if multiplied directly.
 *
 * @param {number} valA - The first integer operand.
 * @param {number} valB - The second integer operand.
 * @returns {number} The result of (valA * valB) % moduloVal.
 */
function multiplyMod(valA, valB) {
    // The expression (valA >> 16) extracts the higher 16 bits of valA.
    // The expression (valA & 65535) extracts the lower 16 bits of valA.
    // The calculation effectively computes ( (high_part * 2^16 * valB) + (low_part * valB) ) % moduloVal.
    return ((valA >> 16) * valB % moduloVal * 65536 + (valA & 65535) * valB) % moduloVal;
}

// An immediately invoked function expression (IIFE) to encapsulate the main program logic.
((initialInput) => {
    // Check for trivial cases where no solution exists.
    // A number composed solely of '7's (e.g., 7, 77, 777) can never be divisible by 2 or 5.
    if (targetNum % 2 === 0 || targetNum % 5 === 0) {
        console.log(-1); // Output -1 to indicate no solution.
        return; // Exit the function early.
    }

    let currentSum = 0; // Initialize a variable to accumulate the sum of terms.
                        // This sum represents (7*10^0 + 7*10^1 + ... + 7*10^(outerIdx-1)) % moduloVal.

    // Loop through possible lengths of the number consisting of '7's.
    // The loop runs up to 'targetNum' times, as per the problem's constraints or typical solution bounds.
    for (let outerIdx = 0; outerIdx <= targetNum; outerIdx++) {
        let powerOfTen = 1; // Represents 10 raised to the power of 'outerIdx', modulo 'moduloVal'.

        // Inner loop to calculate 10^outerIdx % moduloVal.
        // This 'powerOfTen' is used to determine the value of the current '7' term (e.g., 7, 70, 700).
        for (let innerIdx = 0; innerIdx < outerIdx; innerIdx++) {
            powerOfTen = multiplyMod(powerOfTen, 10); // Multiply by 10, applying modular arithmetic.
        }

        // Add the current term (7 * 10^outerIdx) % moduloVal to the running sum.
        // Note: 'currentSum' itself is not taken modulo 'targetNum' at each step,
        // it accumulates values that are already modulo 'moduloVal'.
        currentSum += multiplyMod(powerOfTen, 7);

        // Check if the accumulated sum (which represents (7 * (10^outerIdx - 1) / 9) % moduloVal)
        // is divisible by 'targetNum'.
        if (currentSum % targetNum === 0) {
            console.log(outerIdx + 1); // Output the length of the number (outerIdx + 1).
            break; // Terminate the loop as the smallest such number has been found.
        }
    }
})(rawData); // Pass the initially read raw data to the IIFE.
