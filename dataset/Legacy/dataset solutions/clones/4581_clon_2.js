const printToConsole = console.log;

/*
 * Reads input from standard input, processes it, and then prints a specific element.
 * This script expects input in a particular format:
 * - The first line contains two space-separated numbers: N and K.
 * - Subsequent lines each contain two space-separated numbers: 'a' and 'b'.
 * For each 'a' and 'b', 'a' is repeated 'b' times and added to a list.
 * Finally, the element at index K-1 (0-based) of the expanded list is printed.
 */
let inputData = require("fs").readFileSync("/dev/stdin", "UTF-8");
let inputRows = inputData
  .split("\n")
  .filter(item => item !== "")
  .map(item => item.split(" "));

// Extract N and K from the first line of input
const firstVal = inputRows[0][0]; // N is not actually used in the logic, but it's read.
const targetIndex = inputRows[0][1];

// Remove the first line as it's already processed
inputRows = inputRows.slice(1);

// Initialize an empty array to store the expanded list of numbers
let expandedList = [];

// Iterate over the remaining input rows
inputRows.forEach(currentRow => {
  // Parse the two numbers from the current row
  const elementValue = Number(currentRow[0]);
  const repeatCount = Number(currentRow[1]);

  // Create a new array segment by repeating 'elementValue' 'repeatCount' times
  const generatedSegment = Array(repeatCount).fill(elementValue);

  // Add the generated segment to the main expanded list
  expandedList.push(...generatedSegment);
});

// The original code had a commented-out sort, which is not executed.
// expandedList.sort((val1, val2) => val1 - val2);

// Print the element at the (targetIndex - 1) position (0-based index)
printToConsole(expandedList[targetIndex - 1]);
