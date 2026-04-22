"use strict";

// Helper for modular exponentiation (base^exp % mod)
// Uses BigInt for intermediate calculations to handle large numbers safely
const modExp = (base, exp, mod) => {
    let result = 1n; // Initialize result as BigInt
    let b = BigInt(base);
    let e = BigInt(exp);
    let m = BigInt(mod);

    b %= m; // Ensure base is within modulo range

    while (e > 0n) {
        if (e % 2n === 1n) { // If exponent is odd, multiply result by current base
            result = (result * b) % m;
        }
        b = (b * b) % m; // Square the base for the next iteration
        e /= 2n; // Halve the exponent
    }
    return Number(result); // Convert the final BigInt result back to Number
};

// Helper for modular multiplicative inverse using Fermat's Little Theorem
// Calculates num^(mod-2) % mod, assuming mod is a prime number
const modInverse = (num, mod) => {
    return modExp(num, mod - 2, mod);
};

// Main processing function for the problem's logic
function processInputData(rawData) {
    // Define problem-specific constants
    const PRIME_MODULUS = 998244353; // The modulus for all arithmetic operations
    const MAX_ITEM_COUNT = 305;      // Maximum number of items supported by array dimensions

    // Helper for modular addition: (valA + valB) % PRIME_MODULUS
    const safeModAdd = (valA, valB) => {
        return (valA + valB) % PRIME_MODULUS;
    };

    // Helper for modular multiplication: (valA * valB) % PRIME_MODULUS
    // Uses BigInt to prevent potential overflow during multiplication before the modulo operation
    const safeModMultiply = (valA, valB) => {
        return Number((1n * BigInt(valA) * BigInt(valB)) % BigInt(PRIME_MODULUS));
    };

    // Initialize an input parser to extract values from the raw data string
    let inputProcessor = new TextTokenStream(rawData);

    let numItems;
    try {
        numItems = inputProcessor.extractInteger(); // Read the total number of items
    } catch (e) {
        console.error("Input reading error for number of items: " + e.message);
        return;
    }
    
    // Validate the number of items against problem constraints
    if (numItems <= 0 || numItems > MAX_ITEM_COUNT) {
        console.error("Error: Number of items (" + numItems + ") must be between 1 and " + MAX_ITEM_COUNT + ".");
        return; // Terminate execution if input is invalid
    }

    let itemWeights;
    try {
        itemWeights = inputProcessor.extractIntegerArray(numItems); // Read the array of item weights
    } catch (e) {
        console.error("Input reading error for item weights: " + e.message);
        return;
    }

    // Validate that all item weights are non-negative
    if (itemWeights.some(w => w < 0)) {
        console.error("Error: All item weights must be non-negative.");
        return; // Terminate if any weight is negative
    }

    // Sort item weights in ascending order. This often simplifies dynamic programming approaches.
    itemWeights.sort((weightA, weightB) => weightA - weightB);

    // Calculate cumulative sums (prefix sums) of item weights.
    // cumulativeWeights[i] will store the sum of the first 'i' itemWeights (0-indexed).
    // The array is 1-indexed for convenience in DP loops related to sum up to an item.
    let cumulativeWeights = new Array(numItems + 1).fill(0);
    for (let i = 0; i < numItems; i++) {
        cumulativeWeights[i + 1] = cumulativeWeights[i] + itemWeights[i];
    }

    const totalSumOfAllWeights = cumulativeWeights[numItems]; // The sum of all item weights

    // Initialize Dynamic Programming arrays:
    // powerSumDP[s]: Stores sum of 2^(numItems - |S|) for all subsets S that sum to 's'.
    // countDP[s]: Stores the count of all subsets S that sum to 's'.
    // Array size is totalSumOfAllWeights + 1 to accommodate sums from 0 up to totalSumOfAllWeights.
    let powerSumDP = new Array(totalSumOfAllWeights + 1).fill(0);
    let countDP = new Array(totalSumOfAllWeights + 1).fill(0);

    // Base cases for DP:
    // For a sum of 0 (empty set), there are numItems elements not chosen.
    // So, it contributes 2^numItems to powerSumDP[0].
    powerSumDP[0] = modExp(2, numItems, PRIME_MODULUS);
    // There is one way to achieve a sum of 0 (the empty set).
    countDP[0] = 1;

    // Pre-calculate the modular inverse of 2, as it's used repeatedly in the DP update for powerSumDP.
    const inverseOfTwo = modInverse(2, PRIME_MODULUS);

    // Dynamic Programming loop: Iterate through each item to update DP states.
    // This is a variation of the knapsack problem or subset sum problem.
    for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
        const currentItemWeight = itemWeights[itemIndex];
        // currentMaxReachableSum: The maximum sum that can be formed using items up to the current item.
        const currentMaxReachableSum = cumulativeWeights[itemIndex + 1];

        // Iterate backwards through possible sums. This ensures that each item is considered only once
        // for forming a subset within the current outer loop iteration (0/1 knapsack style).
        for (let currentSum = currentMaxReachableSum; currentSum >= currentItemWeight; currentSum--) {
            // Update powerSumDP: If a subset summing to (currentSum - currentItemWeight) exists,
            // adding currentItemWeight to it forms a new subset summing to currentSum.
            // The number of remaining items decreases by 1, so 2^(numItems - |S|) is divided by 2.
            powerSumDP[currentSum] = safeModAdd(
                powerSumDP[currentSum],
                safeModMultiply(powerSumDP[currentSum - currentItemWeight], inverseOfTwo)
            );
            // Update countDP: Add the count of subsets summing to (currentSum - currentItemWeight)
            // to the count of subsets summing to currentSum.
            countDP[currentSum] = safeModAdd(
                countDP[currentSum],
                countDP[currentSum - currentItemWeight]
            );
        }
    }

    let intermediateCalculatedSum = 0; // Accumulator for the specific sum required by the problem

    const overallTotalWeight = cumulativeWeights[numItems]; // The full sum of all weights
    const halfOverallTotalWeight = Math.floor(overallTotalWeight / 2); // Integer half of the total sum

    // Specific condition based on the problem statement:
    // If the overall total weight is even, special handling for subsets summing to exactly half of it.
    if (overallTotalWeight % 2 === 0) {
        // Add powerSumDP value for the midpoint sum
        intermediateCalculatedSum = safeModAdd(intermediateCalculatedSum, powerSumDP[halfOverallTotalWeight]);
        // Subtract countDP value for the midpoint sum (achieved by adding (MOD - value) % MOD)
        intermediateCalculatedSum = safeModAdd(intermediateCalculatedSum, (PRIME_MODULUS - countDP[halfOverallTotalWeight]));
    }

    // Accumulate powerSumDP values for all sums strictly greater than halfOverallTotalWeight
    for (let s = halfOverallTotalWeight + 1; s <= overallTotalWeight; s++) {
        intermediateCalculatedSum = safeModAdd(intermediateCalculatedSum, powerSumDP[s]);
    }

    // Multiply the accumulated sum by 3 as per problem's final formula
    intermediateCalculatedSum = safeModMultiply(intermediateCalculatedSum, 3);

    // Calculate 3^numItems modulo PRIME_MODULUS
    const totalPossibilitiesThreePower = modExp(3, numItems, PRIME_MODULUS);

    // Final result calculation: (3^numItems - intermediateCalculatedSum) % PRIME_MODULUS
    // Subtraction is performed using modular addition with (MOD - value).
    let finalAnswer = safeModAdd(totalPossibilitiesThreePower, (PRIME_MODULUS - intermediateCalculatedSum));

    // Ensure the final answer is positive (redundant if safeModAdd is correctly implemented, but harmless)
    finalAnswer = (finalAnswer % PRIME_MODULUS + PRIME_MODULUS) % PRIME_MODULUS;
    
    // Output the computed final answer
    console.log(finalAnswer);
}

// Custom class for parsing input strings into tokens (integers or strings)
class TextTokenStream {
    constructor(sourceString) {
        // Split the source string by any sequence of whitespace characters (newline or space).
        // Filter out any empty strings that might result from multiple consecutive delimiters.
        this.tokenBuffer = sourceString.split(/[\n\s]+/).filter(s => s.length > 0);
        this.readPointer = 0; // Pointer to the current token to be read from the buffer
    }

    // Extracts and returns the next integer from the token stream.
    extractInteger() {
        if (this.readPointer >= this.tokenBuffer.length) {
            throw new Error("Attempted to read past the end of the input stream.");
        }
        const currentToken = this.tokenBuffer[this.readPointer++];
        const parsedValue = parseInt(currentToken, 10); // Parse as base-10 integer
        if (isNaN(parsedValue)) {
            throw new Error("Invalid integer format encountered: '" + currentToken + "'");
        }
        return parsedValue;
    }

    // Extracts an array containing 'count' integers from the stream.
    extractIntegerArray(count) {
        let resultArray = new Array(count);
        for (let i = 0; i < count; i++) {
            resultArray[i] = this.extractInteger();
        }
        return resultArray;
    }

    // Extracts and returns the next string token from the stream.
    extractString() {
        if (this.readPointer >= this.tokenBuffer.length) {
            throw new Error("Attempted to read past the end of the input stream.");
        }
        return this.tokenBuffer[this.readPointer++];
    }

    // Extracts an array containing 'count' string tokens from the stream.
    extractStringArray(count) {
        let resultArray = new Array(count);
        for (let i = 0; i < count; i++) {
            resultArray[i] = this.extractString();
        }
        return resultArray;
    }
}

// Standard boilerplate for competitive programming environments.
// This block handles reading input from stdin when executed in a Node.js-like environment.
if (typeof window === "undefined") {
    // Check if 'require' is available, indicating a Node.js environment.
    if (typeof require !== "undefined" && typeof module !== "undefined" && typeof module.exports !== "undefined") {
        const fs = require("fs"); // Node.js file system module
        // Read input from /dev/stdin, which is a common convention for online judges.
        const inputData = fs.readFileSync("/dev/stdin", "utf8");
        processInputData(inputData); // Call the main processing function with the input data.
    } else {
        // Fallback for environments that are neither browser nor Node.js with 'fs'.
        console.error("Error: Not running in a browser or Node.js environment with fs module. Cannot read stdin.");
    }
}