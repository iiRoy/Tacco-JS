// This module handles the primary data processing workflow.
function ProcessInputData(incomingDataString) {
  // First, clean up the raw input string:
  // - Remove leading/trailing whitespace.
  // - Split into individual lines based on newline characters.
  // - For each line, split it further by spaces to get an array of string segments.
  let processedLines = incomingDataString
    .trim()
    .split("\n")
    .map(function (currentLineSegment) {
      return currentLineSegment.split(" ");
    });

  // Extract the specific limit value from the second element (index 1) of the first line (index 0).
  // The base 10 is explicitly provided for robust integer parsing.
  let itemCountLimit = parseInt(processedLines[0][1], 10);

  // Convert the elements of the second line (index 1) into an array of integers.
  // Each string element is parsed into its corresponding integer value.
  let numericalCollection = processedLines[1].map((stringElement) =>
    parseInt(stringElement, 10)
  );

  // Sort the collection of numbers in ascending order using a dedicated comparison function.
  numericalCollection.sort(ascendingSorter);

  // Initialize a variable to accumulate the sum of the selected numbers.
  let calculatedSum = 0;

  // Iterate through the sorted collection up to the specified limit.
  // Add each number within this range to the total sum.
  for (let loopIndex = 0; loopIndex < itemCountLimit; loopIndex++) {
    calculatedSum += numericalCollection[loopIndex];
  }

  // Display the final computed sum to the console.
  console.log(calculatedSum);
}

// A helper function designed to compare two numerical values for ascending sort order.
// Returns a negative value if firstValue is less than secondValue,
// zero if they are equal, and a positive value if firstValue is greater than secondValue.
function ascendingSorter(firstValue, secondValue) {
  return firstValue - secondValue;
}

// The main entry point for script execution.
// It reads the entire content of standard input, assuming UTF-8 encoding,
// and then passes this raw string data to the primary processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));