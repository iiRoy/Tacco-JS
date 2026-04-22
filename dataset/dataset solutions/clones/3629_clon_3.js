/*
 * This module processes incoming lines of text to solve a specific combinatorial problem.
 * It identifies contiguous sub-sequences within a numeric array whose sum is
 * perfectly divisible by a given modulus.
 *
 * The core logic involves computing prefix sums modulo the divisor and
 * tracking the frequencies of these remainders to efficiently count valid sub-sequences.
 */

// A container to hold all received input lines.
const collectedInputRows = [];

// Leverage the standard Node.js 'readline' utility for stream processing.
const inputReaderModule = require('readline');

// Configure the interface to handle standard input and output streams.
const streamHandler = inputReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

/**
 * Helper function to extract a specific integer from a space-separated string.
 * @param {string} lineString - The input string containing space-separated numbers.
 * @param {number} indexPos - The zero-based index of the number to extract.
 * @returns {number} The parsed integer.
 */
function extractIntegerAtIndex(lineString, indexPos) {
    // Split the string by spaces, access the desired part, and convert it to an integer.
    return parseInt(lineString.split(" ")[indexPos], 10);
}

// Event listener for each line received from standard input.
streamHandler.on('line', (lineContent) => {
    // Store each line of content for later processing.
    collectedInputRows.push(lineContent);
});

// Event listener triggered once the input stream is fully closed.
streamHandler.on('close', () => {
    // Basic validation: ensure we have at least two lines of input.
    if (collectedInputRows.length < 2) {
        console.error("Error: Insufficient input provided. Expected at least two lines.");
        return; // Exit if input is invalid.
    }

    // Parse the first line to get array size and modulus value.
    const arrayLength = extractIntegerAtIndex(collectedInputRows[0], 0);
    const modulusValue = extractIntegerAtIndex(collectedInputRows[0], 1);

    // Parse the second line into an array of numbers.
    // Ensure robust parsing by filtering out any potential empty strings from split.
    const dataElements = collectedInputRows[1]
        .split(" ")
        .map(numericString => parseInt(numericString, 10))
        .filter(val => !isNaN(val)); // Filter out any non-numeric results from parsing

    // Initialize an array to store prefix sums modulo the modulusValue.
    // The size will be arrayLength + 1, with the first element (index 0) being 0.
    const prefixSumsModulo = new Array(arrayLength + 1).fill(0);

    // Calculate the prefix sums modulo modulusValue.
    // prefixSumsModulo[k] will store (A[0] + ... + A[k-1]) % modulusValue.
    for (let elementIdx = 0; elementIdx < arrayLength; elementIdx++) {
        const currentSum = prefixSumsModulo[elementIdx] + dataElements[elementIdx];
        // Ensure the modulo result is non-negative by adding modulusValue before final modulo,
        // although for positive numbers, a simple % is usually sufficient.
        prefixSumsModulo[elementIdx + 1] = ((currentSum % modulusValue) + modulusValue) % modulusValue;
    }

    // Initialize a Map to track the frequency of each remainder.
    // A Map is used for better performance and clarity with arbitrary keys.
    const remainderFrequencyMap = new Map();
    // Initialize the map with remainder 0 having a frequency of 1.
    // This accounts for subarrays that start from index 0 and whose sum is divisible by modulusValue.
    remainderFrequencyMap.set(0, 1);

    // Variable to accumulate the total count of valid subarrays.
    let totalCountOfSubarrays = 0;

    // Iterate through the calculated prefix sums (starting from the second element, index 1).
    // For each prefix sum, check how many times the same remainder has appeared before.
    for (let currentSumIdx = 1; currentSumIdx <= arrayLength; currentSumIdx++) {
        const currentRemainder = prefixSumsModulo[currentSumIdx];

        // Retrieve the count of this remainder seen so far; default to 0 if not present.
        const existingCount = remainderFrequencyMap.get(currentRemainder) || 0;

        // Add the existing count to our total. Each previous occurrence of this remainder
        // forms a valid subarray ending at the current position.
        totalCountOfSubarrays += existingCount;

        // Increment the frequency of the current remainder in the map.
        remainderFrequencyMap.set(currentRemainder, existingCount + 1);
    }

    // Output the final computed count of subarrays.
    console.log(totalCountOfSubarrays);
});