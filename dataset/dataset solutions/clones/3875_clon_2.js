'use strict'; // Enforce strict parsing and error handling in the script.

/**
 * Processes the given raw input string to calculate a specific value.
 * This function simulates a scenario where a list of items (recipes)
 * and a query value are processed to determine a final count.
 *
 * @param {string} rawData The input string containing numbers separated by newlines or spaces.
 */
function processData(rawData) {
  // First, parse the input string into an array of integers.
  // The input is split by newlines or spaces, and each part is converted to a number.
  let parsedNumbers = rawData.split(/\n|\s/).map(numStr => ~~numStr);

  // The second element of the parsed input is considered the query value.
  const queryValue = parsedNumbers[1];

  // Extract a sub-array starting from the third element (index 2)
  // and then sort it in ascending order. This represents our list of items.
  const temporaryList = parsedNumbers.slice(2);
  const sortedItems = temporaryList.sort((firstElement, secondElement) => firstElement - secondElement);

  // Calculate the sum of all elements in the sorted list.
  const totalSum = sortedItems.reduce((accumulator, currentValue) => accumulator + currentValue);

  // Compute the final result based on the query value, the total sum,
  // the smallest item in the list, and the number of items.
  // The calculation involves integer division and addition.
  const finalResult = Math.floor((queryValue - totalSum) / sortedItems[0]) + sortedItems.length;

  // Output the computed final result to the console.
  console.log(finalResult);
}

// Read input from standard input and pass it to the processing function.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));
