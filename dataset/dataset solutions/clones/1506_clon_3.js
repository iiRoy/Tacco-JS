"use strict";

// This function processes raw string data to determine if a specific pattern of consecutive matches occurs.
// It looks for a streak of three or more lines where the first two space-separated components are identical.
function analyzeInputPattern(sourceData) {
  // Input validation: Ensure the provided sourceData is a non-empty string.
  if (typeof sourceData !== 'string' || sourceData.trim().length === 0) {
    // If input is invalid or empty, we cannot find the pattern, so return "No".
    return "No";
  }

  // Step 1: Pre-process the raw input string.
  // Remove any leading/trailing whitespace from the entire block of text,
  // then split it into an array of individual lines.
  const processedLines = sourceData.trim().split("\n");

  // Further validation: Ensure there's at least one line after processing.
  if (processedLines.length === 0) {
    return "No";
  }

  // Step 2: Parse the first line to determine the total number of data entries to evaluate.
  // Use parseInt with a radix (10) for robust integer conversion.
  const totalEntriesToExamine = parseInt(processedLines[0], 10);

  // Validation: Check if the first line successfully converted to a valid, non-negative number.
  if (isNaN(totalEntriesToExamine) || totalEntriesToExamine < 0) {
    // If the count of entries is invalid, the pattern cannot be found.
    return "No";
  }

  // Initialize a counter to track the current streak of consecutive matching pairs.
  let currentConsecutiveMatches = 0;
  // Define the target number of consecutive matches required to trigger a "Yes" outcome.
  const targetMatchStreak = 3;
  // A boolean flag to indicate whether the target streak has been achieved at any point.
  let streakAchieved = false;

  // Step 3: Iterate through the subsequent lines of data, starting from the second line (index 1).
  // The loop runs for 'totalEntriesToExamine' iterations, processing lines from index 1 up to 'totalEntriesToExamine'.
  for (let lineIterator = 1; lineIterator <= totalEntriesToExamine; lineIterator++) {
    // Boundary check: Ensure the current line index is within the bounds of the processedLines array.
    // This handles cases where totalEntriesToExamine might exceed the actual number of lines provided.
    if (lineIterator >= processedLines.length) {
      break; // No more lines to process, exit the loop early.
    }

    // Split the current line into its individual components based on space as a delimiter.
    const lineComponents = processedLines[lineIterator].split(" ");

    // Validation: Ensure the current line has at least two components for comparison.
    if (lineComponents.length < 2) {
      // If a line is malformed (e.g., "a" instead of "a b"), it cannot be a match.
      // Reset the streak and move to the next line.
      currentConsecutiveMatches = 0;
      continue;
    }

    // Compare the first two components of the current line using strict equality.
    // Store the result in a descriptive boolean variable.
    const areComponentsIdentical = (lineComponents[0] === lineComponents[1]);

    // Update the consecutive match counter based on the comparison result.
    if (areComponentsIdentical) {
      currentConsecutiveMatches++; // Increment streak if components match.
    } else {
      currentConsecutiveMatches = 0; // Reset streak if components do not match.
    }

    // Check if the required target streak has been met or exceeded.
    if (currentConsecutiveMatches >= targetMatchStreak) {
      streakAchieved = true; // Set the flag to true.
      break; // Once the streak is achieved, further processing is unnecessary, so exit the loop.
    }
  }

  // Step 4: Determine and return the final outcome based on whether the target streak was achieved.
  if (streakAchieved) {
    return "Yes";
  } else {
    return "No";
  }
}

// This self-executing anonymous function serves as the program's primary entry point.
// It handles reading input from standard I/O and printing the final result.
const executionEntryPoint = function () {
  // Read the entire content of standard input as a UTF-8 string.
  const fileContent = require("fs").readFileSync("/dev/stdin", "utf-8");

  // Call the main analysis function with the raw file content.
  const resultOutcome = analyzeInputPattern(fileContent);

  // Output the result to the console.
  console.log(resultOutcome);
};

// Invoke the entry point function to start the program execution.
executionEntryPoint();