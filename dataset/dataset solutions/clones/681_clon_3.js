const fileSystem = require('fs');
const inputSourcePath = '/dev/stdin';

// Read all raw data from the standard input file
const rawInputData = fileSystem.readFileSync(inputSourcePath, 'utf8');

// Split the input into an array of lines, trimming leading/trailing whitespace from the whole input
const dataLines = rawInputData.trim().split('\n');

// Initialize an index to keep track of the current line being processed
let linePointer = 0;

/**
 * Calculates the number of pairs within a sorted array whose sum exceeds a given threshold.
 * This function uses a two-pointer approach for efficient counting.
 *
 * @param {number[]} numericElements - An array of numbers, expected to be sorted in ascending order.
 * @param {number} sumThreshold - The target sum; pairs summing above this value are counted.
 * @returns {number} The total count of pairs (a, b) where a + b > sumThreshold and a != b.
 */
function determineOverThresholdPairs(numericElements, sumThreshold) {
    // A problem set with fewer than two elements cannot form any pairs.
    if (!numericElements || numericElements.length < 2) {
        return 0;
    }

    // Ensure the array is sorted. Although the main loop might sort it,
    // this ensures robustness if the function is called independently.
    // Using an arrow function for concise sorting.
    numericElements.sort((firstVal, secondVal) => firstVal - secondVal);

    let pairCounter = 0;
    const totalElementCount = numericElements.length;

    // Initialize two pointers: one at the beginning, one at the end of the array.
    let lowIndex = 0;
    let highIndex = totalElementCount - 1;

    // Continue as long as the low pointer is to the left of the high pointer
    while (lowIndex < highIndex) {
        // Calculate the sum of elements at the current pointers
        const currentSum = numericElements[lowIndex] + numericElements[highIndex];

        // If the current sum exceeds the threshold
        if (currentSum > sumThreshold) {
            // All elements from 'lowIndex' up to 'highIndex - 1' when paired with 'numericElements[highIndex]'
            // will also exceed the sumThreshold because the array is sorted.
            // The number of such pairs is 'highIndex - lowIndex'.
            pairCounter += (highIndex - lowIndex);
            // Move the high pointer inwards to try a smaller sum, as numericElements[highIndex] is too large
            // for numericElements[lowIndex] and potentially other smaller elements.
            highIndex--;
        } else {
            // If the current sum does not exceed the threshold, it means 'numericElements[lowIndex]'
            // is too small to form an exceeding pair with 'numericElements[highIndex]' (or any element to its left).
            // Move the low pointer inwards to try a larger sum.
            lowIndex++;
        }
    }

    return pairCounter;
}

// Main loop for processing multiple problem sets from the input.
// The loop continues indefinitely until a specific termination condition is met.
while (true) {
    // Check if there are enough lines left in the input buffer for configuration.
    if (linePointer >= dataLines.length) {
        // No more data to process, gracefully exit the loop.
        break;
    }

    // Read the configuration line for the current problem set (N and S)
    const currentConfigLine = dataLines[linePointer];
    linePointer++; // Advance the line pointer immediately after reading.

    // Split the config line by space to get N and S as strings.
    const configValuesStr = currentConfigLine.split(' ');

    // Basic validation for the config line format.
    if (configValuesStr.length < 2) {
        console.error(`Error: Malformed configuration line at index ${linePointer - 1}. Skipping.`);
        // To prevent infinite loops on bad input, consider breaking or skipping this problem set.
        // For this problem, we'll continue to the next iteration.
        continue;
    }

    // Parse N (number of elements) and S (target sum threshold) as integers.
    // Using parseInt with radix 10 for explicit base conversion.
    const numberOfElements = parseInt(configValuesStr[0], 10);
    const sumThresholdValue = parseInt(configValuesStr[1], 10);

    // The problem specifies that N=0 and S=0 signals the end of input.
    if (numberOfElements === 0 && sumThresholdValue === 0) {
        break; // Terminate the main processing loop.
    }

    const currentProblemElements = [];

    // Read the 'N' subsequent lines, each containing an element for the current problem.
    for (let elementIndex = 0; elementIndex < numberOfElements; elementIndex++) {
        // Guard against running out of input lines prematurely.
        if (linePointer >= dataLines.length) {
            console.error(`Error: Insufficient data lines for declared ${numberOfElements} elements. Problem set incomplete.`);
            // This is a critical error, so we should cease further processing.
            // By setting linePointer to length, subsequent checks will break the outer loop.
            linePointer = dataLines.length;
            break;
        }

        const elementValue = parseInt(dataLines[linePointer], 10);
        currentProblemElements.push(elementValue);
        linePointer++; // Advance the line pointer after processing an element line.
    }

    // If the number of elements read is less than declared, it indicates an input issue.
    // The outer loop should also terminate in such a scenario.
    if (currentProblemElements.length < numberOfElements) {
        break;
    }

    // Call the dedicated function to solve the current problem set.
    const calculatedPairCount = determineOverThresholdPairs(currentProblemElements, sumThresholdValue);

    // Output the result for the current problem set.
    console.log(calculatedPairCount);
}