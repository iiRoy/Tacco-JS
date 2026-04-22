// This module contains a single function to handle data processing.
function processData(rawData) {
  // First, we split the incoming raw string by newline characters
  // to obtain an array where each element represents a line of input.
  const inputLines = rawData.split("\n");

  // The first line typically holds the count of subsequent items.
  let itemCount = inputLines[0];

  // The second line contains the actual numerical elements, space-separated.
  const numericalString = inputLines[1];

  // We then parse this string of numbers into an array of string values.
  const numericalArray = numericalString.split(" ");

  // For initial verification or debugging, log the first two elements.
  console.log(numericalArray[0]);
  console.log(numericalArray[1]);

  // Initialize a mutable variable to accumulate the sum of reciprocals.
  let inverseTotal = 0;

  // We iterate through each element based on the 'itemCount' from the first line.
  for (let currentIdx = 0; currentIdx < itemCount; currentIdx++) {
    // For each element, calculate its reciprocal and add it to our running total.
    inverseTotal = inverseTotal + (1 / numericalArray[currentIdx]);
  }

  // Finally, compute and display the reciprocal of the accumulated inverse total.
  console.log(1 / inverseTotal);
}

// Execute the data processing by reading content from standard input.
// The 'fs' module is used to read the file synchronously, and 'utf8' specifies the encoding.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));