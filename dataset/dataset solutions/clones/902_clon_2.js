const fileSysModule = require('fs'); // Core module for file system operations

const standardInputPath = '/dev/stdin';     // Path to read input from
const textEncoding = 'utf8';                // Character encoding for file reading
const newlineSeparator = "\n";              // Delimiter for splitting lines
const spaceDelimiter = " ";                 // Delimiter for splitting numbers/strings
const initialFillValue = -1;                // Default value for array initialization
const maxDataElements = 1000000;            // Maximum size for the cumulative sum array
const largeNumberDivisor = 1000000000;      // Threshold for splitting large sums (1 billion)
const resultYes = "Yes";                    // String constant for positive outcome
const resultNo = "No";                      // String constant for negative outcome
const nineDigitsCount = 9;                  // Number of digits for the low-part of large numbers

// Read all input content synchronously from the specified path
let rawInputContent = fileSysModule.readFileSync(standardInputPath, textEncoding);

// Process the raw input: remove whitespace, then split into individual lines
let processedLines = rawInputContent.trim().split(newlineSeparator);

// Discard the very first line of the input
processedLines.shift();

// Extract the primary sequence of integers, parse them, and sort in ascending order
let primaryNumberSet = processedLines.shift().split(spaceDelimiter).map(val => parseInt(val, 10));
primaryNumberSet.sort((firstVal, secondVal) => firstVal - secondVal);

// Discard another line from the input
processedLines.shift();

// Extract the secondary sequence of integers, parsing them from string format
let secondaryNumberSet = processedLines.shift().split(spaceDelimiter).map(val => parseInt(val, 10));

// Extract the sequence of string representations for comparison
let stringComparators = processedLines.shift().split(spaceDelimiter);

// Initialize a large array to store cumulative sums, filling it with a default marker value
let cumulativeValueTracker = new Array(maxDataElements);
for (let arrayIndex = 0; arrayIndex < maxDataElements; arrayIndex++) {
  cumulativeValueTracker[arrayIndex] = initialFillValue;
}

// Set the base case for the cumulative sum at index zero
cumulativeValueTracker[0] = [0, 0];

// Initialize a two-part variable to hold the current accumulated sum (high_part, low_part)
let currentRunningSum = [0, 0];

/*
 * Iterate through each number in the primary set to calculate and store cumulative sums.
 * The sum is managed in two parts to handle values exceeding standard integer limits.
 */
primaryNumberSet.forEach(function (currentNum) {
  currentRunningSum[1] += currentNum; // Add current number to the low part

  // If the low part exceeds the threshold, increment the high part and adjust the low part
  if (currentRunningSum[1] >= largeNumberDivisor) {
    currentRunningSum[0]++;
    currentRunningSum[1] -= largeNumberDivisor;
  }
  // Store a snapshot (copy) of the current running sum at the index corresponding to currentNum
  cumulativeValueTracker[currentNum] = currentRunningSum.slice();
});

/*
 * Process each element in the secondary number set. For each element,
 * determine a comparison value and output a "Yes" or "No" result.
 */
secondaryNumberSet.forEach(function (searchTarget, outputIndex) {
  // Find the largest available index less than or equal to searchTarget that has a valid sum
  while (true) {
    if (cumulativeValueTracker[searchTarget] !== initialFillValue) {
      break; // Found a valid sum, exit loop
    }
    searchTarget--; // Decrement search target to find a preceding valid sum
  }

  // Retrieve the corresponding string representation for the current comparison
  let targetStringValue = stringComparators[outputIndex];

  /*
   * Convert the string representation into a two-part large number ([high_part, low_part]).
   * The last nine digits form the low part, and the remainder forms the high part.
   */
  let parsedLargeValue = [
    parseInt(targetStringValue.substring(0, targetStringValue.length - nineDigitsCount), 10) || 0,
    parseInt(targetStringValue.substring(targetStringValue.length - nineDigitsCount), 10) || 0
  ];

  let finalComparisonOutcome = ""; // Variable to store the comparison result

  // Perform the comparison between the parsed large value and the stored cumulative sum
  if (parsedLargeValue[0] < cumulativeValueTracker[searchTarget][0]) {
    finalComparisonOutcome = resultYes;
  } else if (parsedLargeValue[0] === cumulativeValueTracker[searchTarget][0] && parsedLargeValue[1] <= cumulativeValueTracker[searchTarget][1]) {
    finalComparisonOutcome = resultYes;
  } else {
    finalComparisonOutcome = resultNo;
  }

  // Print the determined outcome to the console
  console.log(finalComparisonOutcome);
});