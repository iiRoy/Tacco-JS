'use strict'; // Enforce strict mode for cleaner code execution

// This function serves as the primary entry point, processing raw input data
// to determine the largest possible number that can be constructed under given constraints.
function ProcessInput(rawInputData) {
  // First, the raw string input is split by any whitespace characters,
  // and each resulting substring is converted into an integer.
  let parsedValues = rawInputData.split(/\s+/).map(val => parseInt(val, 10));

  // The first two numbers in the parsed input represent the target total cost (N)
  // and the count of available digit types (M), respectively.
  const targetValue = parsedValues.shift();
  const numAvailableDigits = parsedValues.shift();

  // This array is initialized but remains unused throughout the program's execution.
  // It might be a remnant from a previous design or a placeholder.
  const digitOccurrenceTracker = [null, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // A constant mapping where the index represents a digit (1-9) and its value
  // is the corresponding cost to use that digit. Index 0 is intentionally null.
  const digitToCostMapping = [null, 2, 5, 5, 4, 5, 6, 3, 7, 6];

  // An array designed to store, for each possible cost, the largest digit that incurs that cost.
  // Initialized with nulls for unused indices and zeros for potential costs.
  let costToMaxDigit = [null, null, 0, 0, 0, 0, 0, 0];

  // Iterate through the list of available digits provided in the input.
  // The goal is to populate `costToMaxDigit` such that for any given cost,
  // it holds the highest digit that can be formed with that cost.
  for (let k = 0; k < numAvailableDigits; k++) {
    const currentDigitValue = parsedValues[k]; // The actual digit (e.g., 1, 5, 9)
    const currentDigitCost = digitToCostMapping[currentDigitValue]; // The cost associated with this digit

    // If the current digit is numerically larger than any digit previously recorded
    // for the same cost, update the entry in `costToMaxDigit`.
    if (currentDigitValue > costToMaxDigit[currentDigitCost]) {
      costToMaxDigit[currentDigitCost] = currentDigitValue;
    }
  }

  // After processing all available digits, iterate through the relevant cost range (2 to 7).
  // If an entry in `costToMaxDigit` is still 0, it means no digit was found for that cost.
  // In such cases, replace 0 with `null` to explicitly mark it as unavailable.
  for (let k = 2; k < 8; k++) {
    if (costToMaxDigit[k] === 0) {
      costToMaxDigit[k] = null;
    }
  }

  // Initialize the dynamic programming table. `dynamicProgrammingTable[i]` will store
  // the optimal (largest) number that can be formed with a total cost of `i`.
  // Each entry is an array: `[isReachable, count_of_1s_str, ..., count_of_9s_str]`.
  // `isReachable` is a boolean flag, and `count_of_X_str` is a string of 'X's (e.g., "222").
  const dynamicProgrammingTable = [];

  // Base case: A total cost of 0 is achievable by using no digits.
  // The `true` flag indicates reachability, and all digit count strings are empty.
  dynamicProgrammingTable[0] = [true, "", "", "", "", "", "", "", "", ""];

  // Populate the DP table from a total cost of 1 up to the `targetValue`.
  for (let currentSumIndex = 1; currentSumIndex <= targetValue; currentSumIndex++) {
    // For each `currentSumIndex`, iterate through all possible costs that a single digit can have.
    // The loop covers costs from 1 to 9, though actual digit costs are 2-7.
    // `costToMaxDigit[costIndex]` will be `null` for costs outside the 2-7 range.
    for (let costIndex = 1; costIndex < 10; costIndex++) {
      // Check three conditions:
      // 1. If the previous state (`currentSumIndex - costIndex`) is valid (exists).
      // 2. If the previous state is reachable (its `isReachable` flag is true).
      // 3. If there is a digit available for the current `costIndex`.
      if (dynamicProgrammingTable[currentSumIndex - costIndex] &&
          dynamicProgrammingTable[currentSumIndex - costIndex][0] &&
          costToMaxDigit[costIndex]) {

        // Create a potential new solution by making a shallow copy of the previous state.
        let potentialSolution = dynamicProgrammingTable[currentSumIndex - costIndex].slice();
        const digitForAddition = costToMaxDigit[costIndex]; // The specific digit to add (e.g., 7)

        // Append the `digitForAddition` to its corresponding count string within the `potentialSolution`.
        // This effectively "adds" one more instance of that digit.
        potentialSolution[digitForAddition] = dynamicProgrammingTable[currentSumIndex - costIndex][digitForAddition] + digitForAddition;

        // The following line is a commented-out debug statement from the original code.
        // // console.log(`Current sum ${currentSumIndex}: ${potentialSolution}`);

        // Compare the `potentialSolution` with the current best solution stored for `currentSumIndex`.
        // Update `dynamicProgrammingTable[currentSumIndex]` if `potentialSolution` is "larger".
        dynamicProgrammingTable[currentSumIndex] = determineGreaterSolution(
          dynamicProgrammingTable[currentSumIndex],
          potentialSolution
        );
      }
    }
  }

  // After the DP table is fully populated, construct the final result string.
  // Digits are concatenated in descending order (9 down to 1) to form the largest number.
  let finalResultString = "";
  for (let digitComparator = 1; digitComparator < 10; digitComparator++) {
    finalResultString = dynamicProgrammingTable[targetValue][digitComparator] + finalResultString;
  }

  // Output the final computed largest number to the console.
  console.log(finalResultString);
}

// This helper function compares two candidate solutions (arrays from the DP table)
// and returns the one that represents a "larger" numerical value.
// The comparison logic prioritizes numbers with more digits, then higher leading digits.
function determineGreaterSolution(firstSolution, secondSolution) {
  // If the `firstSolution` is undefined (meaning no solution has been found yet for this cost),
  // then `secondSolution` is considered the greater one by default.
  if (firstSolution === undefined) return secondSolution;

  // Calculate the total number of digits for each solution.
  // This is done by joining all array elements into a single string and taking its length.
  // Since the array structure (boolean flag + 9 digit strings) is consistent,
  // this effectively compares the sum of lengths of the digit strings, which is the total digit count.
  const lengthA = firstSolution.join("").length;
  const lengthB = secondSolution.join("").length;

  // If one solution has a greater total number of digits, it is numerically larger.
  if (lengthA > lengthB) return firstSolution;
  if (lengthA < lengthB) return secondSolution;

  // If the total number of digits is identical, perform a lexicographical comparison
  // by checking digit counts from the most significant digit (9) down to the least (1).
  for (let digitComparator = 9; digitComparator > 0; digitComparator--) {
    // Compare the count (length of the string) of the current digit.
    // The solution with more occurrences of a higher digit is considered larger.
    if (firstSolution[digitComparator].length > secondSolution[digitComparator].length) return firstSolution;
    if (firstSolution[digitComparator].length < secondSolution[digitComparator].length) return secondSolution;
  }

  // If all digit counts are identical, both solutions represent the same numerical value.
  // In this scenario, either solution can be returned; we default to the first one.
  return firstSolution;
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the `ProcessInput` function to begin execution.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
