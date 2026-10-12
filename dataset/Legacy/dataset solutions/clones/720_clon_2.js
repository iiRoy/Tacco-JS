var allNums, oddNums;

/**
 * Computes combinations for all numbers up to a limit.
 * Stores results in a dynamic programming table.
 * @param {number} limitVal - The upper bound for number generation.
 * @param {Array<Array<number>>} dynamicProgressionAll - The DP table to populate.
 * @returns {number} The count of generated numbers.
 */
function calculateAllCombinations(limitVal, dynamicProgressionAll) {
  // Initialize counters and sequence terms
  let countAll = 0;
  let currentTerm = 1;
  let termIncrement = 1;
  let incrementStep = 1;

  // Initialize the global array for all numbers
  allNums = [];
  allNums.push(0); // Placeholder for 0th index

  // Generate the sequence of numbers (triangular numbers of triangular numbers)
  while (currentTerm <= limitVal) {
    countAll++;
    allNums.push(currentTerm);
    incrementStep++;
    termIncrement += incrementStep;
    currentTerm += termIncrement;
  }

  // Initialize the first row of the DP table
  dynamicProgressionAll[0] = [];
  dynamicProgressionAll[0][0] = 0;

  // Fill the first row with a large value (representing infinity)
  for (let target = 1; target <= limitVal; target++) {
    dynamicProgressionAll[0][target] = 1000000000; // A sufficiently large number
  }

  // Populate the DP table
  for (let idx = 1; idx <= countAll; idx++) {
    // Memory optimization: discard previous rows if no longer needed
    if (idx > 2) {
      dynamicProgressionAll[idx - 2] = null;
    }
    dynamicProgressionAll[idx] = []; // Initialize current row

    for (let target = 0; target <= limitVal; target++) {
      if (target < allNums[idx]) {
        // If current number is too large, inherit value from previous row
        dynamicProgressionAll[idx][target] = dynamicProgressionAll[idx - 1][target];
      } else {
        // Choose minimum: either don't use current number, or use it and add 1
        dynamicProgressionAll[idx][target] = Math.min(
          dynamicProgressionAll[idx - 1][target],
          dynamicProgressionAll[idx][target - allNums[idx]] + 1
        );
      }
    }
  }

  return countAll; // Return the total count of generated numbers
}

/**
 * Computes combinations for odd numbers up to a limit.
 * Stores results in a dynamic programming table.
 * @param {number} upperBound - The maximum value to consider.
 * @param {Array<Array<number>>} dynamicProgressionOdd - The DP table for odd numbers.
 * @returns {number} The count of generated odd numbers.
 */
function calculateOddCombinations(upperBound, dynamicProgressionOdd) {
  // Initialize counters and sequence terms
  let oddCount = 0;
  let currentValue = 1;
  let valueAdder = 1;
  let adderStep = 1;

  // Initialize the global array for odd numbers
  oddNums = [];
  oddNums.push(0); // Placeholder for 0th index

  // Generate the sequence, but only store odd numbers
  while (currentValue <= upperBound) {
    if (currentValue % 2 !== 0) {
      oddCount++;
      oddNums.push(currentValue);
    }
    adderStep++;
    valueAdder += adderStep;
    currentValue += valueAdder;
  }

  // Initialize the first row of the DP table for odd numbers
  dynamicProgressionOdd[0] = [];
  dynamicProgressionOdd[0][0] = 0;

  // Fill the first row with a large value
  for (let sumTarget = 1; sumTarget <= upperBound; sumTarget++) {
    dynamicProgressionOdd[0][sumTarget] = 1000000000;
  }

  // Populate the DP table for odd numbers
  for (let index = 1; index <= oddCount; index++) {
    // Memory optimization: discard previous rows if no longer needed
    if (index > 2) {
      dynamicProgressionOdd[index - 2] = null;
    }
    dynamicProgressionOdd[index] = []; // Initialize current row

    for (let sumTarget = 0; sumTarget <= upperBound; sumTarget++) {
      if (sumTarget < oddNums[index]) {
        // If current odd number is too large, inherit value from previous row
        dynamicProgressionOdd[index][sumTarget] = dynamicProgressionOdd[index - 1][sumTarget];
      } else {
        // Choose minimum: either don't use current odd number, or use it and add 1
        dynamicProgressionOdd[index][sumTarget] = Math.min(
          dynamicProgressionOdd[index - 1][sumTarget],
          dynamicProgressionOdd[index][sumTarget - oddNums[index]] + 1
        );
      }
    }
  }

  return oddCount; // Return the total count of generated odd numbers
}

/**
 * Main function to process input and output results.
 * @param {string} rawData - The raw input string from stdin.
 */
function processInputData(rawData) {
  const inputLines = rawData.split("\n"); // Split input into lines

  const dpTableOne = []; // DP table for all numbers
  const dpTableTwo = []; // DP table for odd numbers

  // Pre-calculate DP tables up to 1,000,000
  const maxIdxOne = calculateAllCombinations(1000000, dpTableOne);
  const maxIdxTwo = calculateOddCombinations(1000000, dpTableTwo);

  // Process each input number until a 0 is encountered
  for (let lineIndex = 0; ; lineIndex++) {
    const currentNum = parseInt(inputLines[lineIndex], 10); // Parse current line as integer

    if (currentNum === 0) {
      break; // Exit loop if input is 0
    }

    // Retrieve results from the pre-calculated DP tables
    const resultOne = dpTableOne[maxIdxOne][currentNum];
    const resultTwo = dpTableTwo[maxIdxTwo][currentNum];

    // Output the results
    console.log(resultOne, resultTwo);
  }
}

// Read input from standard input and pass it to the main processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
