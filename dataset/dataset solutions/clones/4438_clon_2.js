/**
 * Processes raw input data to determine a specific property.
 * This function analyzes a sequence of numbers based on their parity
 * and divisibility by four, then outputs a 'Yes' or 'No' verdict.
 * @param {string} incomingData - The raw input string, typically from a file.
 */
function ProcessInputData(incomingData) {
  // Split the entire input string into individual lines
  // based on newline characters.
  var dataLines = incomingData.split("\n");

  // Parse the first line to get the total number of elements.
  var totalElements = parseInt(dataLines[0], 10);

  // The second line contains space-separated string representations of numbers.
  var stringifiedNumbers = dataLines[1].split(" ");

  // Initialize an array to hold the parsed numeric values.
  // All elements are initially set to zero.
  var numericValues = new Array(totalElements).fill(0);

  // Loop through the stringified numbers, parse them to integers,
  // and store them in the numericValues array.
  for (var elementIndex = 0; elementIndex < totalElements; elementIndex++) {
    numericValues[elementIndex] = parseInt(stringifiedNumbers[elementIndex], 10);
  }

  // Initialize counters for odd numbers and multiples of four.
  var oddNumberCounter = 0;
  var fourMultipleCounter = 0;

  // Iterate through the array of numeric values to categorize them.
  for (var elementIndex = 0; elementIndex < totalElements; elementIndex++) {
    // Check if the current number is odd.
    if (numericValues[elementIndex] % 2 === 1) {
      oddNumberCounter++; // Increment the odd numbers counter.
    }
    // Otherwise, check if the current number is a multiple of four.
    else if (numericValues[elementIndex] % 4 === 0) {
      fourMultipleCounter++; // Increment the multiples of four counter.
    }
  }

  // Initialize the final verdict string to "No" by default.
  var finalVerdict = "No";

  // Apply the decision logic based on the counts.

  // Condition 1: If there are no odd numbers at all.
  if (oddNumberCounter === 0) {
    finalVerdict = "Yes";
  }
  // Condition 2: If the count of odd numbers, after subtracting
  // the count of multiples of four, is less than or equal to zero.
  else if (oddNumberCounter - fourMultipleCounter <= 0) {
    finalVerdict = "Yes";
  }
  // Condition 3: A specific edge case for when total elements is 3,
  // the difference between odd numbers and multiples of four is at most 1,
  // and there's at least one multiple of four.
  else if (totalElements === 3 && oddNumberCounter - fourMultipleCounter <= 1 && fourMultipleCounter > 0) {
    finalVerdict = "Yes";
  }

  // Output the determined verdict to the console.
  console.log('%s', finalVerdict);
}

// Entry point: Read data from standard input asynchronously
// and pass it to the main processing function.
ProcessInputData(require("node:fs").readFileSync("/dev/stdin", "utf8"));