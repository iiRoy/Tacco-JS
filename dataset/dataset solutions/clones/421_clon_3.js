const fileSystem = require('fs');

// Helper function to parse a number from the input lines array
const parseNextNumber = (linesArray) => {
    // Using Number() is an explicit way to convert string to number,
    // equivalent to the original's `value - 0`.
    return Number(linesArray.shift());
};

// Helper function to determine the next search range in a binary search
const determineNextSearchRange = (currentValue, targetValue, middleIndex, currentLowIndex, currentHighIndex) => {
    if (targetValue < currentValue) {
        // Target is in the left half, so the new high index becomes the middle index (exclusive)
        return { newLow: currentLowIndex, newHigh: middleIndex };
    } else {
        // Target is in the right half, so the new low index becomes middleIndex + 1 (inclusive)
        return { newLow: middleIndex + 1, newHigh: currentHighIndex };
    }
};

function searchSortedArray(sortedArray, targetValue) {
    let lowIndex = 0;
    let highIndex = sortedArray.length; // highIndex is exclusive
    let iterationCount = 0;

    // The loop structure is preserved to match the exact iteration counting behavior
    while (true) {
        iterationCount++; // Increment count at the very beginning of each potential iteration
        if (lowIndex === highIndex) { // If the range is empty, break the loop
            break;
        }

        // Calculate the middle index
        const middleIndex = Math.floor((lowIndex + highIndex) / 2);
        // Get the value at the middle index for comparison
        const currentValue = sortedArray[middleIndex];

        if (currentValue === targetValue) {
            // If the target is found, return the current iteration count
            return iterationCount;
        }

        // Use the helper function to update the search range
        const { newLow, newHigh } = determineNextSearchRange(currentValue, targetValue, middleIndex, lowIndex, highIndex);
        lowIndex = newLow;
        highIndex = newHigh;
    }
    // If the loop finishes without finding the target, return the total iteration count
    return iterationCount;
}

// Read the entire input file
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
// Split the input into lines and trim whitespace
let inputLines = rawInputData.trim().split("\n");

// Process input lines in a loop until a zero is encountered
while (true) {
    const arraySize = parseNextNumber(inputLines); // Get the size of the next array
    if (arraySize === 0) { // If size is 0, terminate the processing loop
        break;
    }

    const currentArray = []; // Initialize an array to store the numbers
    // Populate the array with 'arraySize' numbers from the input
    for (let currentIdx = 0; currentIdx < arraySize; currentIdx++) {
        currentArray.push(parseNextNumber(inputLines));
    }

    // Get the target value for the binary search
    const targetValueForSearch = parseNextNumber(inputLines);
    // Perform the search and log the result
    console.log(searchSortedArray(currentArray, targetValueForSearch));
}
