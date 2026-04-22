// This script processes input to perform comparisons based on accumulated sums.

const fsModule = require('fs'); // Obtain the file system module.

let processedInput = fsModule.readFileSync('/dev/fd/0', 'utf-8'); // Read all input data as a UTF-8 string.

// Prepare the input: remove leading/trailing whitespace and split into individual lines.
let inputLines = processedInput.trim().split("\r\n");

// Remove the first line of the input, as it's typically metadata.
inputLines.shift();

// Extract the first set of numbers from the next line, convert them to integers.
let firstNumberSet = inputLines
    .shift()
    .split(" ")
    .map(valueStr => parseInt(valueStr, 10)); // Convert each string part to a base-10 integer.

// Sort the extracted numbers in ascending order for subsequent processing.
firstNumberSet.sort((leftVal, rightVal) => leftVal - rightVal);

// Remove another line from the input, potentially a separator.
inputLines.shift();

// Extract the second set of numbers from the next line, converting to integers.
let secondNumberSet = inputLines
    .shift()
    .split(" ")
    .map(valueStr => parseInt(valueStr, 10));

// Extract the string data from the subsequent line.
let stringData = inputLines
    .shift()
    .split(" ");

// Define the maximum expected size for our sum cache.
const MAX_CACHE_SIZE = 1000000;

// Initialize a cache (lookup table) to store pre-calculated sums.
let sumCache = [];

// Fill the cache with null values initially.
for (let loopIndex = 0; loopIndex < MAX_CACHE_SIZE; loopIndex++) {
    sumCache[loopIndex] = null;
}

// Special handling for the zero index in the sum cache.
const INITIAL_ZERO_SUM = [0, 0];
sumCache[0] = INITIAL_ZERO_SUM;

// Define a large modulo value for handling arbitrary precision arithmetic (10^12).
const BIG_NUMBER_MODULO = 1000000000000;

// Initialize the current running sum, split into high and low parts.
let currentSumParts = [0, 0];

// Iterate through the first set of numbers to populate the sum cache.
firstNumberSet.forEach(currentNum => {
    currentSumParts[1] += currentNum; // Add the number to the low part of the sum.

    // If the low part exceeds the modulo, carry over to the high part.
    if (currentSumParts[1] >= BIG_NUMBER_MODULO) {
        currentSumParts[0]++;                        // Increment the high part.
        currentSumParts[1] -= BIG_NUMBER_MODULO;     // Adjust the low part.
    }

    // Store a snapshot (copy) of the current sum in the cache at the number's index.
    sumCache[currentNum] = currentSumParts.slice();
});

// Process each query from the second set of numbers and corresponding string data.
secondNumberSet.forEach((queryVal, queryIdx) => {
    // Search backward from queryVal until an entry is found in the sum cache.
    for (; ; ) {
        if (sumCache[queryVal] !== null) { // If an entry exists for queryVal, stop searching.
            break;
        }
        queryVal--; // Otherwise, decrement queryVal and try again.
    }

    let targetString = stringData[queryIdx]; // Get the string associated with the current query index.

    // Parse the target string into a two-part large number for comparison.
    // The first part is the prefix before the last 13 digits, the second is the last 13 digits.
    let parsedNumberPair = [
        parseInt(targetString.substring(0, targetString.length - 13).replace(/^[0]+/g, ""), 10) || 0, // Convert prefix to integer, handling leading zeros and empty strings.
        parseInt(targetString.slice(-13).replace(/^[0]+/g, ""), 10) || 0 // Convert last 13 digits to integer, handling leading zeros.
    ];

    let comparisonOutput = ""; // Variable to store the "Yes" or "No" result.

    // Compare the parsed large number with the sum from the cache.
    if (parsedNumberPair[0] < sumCache[queryVal][0]) {
        comparisonOutput = "Yes"; // If the high part is smaller, it's definitively "Yes".
    } else if (parsedNumberPair[0] === sumCache[queryVal][0] && parsedNumberPair[1] <= sumCache[queryVal][1]) {
        comparisonOutput = "Yes"; // If high parts are equal, check if low part is smaller or equal.
    } else {
        comparisonOutput = "No"; // Otherwise, the parsed number is larger.
    }

    // Print the comparison result to the console.
    console.log(comparisonOutput);
});