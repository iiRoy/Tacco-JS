var inputLines = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .split("\n"); // Read input from standard input and split by newline

// Parse the first line as the number of elements
var countElements = parseInt(inputLines[0], 10);

// Process the second line: split by space, convert to integers, and sort in descending order
var sortedNumbers = inputLines[1]
  .split(" ")
  .map((elementString) => parseInt(elementString, 10))
  .sort((valA, valB) => valB - valA);

// Initialize variables for calculation
var totalValue = 0; // Accumulator for the sum
var currentIndex = 1; // Starting index for picking elements (second element)
var iterationCounter = 0; // Counter for how many elements have been processed

// Loop to sum specific elements
while (iterationCounter < countElements) {
  totalValue += sortedNumbers[currentIndex]; // Add the element at the current index to the total
  currentIndex += 2; // Move to the next element to pick (skip one)
  iterationCounter++; // Increment the counter for processed elements
}

// Output the final calculated sum to the console
console.log(totalValue);
