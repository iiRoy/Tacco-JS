const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// Extract the total number of elements from the first line of input.
const numElements = Number(inputLines.shift());

// Extract the array of elements from the second line of input.
const elementArray = inputLines.shift().split(' ');

// Initialize an empty object to store key-value mappings.
const mappingObject = {};

// Initialize a counter for specific conditions.
let matchCount = 0;

// Iterate through the elements based on the specified count.
for (let idx = 0; idx < numElements; idx++) {
    // Convert the current array element to a numeric value.
    const currentValue = Number(elementArray[idx]);

    // Check if the current numeric value exists as a key in our mapping object.
    if (mappingObject[currentValue]) {
        // If the key exists, compare its associated value with the expected index.
        if (mappingObject[currentValue] === idx + 1) {
            // Increment the match counter if the values are identical.
            matchCount++;
        }
    } else {
        // If the current numeric value is not a key, add a new entry
        // using the next index as the key and the current value as its data.
        mappingObject[idx + 1] = currentValue;
    }
}

// Print the final accumulated count to standard output.
console.log(matchCount);
