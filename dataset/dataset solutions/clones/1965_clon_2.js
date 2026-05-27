let rawData = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .split('\n'); // Obtain raw input data from standard input, decode as UTF-8, and segment by newline characters.

const numElements = parseInt(rawData[0], 10); // Convert the initial line of input into an integer, representing the total count of items.

// Establish an array to maintain frequency counts, initializing all entries to zero.
let frequencyTracker = new Array(numElements).fill(0);

// Process the subsequent line of input.
// This involves splitting the string by spaces, converting each segment to a numerical value,
// and then iterating through these numbers to update their respective frequencies.
rawData[1]
  .split(' ')
  .map(Number)
  .forEach(function(currentVal) {
    // Increment the frequency for the current numerical value,
    // adjusting for the zero-based indexing of the array.
    frequencyTracker[currentVal - 1]++;
  });

// Iterate through the accumulated frequency counts and display each one to the console.
frequencyTracker.forEach(function(freqValue) {
  console.log(freqValue);
});
