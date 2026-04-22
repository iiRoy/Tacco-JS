const fileHandler = require('fs'); // Import the Node.js file system module for input operations.

// Define constants for clarity and maintainability.
// The original code uses an array of size 100, implying indices from 0 to 99.
const MAXIMUM_SUPPORTED_VALUE = 99;
const FREQUENCY_ARRAY_CAPACITY = MAXIMUM_SUPPORTED_VALUE + 1; // Array size to hold counts for 0 to 99.

// Initialize an array to store the frequency of each integer.
// All elements are set to zero initially, as no numbers have been observed yet.
let numberOccurrenceCounts = new Array(FREQUENCY_ARRAY_CAPACITY).fill(0);

// This variable will store the highest frequency recorded for any number.
// It's initialized to zero because no numbers have been processed.
let highestObservedFrequency = 0;

try {
  // Read all content from standard input, interpret it as UTF-8 text,
  // and then split it into an array of strings, where each string is a line.
  const inputDataLines = fileHandler.readFileSync("/dev/stdin", "utf8").split('\n');

  // Iterate over each line obtained from the input.
  for (const currentInputLine of inputDataLines) {
    // Attempt to parse the line into an integer.
    // .trim() removes any leading/trailing whitespace which might affect parsing.
    const parsedNumericalValue = parseInt(currentInputLine.trim(), 10);

    // Validate the parsed value to ensure it's a valid, non-negative integer
    // within the expected range (0 to MAXIMUM_SUPPORTED_VALUE).
    if (!isNaN(parsedNumericalValue) && parsedNumericalValue >= 0 && parsedNumericalValue <= MAXIMUM_SUPPORTED_VALUE) {
      // Increment the count for the observed number.
      numberOccurrenceCounts[parsedNumericalValue]++;

      // After incrementing, check if this number's new frequency
      // surpasses the highest frequency observed so far.
      if (numberOccurrenceCounts[parsedNumericalValue] > highestObservedFrequency) {
        highestObservedFrequency = numberOccurrenceCounts[parsedNumericalValue];
      }
    }
    // Lines that are not valid numbers or are out of range are simply ignored,
    // which is consistent with the implicit behavior of the original code's `if(+i)`.
  }
} catch (error) {
  // In a real application, more robust error handling might be needed.
  // For this cloning exercise, we'll simply log a warning if input reading fails.
  console.error("Error reading input:", error.message);
  // If input reading fails, the program might proceed with empty or default counts.
}

// After processing all input, iterate through the frequency array
// to find and output the numbers that appeared with the highest frequency.
numberOccurrenceCounts.forEach((currentNumberFrequency, correspondingNumberIndex) => {
  // If a number's frequency matches the highest observed frequency,
  // it means this number is one of the most frequent.
  if (currentNumberFrequency === highestObservedFrequency) {
    console.log(correspondingNumberIndex);
  }
});