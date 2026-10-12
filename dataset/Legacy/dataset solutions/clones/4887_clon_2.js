// This function serves as the primary entry point for processing the raw input data.
function ProcessInput(rawData) {
  // A utility function designed to parse a single line of text,
  // splitting it by spaces and returning an array of string elements.
  const parseStringArray = function(inputLine) {
    // First, remove any leading or trailing whitespace from the line.
    // Then, split the cleaned line into an array using a space as the delimiter.
    let stringElements = inputLine.trim().split(" ");
    // Iterate through the array; this loop explicitly re-assigns each element to itself.
    // This step maintains structural similarity with the original code's explicit loop.
    for (let idx = 0; idx < stringElements.length; ++idx) {
      stringElements[idx] = stringElements[idx];
    }
    return stringElements;
  };

  // A helper function to convert a space-separated string into an array of numerical values.
  const parseNumberArray = function(inputRow) {
    // Similar to the string parser, it cleans whitespace and splits the row.
    let numericElements = inputRow.trim().split(" ");
    // Each string element is converted into a number using the unary plus operator.
    for (let idx = 0; idx < numericElements.length; ++idx) {
      numericElements[idx] = +numericElements[idx];
    }
    return numericElements;
  };

  // A simple function to determine the lesser of two provided numeric arguments.
  const findMinimum = function(valueA, valueB) {
    return valueA > valueB ? valueB : valueA;
  };

  // The entire raw input string is divided into an array of individual lines.
  let inputRows = rawData.split("\n");

  // The first line of input is parsed to extract two key numerical parameters.
  const firstLineData = parseNumberArray(inputRows[0]);
  const totalElements = firstLineData[0]; // Represents 'N' from the problem statement.
  const thresholdValue = firstLineData[1]; // Represents 'T' from the problem statement.

  // The second line of input is parsed into an array of numbers, which are the data points.
  const dataPoints = parseNumberArray(inputRows[1]);

  let maxProfit = 0; // This variable will store the highest profit difference found.
  let profitOccurrences = 0; // This counter tracks how many times the 'maxProfit' has been observed.
  let currentMin = dataPoints[0]; // Keeps track of the lowest data point encountered so far during iteration.
  const currentMax = dataPoints[0]; // This variable is declared and initialized but not subsequently used in the original logic.

  // A specific condition check: if there's only one data point, no profit can be calculated.
  if (totalElements === 1) {
    console.log("0");
  }

  // Begin iterating through each data point to compute potential profits.
  for (let idx = 0; idx < totalElements; ++idx) {
    const currentValue = dataPoints[idx]; // The data point currently under examination.

    // Evaluate if the profit derived from the current value and the running minimum
    // surpasses the previously recorded maximum profit.
    if (currentValue - currentMin > maxProfit) {
      maxProfit = currentValue - currentMin; // Update the maximum profit.
      profitOccurrences = 1; // Reset the occurrence count, as a new maximum has been found.
    } else if (currentValue - currentMin === maxProfit) {
      // If the current profit matches the maximum profit, increment its occurrence count.
      profitOccurrences++;
    }

    // Update the running minimum value if the current data point is smaller.
    currentMin = currentValue < currentMin ? currentValue : currentMin;
  }

  // Finally, output the result: the smaller value between the count of maximum profit occurrences
  // and half of the threshold value (rounded down to the nearest integer).
  console.log(findMinimum(profitOccurrences, Math.floor(thresholdValue / 2)));
}

// The program initiates by reading the entire content of standard input as a UTF-8 string,
// and then passes this raw data to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
