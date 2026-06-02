'use strict'; // Enforce strict parsing and error handling for cleaner code.

// This section reads input data from standard input.
const inputData = require('fs') // Utilize the Node.js file system module.
  .readFileSync('/dev/stdin', 'utf8') // Synchronously read the entire file as a UTF-8 string.
  .split(/\s+/); // Split the string by one or more whitespace characters into an array of strings.

/**
 * Processes an array of string inputs to calculate a specific sum.
 * @param {string[]} dataArray - An array of string values representing numerical inputs.
 */
const processInput = (dataArray) => {
  // Convert string inputs to numbers and destructure them into individual variables.
  const [firstVal, secondVal, thirdVal, fourthVal] = dataArray.map(item => Number(item));

  // Determine the minimum cost for the first travel option (e.g., train).
  // If firstVal is less than secondVal, use firstVal; otherwise, use secondVal.
  const minTrainCost = firstVal < secondVal ? firstVal : secondVal;

  // Determine the minimum cost for the second travel option (e.g., bus).
  // If thirdVal is less than fourthVal, use thirdVal; otherwise, use fourthVal.
  const minBusCost = thirdVal < fourthVal ? thirdVal : fourthVal;

  // Calculate the total minimum cost by summing the two minimums.
  const finalResult = minTrainCost + minBusCost;

  // Output the computed final result to the console.
  console.log(finalResult);
};

// Invoke the main processing function with the collected input data.
processInput(inputData);
