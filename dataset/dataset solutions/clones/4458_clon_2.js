/*
 * This module contains the primary logic to determine a specific numeric property.
 * It processes a single input value to find a number with the maximum even divisions.
 */
function ExecuteTask(rawData) {
  // Convert the raw string input into a numerical limit for iterations.
  const limitValue = Number(rawData);

  // Initialize the result pair.
  // The first element stores the number, the second stores its division count.
  // If limit is 1, start with [1, 0] as 1 cannot be divided by 2.
  // Otherwise, initialize with a default of [0, 0].
  let resultPair;
  if (limitValue === 1) {
    resultPair = [1, 0];
  }
  else {
    resultPair = [0, 0];
  }

  // Iterate from 1 up to the specified limit.
  for (let currentNum = 1; currentNum <= limitValue; currentNum++) {
    // Variable to hold the count of even divisions for the current number.
    let evenDivisions = 0;
    // Calculate how many times the current number can be divided by 2.
    evenDivisions = calculateEvenDivisions(currentNum, evenDivisions);

    // If the current number's division count is greater than the stored maximum,
    // update the result pair.
    if (resultPair[1] < evenDivisions) {
      resultPair = [currentNum, evenDivisions];
    }
  }

  /*
   * Recursively determines how many times a positive integer can be divided by 2.
   * @param {number} currentVal - The number to check.
   * @param {number} accumulatedDivs - The current count of divisions.
   * @returns {number} The total count of divisions by 2.
   */
  function calculateEvenDivisions(currentVal, accumulatedDivs) {
    // Check if the number is even.
    if (currentVal % 2 === 0) {
      // Increment the counter and recurse with half the number.
      accumulatedDivs++;
      return calculateEvenDivisions(currentVal / 2, accumulatedDivs);
    }
    else {
      // If odd, no more even divisions are possible; return the accumulated count.
      return accumulatedDivs;
    }
  }

  // Output the number from the best pair.
  console.log(resultPair[0]);
}

// Invoke the main processing function with data read from standard input.
ExecuteTask(require("fs").readFileSync("/dev/stdin", "utf8"));