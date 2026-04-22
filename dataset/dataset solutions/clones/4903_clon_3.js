function SolveProblem(challengeDataString) {
  // Define constants for clarity in string splitting operations.
  const LINE_DELIMITER = "\n";
  const VALUE_DELIMITER = " ";

  /**
   * Helper function to safely parse a string into an integer.
   * Provides basic error logging for non-numeric inputs.
   * @param {string} strValue - The string to parse.
   * @returns {number} The parsed integer, or 0 if parsing fails.
   */
  const parseIntegerSafely = (strValue) => {
    const numericValue = Number(strValue);
    if (Number.isNaN(numericValue)) {
      // In a real-world scenario, more robust error handling might be needed,
      // such as throwing an exception or returning a specific error code.
      // For competitive programming, input validity is often assumed.
      console.error("Parsing Error: Could not convert string to number:", strValue);
      return 0; // Defaulting to 0 for robustness in this context.
    }
    return Math.floor(numericValue); // Ensure it's an integer, not a float.
  };

  // Divide the complete input string into an array of individual lines.
  let rawInputLines = challengeDataString.split(LINE_DELIMITER);

  // Implement a guard clause to ensure sufficient input data is available.
  if (rawInputLines.length < 2) {
    console.error("Input Error: Not enough data lines provided. Expected at least two lines.");
    return; // Exit if input is malformed.
  }

  // Extract and process the first line which contains global parameters.
  let firstLineElements = rawInputLines[0].split(VALUE_DELIMITER);

  // The first parameter: total permissible capacity or limit.
  // Renamed from 'K' to 'totalCapacity'.
  const totalCapacity = parseIntegerSafely(firstLineElements[0]);

  // The second parameter: count of distinct item types (unused in final calculation).
  // Renamed from 'T' to 'distinctItemTypes'.
  const distinctItemTypes = parseIntegerSafely(firstLineElements[1]);

  // Add a validation check for the total capacity.
  // If capacity is non-positive, the problem's outcome might be trivial or undefined.
  if (totalCapacity <= 0) {
      console.log(0); // If no capacity, result is 0.
      return;
  }

  // Initialize an array to store the parsed item counts.
  // Renamed from 'a' to 'itemFrequencyList'.
  let itemFrequencyList = [];

  // Split the second line to get strings of individual counts.
  const countStrings = rawInputLines[1].split(VALUE_DELIMITER);

  // Iterate through the count strings and parse them into integers.
  // Using a traditional for loop instead of map for structural variation.
  for (let arrayIndex = 0; arrayIndex < countStrings.length; arrayIndex++) {
    const currentCountStr = countStrings[arrayIndex];
    itemFrequencyList.push(parseIntegerSafely(currentCountStr));
  }

  // Sort the list of item frequencies in descending order.
  // The comparator `(countB, countA) => countB - countA` ensures largest elements come first.
  itemFrequencyList.sort((countB, countA) => {
    // A positive result means countB comes before countA (descending).
    return countB - countA;
  });

  // The highest frequency is now the first element in the sorted list.
  // Renamed from 'a[0]' to 'highestFrequency'.
  const highestFrequency = itemFrequencyList[0];

  // Perform the core calculation:
  // Original formula: a[0] - 1 - (K - a[0])
  // This simplifies to: 2 * a[0] - K - 1
  // Introduce intermediate variables for a step-by-step breakdown.
  const currentLargestMinusOne = highestFrequency - 1;
  const remainingCapacityAfterLargest = totalCapacity - highestFrequency;
  const rawCalculatedDifference = currentLargestMinusOne - remainingCapacityAfterLargest;

  // The problem requires the result to be non-negative.
  // Use Math.max directly instead of Math.max.apply for cleaner syntax.
  const finalResultValue = Math.max(rawCalculatedDifference, 0);

  // Display the final computed result.
  console.log(finalResultValue);
}

// Self-executing anonymous function to handle file reading and error management.
// This structure encapsulates the environment-specific code.
(() => {
  // Ensure the 'node:fs' module is available for file system operations.
  const fileSystemModule = require("node:fs");

  try {
    // Synchronously read the input from standard input, encoded as UTF-8.
    const fileContents = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    // Invoke the main problem-solving function with the read data.
    SolveProblem(fileContents);
  } catch (operationError) {
    // Catch and log any errors that occur during file reading or processing.
    console.error("An error occurred during input processing:", operationError.message);
    // Optionally, exit the process with an error code in a production environment.
    // process.exit(1);
  }
})();