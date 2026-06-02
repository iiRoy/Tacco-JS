var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var parsedLines = (rawData.trim()).split("\n"); // Split the raw data into an array of lines, removing leading/trailing whitespace

var firstArraySize = Number(parsedLines[0]); // Convert the first line to a number, representing the size of the first array
var targetNumbers = parsedLines[1].split(" ").map(Number); // Parse the second line into an array of numbers
var searchQueries = parsedLines[3].split(" ").map(Number); // Parse the fourth line into an array of numbers

/**
 * Performs a sequential scan to find a specific value within an array.
 * @param {number} valueToFind - The number to search for.
 * @param {number[]} collectionToScan - The array in which to search.
 * @returns {number} Returns 1 if the value is found, otherwise 0.
 */
const performSequentialScan = (valueToFind, collectionToScan) => {
  for (let idx = 0; idx < firstArraySize; idx++) { // Iterate through the collection up to the specified size
      if (collectionToScan[idx] === valueToFind) { // Check if the current element matches the value
          return 1; // Value found
      }
  }
  return 0; // Value not found
};

// For each query in searchQueries, perform a sequential scan on targetNumbers
// Then, sum up all the results (1 for found, 0 for not found)
console.log(searchQueries.map(currentQuery => performSequentialScan(currentQuery, targetNumbers)).reduce((accumulator, currentValue) => accumulator + currentValue, 0));
