'use strict';

// Primary function to handle incoming data
function ProcessData(rawData) {
  // Break down the raw input string using any whitespace as a delimiter
  let parsedValues = rawData.split(/\s+/);
  // Convert each segment of the parsed data into an integer value
  for (let idx = 0; idx < parsedValues.length; idx++) {
    parsedValues[idx] = Number.parseInt(parsedValues[idx], 10);
  }

  // Extract the target numerical sum and the count of digit options from the processed array
  let TargetValue = parsedValues.shift();
  let NumOptions = parsedValues.shift();

  // This array is declared for structural consistency but is not actively used in the algorithm.
  let DigitCountsArray = [false, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // Defines the cost (e.g., number of segments on a display) for each digit from 1 to 9.
  // Index 0 is unused; index `d` holds the cost for digit `d`.
  let DigitCosts = [false, 2, 5, 5, 4, 5, 6, 3, 7, 6];

  // A mapping from a specific cost value to the largest digit that incurs that cost.
  // Initialized to signify no digit is mapped to a cost yet.
  let CostToDigitMap = [false, false, 0, 0, 0, 0, 0, 0];

  // Populate the CostToDigitMap based on the available digit options provided in the input.
  for (let idx = 0; idx < NumOptions; idx++) {
    let currentDigit = parsedValues[idx];
    let currentCost = DigitCosts[parsedValues[idx]];
    // If the current digit is numerically larger than any digit previously recorded for this cost,
    // update the mapping to prefer the larger digit.
    if (currentDigit > CostToDigitMap[currentCost]) {
      CostToDigitMap[currentCost] = currentDigit;
    }
  }

  // Refine the CostToDigitMap: replace any remaining zero entries (where no digit was mapped) with 'false'.
  // This helps in later checks for valid cost-to-digit mappings.
  for (let idx = 2; idx < 8; idx++) {
    if (CostToDigitMap[idx] === 0) {
      CostToDigitMap[idx] = false;
    }
  }

  // Dynamic programming table to store the optimal combination of digits for each possible sum.
  // Each entry `memoTable[s]` represents a state: [isValidBoolean, 'count_1s_str', ..., 'count_9s_str'].
  let memoTable = [];
  // Base case: A sum of 0 is achievable with no digits. The state is valid, and all digit counts are empty strings.
  memoTable[0] = [true, '', '', '', '', '', '', '', '', ''];

  let currentSum = 1;
  // Iterate through all possible sums from 1 up to the TargetValue.
  while (currentSum < TargetValue + 1) {
    // For each `currentSum`, attempt to form it by adding a digit (with its cost) to a previous sum.
    for (let costIndex = 1; costIndex < 10; costIndex++) {
      // Check if the previous sum (`currentSum - costIndex`) is valid and if a digit exists for `costIndex`.
      if (memoTable[currentSum - costIndex] && memoTable[currentSum - costIndex][0] && CostToDigitMap[costIndex]) {
        // Create a new candidate state by copying the previous valid state.
        let candidateState = memoTable[currentSum - costIndex].slice();
        let mappedDigit = CostToDigitMap[costIndex]; // Retrieve the digit associated with `costIndex`.

        // Append the `mappedDigit` to its corresponding string in the candidate state.
        // This effectively counts how many times each digit is used.
        candidateState[mappedDigit] = memoTable[currentSum - costIndex][mappedDigit] + mappedDigit;

        // Compare the `candidateState` with the current best state for `currentSum` and update if better.
        memoTable[currentSum] = compareAndSelect(memoTable[currentSum], candidateState);
      }
    }
    currentSum++;
  }

  // Assemble the final result string from the optimal state for the `TargetValue`.
  let finalResultString = '';
  // Digits are appended in reverse order (from 9 down to 1) to form the largest number.
  for (let idx = 1; idx < 10; idx++) {
    finalResultString = memoTable[TargetValue][idx] + finalResultString;
  }
  // Output the constructed largest number string.
  console.log(finalResultString);
}

// Utility function to compare two DP states (arrays of digit counts) and return the "better" one.
// "Better" is defined by:
// 1. More total digits (indicated by a longer concatenated string of digit counts).
// 2. If total digit counts are equal, then by lexicographically larger number (more higher-value digits).
function compareAndSelect(stateOne, stateTwo) {
  // If the first state is undefined (meaning no valid state has been found yet for this sum),
  // then the second state is automatically considered better.
  if (stateOne === undefined) {
    return stateTwo;
  }

  // Compare the total number of digits. A longer concatenated string implies more digits.
  // A number with more digits is generally larger.
  if (stateOne.join('').length > stateTwo.join('').length) {
    return stateOne;
  }
  if (stateOne.join('').length < stateTwo.join('').length) {
    return stateTwo;
  }

  // If the total number of digits is the same, compare the states digit by digit,
  // starting from the highest digit (9) down to the lowest (1).
  // The state with more occurrences of a higher digit is preferred.
  for (let digitValue = 9; digitValue > 0; digitValue--) {
    if (stateOne[digitValue].length > stateTwo[digitValue].length) {
      return stateOne;
    }
    if (stateOne[digitValue].length < stateTwo[digitValue].length) {
      return stateTwo;
    }
  }
  // If all digit counts are identical, return the first state as an arbitrary tie-breaker.
  return stateOne;
}

// Read the input from standard input and pass it to the main processing function.
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));