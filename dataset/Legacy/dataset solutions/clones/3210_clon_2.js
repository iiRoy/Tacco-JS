"use strict";

/**
 * Processes raw input data to compute a specific minimum cost using dynamic programming.
 * @param {string} rawData - The complete input string received from standard input.
 */
function processInput(rawData) {
  // Split the entire input string into an array of individual lines.
  const lines = rawData.split("\n");
  // The first line contains the total number of elements, parsed as an integer.
  const count = Number(lines[0]);

  // Initialize an array to store the numeric values from the input.
  const numbersArray = [];
  // Iterate from the second line of input up to the 'count' to populate the numbers array.
  for (let idx = 0; idx < count; idx++) {
    numbersArray.push(Number(lines[idx + 1]));
  }

  // Declare and initialize a 2D array for dynamic programming.
  // It will have (count + 1) rows and 5 columns.
  const dynamicProgrammingTable = Array(count + 1).fill().map(() => Array(5).fill());
  // Set the base case for the DP table: the first row (index 0) is all zeros.
  dynamicProgrammingTable[0] = [0, 0, 0, 0, 0];

  // Iterate through each number to fill the DP table from the second row onwards.
  for (let idx = 1; idx <= count; idx++) {
    // Get the current number from the input array, adjusting for 0-based indexing.
    let currentValue = numbersArray[idx - 1];
    // Determine the "even cost": 2 if the number is 0, otherwise its remainder when divided by 2.
    let currentEvenCost = numbersArray[idx - 1] === 0 ? 2 : currentValue % 2;
    // Determine the "odd cost": (currentValue + 1) % 2.
    let currentOddCost = (currentValue + 1) % 2;

    // Calculate values for the current row of the DP table based on the previous row.
    // Column 0: Sum of previous column 0 and the current value.
    dynamicProgrammingTable[idx][0] = dynamicProgrammingTable[idx - 1][0] + currentValue;
    // Column 1: Minimum of previous column 0 and 1, plus the even cost.
    dynamicProgrammingTable[idx][1] = Math.min(dynamicProgrammingTable[idx - 1][0], dynamicProgrammingTable[idx - 1][1]) + currentEvenCost;
    // Column 2: Minimum of previous column 0, 1, and 2, plus the odd cost.
    dynamicProgrammingTable[idx][2] = Math.min(dynamicProgrammingTable[idx - 1][0], dynamicProgrammingTable[idx - 1][1], dynamicProgrammingTable[idx - 1][2]) + currentOddCost;
    // Column 3: Minimum of previous column 0, 1, 2, and 3, plus the even cost.
    dynamicProgrammingTable[idx][3] = Math.min(dynamicProgrammingTable[idx - 1][0], dynamicProgrammingTable[idx - 1][1], dynamicProgrammingTable[idx - 1][2], dynamicProgrammingTable[idx - 1][3]) + currentEvenCost;
    // Column 4: Minimum of all previous columns (0 through 4), plus the current value.
    dynamicProgrammingTable[idx][4] = Math.min(dynamicProgrammingTable[idx - 1][0], dynamicProgrammingTable[idx - 1][1], dynamicProgrammingTable[idx - 1][2], dynamicProgrammingTable[idx - 1][3], dynamicProgrammingTable[idx - 1][4]) + currentValue;
  }

  // Output the minimum value found in the last row of the dynamic programming table.
  console.log(Math.min(...dynamicProgrammingTable[count]));
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
