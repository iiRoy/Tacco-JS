const rawData = require("fs").readFileSync("/dev/stdin", "utf8"); // Read all input data from standard input
const dataRows = rawData.split('\n'); // Split the input into an array of lines

// Parse the first line to get the number of items (N) and the range offset (K)
let [numItems, rangeOffset] = dataRows[0].split(' ').map(Number);

// Initialize a dynamic programming array with a fixed size, filled with zeros.
// This array will store the maximum achievable value for each index.
let dynamicProgression = Array(300001).fill(0);

// Iterate through each item from 1 to N (inclusive)
for (let idx = 1; idx <= numItems; idx++) {
    // Convert the current line's value to a number
    const currentValue = Number(dataRows[idx]);

    // Calculate the value to propagate: 1 plus the current max at 'currentValue'
    const calculatedValue = dynamicProgression[currentValue] + 1;

    // Determine the lower bound for the update range, ensuring it's not less than 0
    const lowerBound = Math.max(0, currentValue - rangeOffset);

    // Determine the upper bound for the update range
    const upperBound = currentValue + rangeOffset;

    // Update the dynamic programming array within the calculated range
    // For each index 'subIdx' in the range [lowerBound, upperBound],
    // set its value to the maximum of its current value and 'calculatedValue'.
    for (let subIdx = lowerBound; subIdx <= upperBound; subIdx++) {
        dynamicProgression[subIdx] = Math.max(calculatedValue, dynamicProgression[subIdx]);
    }
}

// Find the maximum value in the entire dynamic programming array
// and print it to the console.
console.log(dynamicProgression.reduce((accumulator, currentElement) => Math.max(accumulator, currentElement)));
