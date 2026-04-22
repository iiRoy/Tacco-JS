/*
 * This module contains a core routine for evaluating numerical conditions.
 * It reads a line of numeric data, parses it, and checks a specific range condition.
 */
function EvaluateNumericCondition(rawDataString) {

  // Remove leading/trailing whitespace from the input string for clean parsing.
  let cleanedString = rawDataString.trim();

  // Split the string by spaces and convert each part to a number.
  // The 'Number' constructor handles various string representations of numbers.
  const numericalArray = cleanedString
    .split(" ")
    .map(Number);

  // Check if the third number (index 2) falls inclusively between the first (index 0) and second (index 1) numbers.
  // This logic covers both ascending and descending ranges.
  if (
      (numericalArray[0] >= numericalArray[2] && numericalArray[2] >= numericalArray[1]) // Check descending range case
      ||
      (numericalArray[0] <= numericalArray[2] && numericalArray[2] <= numericalArray[1])    // Check ascending range case
  )
  {
    console.log("Yes"); // Output positive affirmation
  }
  else
  {
    console.log("No");  // Output negative affirmation
  }
}

// Entry point: Read data from standard input and pass it to the processing function.
EvaluateNumericCondition(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
);