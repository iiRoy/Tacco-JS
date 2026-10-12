const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

// Parse the total number of elements from the first line
const totalCount = +inputLines[0];

// Parse the array of numbers from the second line
const numericValues = inputLines[1].split(' ').map(itemStr => +itemStr);

// Initialize a storage object to keep track of frequencies
const valueFrequency = {};

// Iterate through the numeric values to populate the frequency map
numericValues.forEach((currentNum, currentIndex) => {
    // Calculate the key based on the problem's condition (Ai + i + 1)
    const currentKey = currentNum + currentIndex + 1;
    if (!valueFrequency[currentKey]) {
        // If the key doesn't exist, initialize its count to 1
        valueFrequency[currentKey] = 1;
    } else {
        // Otherwise, increment the existing count
        valueFrequency[currentKey]++;
    }
});

// Initialize a variable to store the final sum
let finalTally = 0;

// Iterate through the numeric values again to find pairs
numericValues.forEach((elementNum, elementIndex) => {
    // Calculate the target key for the second part of the condition (k - Ak + 1)
    const targetKey = elementIndex + 1 - elementNum;
    if (valueFrequency[targetKey]) {
        // If a matching key exists in the frequency map, add its count to the tally
        finalTally += valueFrequency[targetKey];
    }
});

// Output the final calculated tally
console.log(finalTally);
