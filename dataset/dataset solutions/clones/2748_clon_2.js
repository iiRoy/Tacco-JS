'use strict';

/**
 * Processes the raw input data to determine a specific condition.
 * This function analyzes numerical patterns based on bitwise XOR sums and frequencies.
 * @param {string} rawData - The complete input string, typically from stdin.
 */
function processInput(rawData) {
    // Split the input string into individual lines.
    const intermediateLines = rawData.split('\n');

    // Parse the first line to get the total number of elements.
    const totalElements = parseInt(intermediateLines[0], 10);

    // Parse the second line, splitting by space and converting each part to an integer.
    const initialValues = intermediateLines[1].split(' ').map((val) => parseInt(val, 10));

    // Convert each initial value to its binary string representation, then parse it as an integer.
    // This effectively treats the binary string as a base-10 number for comparison/storage.
    const binaryRepresentations = initialValues.map((val) => parseInt(val.toString(2)));

    // Create a frequency map to count occurrences of each binary representation.
    const frequencyCounter = new Map();
    for (let currentBinary of binaryRepresentations) {
        if (!frequencyCounter.has(currentBinary)) {
            frequencyCounter.set(currentBinary, 1); // First occurrence
        } else {
            // Increment count for existing binary representation.
            frequencyCounter.set(currentBinary, frequencyCounter.get(currentBinary) + 1);
        }
    }

    // Extract all unique binary keys from the frequency map into an array.
    let uniqueBinaryKeys = [];
    for (let currentKey of frequencyCounter.keys()) {
        uniqueBinaryKeys.push(currentKey);
    }

    // Get the number of distinct binary keys found.
    let distinctKeyCount = uniqueBinaryKeys.length;

    // Initialize a boolean flag to track if the specific condition is met.
    let isConditionMet = false;

    // Check conditions based on the total number of elements.
    if (totalElements % 3 === 0) {
        // Case 1: totalElements is divisible by 3.
        if (distinctKeyCount === 3) {
            // If there are exactly three distinct binary keys.
            const exclusiveOrSum = uniqueBinaryKeys[0] ^ uniqueBinaryKeys[1] ^ uniqueBinaryKeys[2];
            if (exclusiveOrSum === 0) {
                // If their XOR sum is zero, check if each appears N/3 times.
                if ((frequencyCounter.get(uniqueBinaryKeys[0]) === totalElements / 3) &&
                    (frequencyCounter.get(uniqueBinaryKeys[1]) === totalElements / 3) &&
                    (frequencyCounter.get(uniqueBinaryKeys[2]) === totalElements / 3)) {
                    isConditionMet = true;
                }
            }
        } else if (distinctKeyCount === 2) {
            // If there are exactly two distinct binary keys.
            // Assume condition met initially, then refine.
            isConditionMet = true;
            // Check if one of the keys is 0.
            if (uniqueBinaryKeys.indexOf(0) !== -1) {
                // Remove 0 from the keys array to isolate the other key.
                uniqueBinaryKeys.splice(uniqueBinaryKeys.indexOf(0), 1);
                // Check if 0 appears N/3 times and the other key appears 2N/3 times.
                if ((frequencyCounter.get(0) === totalElements / 3) &&
                    (frequencyCounter.get(uniqueBinaryKeys[0]) === ((2 * totalElements) / 3))) {
                    isConditionMet = true;
                } else {
                    isConditionMet = false; // Condition not met if counts don't match
                }
            } else {
                isConditionMet = false; // Condition not met if 0 is not one of the keys
            }
        } else if (distinctKeyCount === 1) {
            // If there is only one distinct binary key.
            if (uniqueBinaryKeys[0] === 0) {
                // If that single key is 0.
                isConditionMet = true;
            }
        }
    } else {
        // Case 2: totalElements is NOT divisible by 3.
        if (distinctKeyCount === 1) {
            // If there is only one distinct binary key.
            if (uniqueBinaryKeys[0] === 0) {
                // If that single key is 0.
                isConditionMet = true;
            }
        }
    }

    // Output the result based on the final flag value.
    if (isConditionMet) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
