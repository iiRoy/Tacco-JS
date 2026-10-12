const rawData = require("fs")
  .readFileSync("/dev/stdin", "utf8"); // Obtain all input data from the standard input stream.

const numericStrings = rawData.split(' '); // Divide the acquired data into an array of string representations of numbers.

let totalValue = 0; // Declare and initialize a variable to store the cumulative sum.

// Iterate through each string element in the array.
numericStrings.forEach((currentStr) => {
  totalValue += Number(currentStr); // Convert the current string to a numerical type and add it to the running total.
});

// Compute the average of the numbers, round it up to the nearest integer, and then display the result.
console.log(Math.ceil(totalValue / numericStrings.length));
