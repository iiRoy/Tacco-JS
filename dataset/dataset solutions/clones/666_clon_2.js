let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input from the standard input stream

const numericData = rawData.trim().split("\n").map(Number); // Clean and parse the input into an array of numerical values

while (numericData.length !== 0) { // Iterate as long as there are elements remaining in our data collection
  let countVal = (numericData.shift()) / 4; // Extract the first value, divide by four, and store it as a counter

  if (countVal === 0) { // If the calculated counter is zero, it signals the end of processing
    break; // Exit the main processing loop
  }

  let totalAccumulator = 0; // Initialize a variable to accumulate sums for the current block

  while (countVal !== 0) { // Loop for the number of times specified by 'countVal'
    totalAccumulator += numericData.shift(); // Add the next numerical entry from the data collection to our accumulator
    countVal--; // Decrement the counter for this block
  }

  console.log(totalAccumulator); // Display the final accumulated sum for the current block
}
