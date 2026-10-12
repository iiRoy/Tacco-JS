"use strict"; // Enforce strict mode for cleaner code execution.

// This section handles reading input from the standard input stream.
const dataLines = require("fs") // Import the Node.js file system module.
  .readFileSync("/dev/stdin", "utf8") // Read the entire content of stdin as a UTF-8 string.
  .split("\n"); // Split the content into an array of strings, one for each line.

// The first line of input is parsed as an integer, though it's not directly used in the core algorithm.
const countElements = parseInt(dataLines[0], 10); // Convert the first line to an integer (base 10).

// Process the second line of input to create a list of numbers.
const numberList = dataLines[1] // Access the second line of input, which contains space-separated numbers.
  .split(" ") // Split the line by spaces to get individual number strings.
  .map((itemValue) => parseInt(itemValue, 10)) // Convert each string item to an integer (base 10).
  .sort((firstNum, secondNum) => secondNum - firstNum); // Sort the numbers in descending order.

// This loop implements a variation of the Euclidean algorithm to find the greatest common divisor (GCD).
// It continues as long as there's at least a second element in the list.
while (numberList[1]) {
  // Calculate the remainder of the first element divided by the second element.
  numberList[0] = numberList[0] % numberList[1];

  // If the first element becomes zero, it means the second element was a divisor.
  // In this case, remove the zero element from the front of the list.
  if (numberList[0] === 0) {
    numberList.shift(); // Remove the first element (which is now 0).
  } else {
    // If the first element is not zero, re-sort the list to maintain descending order.
    // This ensures the largest remaining number is at index 0 and the next largest at index 1 for the next iteration.
    numberList.sort((firstNum, secondNum) => secondNum - firstNum);
  }
}

// After the loop completes, the only remaining element in the list is the greatest common divisor of the original numbers.
console.log(numberList[0]); // Output the final result to standard output.
