const processSequence = (inputArray) => {
    // This array will store the lengths of non-increasing subsequences.
    const resultCollection = [];
    let currentStreak = 0; // Initialize a counter for the current streak.

    // Iterate through the input array, including an extra iteration to handle the last element's streak.
    for (let idx = 0; idx <= inputArray.length; idx++) {
        // Check if the current element is greater than or equal to the next element.
        // This condition defines a non-increasing sequence.
        if (inputArray[idx] >= inputArray[idx + 1]) {
            currentStreak++; // Increment the streak counter.
        } else {
            // If the sequence breaks (current element is smaller than the next),
            // store the accumulated streak length and reset the counter.
            resultCollection.push(currentStreak);
            currentStreak = 0; // Reset for the next potential streak.
        }
    }
    // Return the collection of streak lengths.
    return resultCollection;
};

// Read input from standard input, decode as UTF-8, and split by newline characters.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

// Parse the second line of input: split by space, then convert each part to a number.
const numericData = rawData[1].split(" ").map(itemValue => Number(itemValue));

// Call the processing function with the numeric data, then find the maximum value
// among the returned streak lengths, and print it to the console.
console.log(Math.max(...processSequence(numericData)));
