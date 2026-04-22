/*
 * This module is responsible for processing a specific data format.
 * It reads numerical data, performs classifications, and outputs a boolean-like result.
 */
function ProcessData(rawDataInput) {

  // First, segment the entire input string into an array of individual lines.
  let dataLines = rawDataInput.split("\n");

  // Extract the count of elements from the initial line of the input.
  const totalCount = parseInt(dataLines[0], 10);

  // Parse the second line, splitting it by spaces to get string representations of numbers.
  let stringValues = dataLines[1].split(" ");

  // Initialize an array to hold the numeric values, ensuring it has the correct size and default values.
  let integerList = new Array(totalCount).fill(0);

  // Iterate through the string values and convert each one into an integer, storing it.
  for (let currentIdx = 0; currentIdx < totalCount; currentIdx++) {
    integerList[currentIdx] = parseInt(stringValues[currentIdx], 10);
  }

  // Initialize counters for specific numerical properties.
  let countOfOdds = 0;
  let countOfFours = 0;

  // Traverse the list of integers to categorize them based on divisibility.
  for (let currentIdx = 0; currentIdx < totalCount; currentIdx++) {
    const currentValue = integerList[currentIdx]; // Fetch the current number for analysis.

    if (currentValue % 2 === 1) {
      // If the number leaves a remainder of 1 when divided by 2, it's odd.
      countOfOdds++;
    } else if (currentValue % 4 === 0) {
      // If the number is perfectly divisible by 4, increment the four-multiple counter.
      countOfFours++;
    }
  }

  // Determine the final status string based on the calculated counts.
  let outcomeIndicator = "No";

  if (countOfOdds === 0) {
    // If no odd numbers were found, the primary condition is met.
    outcomeIndicator = "Yes";
  } else if (countOfOdds - countOfFours <= 0) {
    // If the number of odds does not exceed the number of fours, a secondary condition is met.
    outcomeIndicator = "Yes";
  } else if (
    totalCount % 2 === 1 && // Check if the total number of elements is odd.
    countOfOdds - countOfFours <= 1 && // Evaluate a specific difference threshold.
    countOfFours > 0 // Ensure there's at least one multiple of four present.
  ) {
    outcomeIndicator = "Yes";
  }

  // Output the final determined status string to standard output.
  console.log("%s", outcomeIndicator);
}

// Execute the data processing function, reading input from the standard input stream.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));