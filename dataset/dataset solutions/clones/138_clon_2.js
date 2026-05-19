// This script processes input data from standard input, performing calculations and outputting results.
// It reads the entire content from standard input, processes it line by line (or by whitespace-separated chunks),
// and then performs a series of numerical operations on each chunk.
require("fs")
  .readFileSync("/dev/stdin", 'utf8') // Read the entire content from the standard input file descriptor as UTF-8 encoded text.
  .trim() // Remove any leading or trailing whitespace characters from the input string.
  .split(/\s/) // Split the cleaned input string into an array of substrings, using any whitespace character as a delimiter.
  .map(function (currentInputString) { // Iterate over each substring (representing a data record) in the array.
    // Declare local variables that will be used within this processing function for each record.
    let parsedValues; // This array will hold numerical values parsed from the current input string.
    let indexCounter; // A general-purpose counter, used for array indexing and determining the final output.
    let loopIterator; // An iterator specifically for controlling the first processing loop.
    let cumulativeSum; // A variable to accumulate sums and intermediate calculation results.

    // Split the current input string by commas to get individual data points, storing them in 'parsedValues'.
    parsedValues = currentInputString.split(',');

    // First processing loop: Initialize variables and calculate a running sum, modifying the 'parsedValues' array in place.
    for (
      indexCounter = loopIterator = cumulativeSum = 0; // Initialize 'indexCounter', 'loopIterator', and 'cumulativeSum' to zero.
      loopIterator < 10; // The loop continues as long as 'loopIterator' is less than 10 (i.e., for the first 10 elements).
      loopIterator++ // Increment 'loopIterator' after each iteration.
    ) {
      // Subtract the numeric value of the current element from 'cumulativeSum'.
      // Then, assign this new 'cumulativeSum' back to the current element in 'parsedValues'.
      parsedValues[loopIterator] = cumulativeSum -= parsedValues[loopIterator];
    }

    // Perform a specific calculation to update 'cumulativeSum' based on elements at indices 10 and 11.
    // This calculation involves division and negation.
    cumulativeSum *= parsedValues[10] / (-parsedValues[10] - parsedValues[11]);

    // Second processing loop: Find a specific index based on a comparison condition.
    // 'indexCounter' retains its value from the previous initialization (which is 0).
    for (
      ; // No initialization statement here, as 'indexCounter' is already set.
      parsedValues[indexCounter] > -cumulativeSum; // The loop continues as long as the value at 'indexCounter' is greater than the negative of 'cumulativeSum'.
      indexCounter++ // Increment 'indexCounter' after each iteration.
    );

    // Output the final incremented value of 'indexCounter' to the console.
    // The '++' operator increments 'indexCounter' before its value is passed to 'console.log'.
    console.log(++indexCounter);
  });
