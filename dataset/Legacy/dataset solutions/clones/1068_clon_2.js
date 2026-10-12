const inputLines = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

/**
 * Performs a counting sort on an array of non-negative integers.
 * This function assumes input numbers are non-negative.
 *
 * @param {number[]} inputArray The array of numbers to be sorted.
 * @returns {number[]} A new array containing the sorted numbers.
 */
const performCountingSort = (inputArray) => {
    // Determine the largest value in the input array.
    // This value 'maxValue' defines the range for our counting array.
    // If 'inputArray' is empty, this 'reduce' call will throw a TypeError,
    // which matches the behavior of the original code.
    const maxValue = inputArray.reduce((currentMax, elementValue) => currentMax < elementValue ? elementValue : currentMax);

    // Initialize a 'countArray' with zeros. Its size is 'maxValue + 1'
    // to accommodate numbers from 0 up to 'maxValue' inclusive.
    const countArray = [...Array(maxValue + 1)].map(_unused => 0);

    // Create an empty array 'sortedOutput' of the same length as 'inputArray'.
    // This will store the sorted elements.
    const sortedOutput = [...Array(inputArray.length)];

    // First pass: Populate the 'countArray'.
    // For each number in 'inputArray', increment its corresponding count in 'countArray'.
    for (let idx = 0; idx < inputArray.length; idx++) {
        countArray[inputArray[idx]]++;
    }

    // Second pass: Modify 'countArray' to store cumulative counts.
    // Each element 'countArray[idx]' will now represent the total number of elements
    // less than or equal to 'idx' in the original 'inputArray'.
    for (let idx = 1; idx <= maxValue; idx++) {
        countArray[idx] += countArray[idx - 1];
    }

    // Third pass: Build the 'sortedOutput' array.
    // Iterate through 'inputArray' in reverse to ensure stability (preserve relative order of equal elements).
    for (let idx = inputArray.length - 1; idx >= 0; idx--) {
        // Place the current element 'inputArray[idx]' into its correct sorted position.
        // The position is determined by 'countArray[inputArray[idx]] - 1'.
        sortedOutput[countArray[inputArray[idx]] - 1] = inputArray[idx];
        // Decrement the count for this element to correctly place subsequent identical elements.
        countArray[inputArray[idx]]--;
    }

    // Return the array containing the sorted numbers.
    return sortedOutput;
};

// Read the second line of input (index 1), split it by spaces, and convert each part to a number.
// This assumes the first line might contain metadata (like array size) which is not used here.
const numericData = inputLines[1].split(' ').map(Number);

// Apply the counting sort to the 'numericData' and then join the sorted numbers with spaces
// before printing the final result to the console.
console.log(performCountingSort(numericData).join(' '));
