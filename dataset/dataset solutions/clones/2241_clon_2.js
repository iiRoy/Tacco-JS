ExecuteSolution(obtainRawInput());

/*
 * Fetches the primary input data from the system's standard input.
 * Utilizes Node.js 'fs' module to synchronously read the content.
 *
 * @returns {string} The raw input text, stripped of leading/trailing whitespace.
 */
function obtainRawInput() {
  return require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim();
}

/**
 * Displays the given content to the standard output.
 * This function serves as the primary method for program results.
 * @param {any} outputContent - The data to be presented.
 */
function displayResult(outputContent) {
  console.log(outputContent);
}

// Reports an error message to the standard error stream.
// Intended for logging issues or diagnostic information.
// @param {any} errorMessage - The description of the problem.
function reportIssue(errorMessage) {
  console.error(errorMessage);
}

// --- Data Transformation Utility ---
// Parameters for 'operationMode':
// 0: No specific conversion; returns input as is.
// 1: Converts the input string to an integer number.
// 2: Splits the input string by single space characters.
// 3: Splits the input string by newline characters.
// 4: Splits by space and then maps each part to a number.
// 5: Splits by newline and then maps each part to a number.
// 6: Splits the input string into an array of individual characters.
// 7: Splits into individual characters and then maps each to a number.
// 8: Joins an array of strings with spaces.
// 9: Joins an array of strings with newlines.
// 10: Joins an array of strings without any separator.
function processDataForType(sourceValue, operationMode) {
  switch (operationMode) {
    case 1:
      return parseInt(sourceValue, 10);
    case 2:
      return sourceValue.split(" ");
    case 3:
      return sourceValue.split("\n");
    case 4:
      return sourceValue.split(" ").map((singleElement) => Number(singleElement));
    case 5:
      return sourceValue.split("\n").map((singleElement) => Number(singleElement));
    case 6:
      return sourceValue.split("");
    case 7:
      return sourceValue.split("").map((singleElement) => Number(singleElement));
    case 8:
      return sourceValue.join(" ");
    case 9:
      return sourceValue.join("\n");
    case 10:
      return sourceValue.join("");
    default:
      return sourceValue;
  }
}

/**
 * Serves as the main entry point for the program's logic.
 * It takes the initial raw input, processes it, and generates the final output.
 * @param {string} initialDataSet - The raw input string received from `obtainRawInput`.
 */
function ExecuteSolution(initialDataSet) {
  let processedDataSet = processDataForType(initialDataSet, 4);

  const totalElementsCount = processedDataSet[0];
  const thresholdKValue = processedDataSet[1];
  const specificValue = processedDataSet[2];

  let outputCollection = new Array(totalElementsCount);

  for (let loopIndex = 0; loopIndex < totalElementsCount; loopIndex++) {
    if (loopIndex < thresholdKValue) {
      outputCollection[loopIndex] = specificValue;
    } else {
      outputCollection[loopIndex] = 1;
    }
  }

  displayResult(outputCollection.join(" "));
}