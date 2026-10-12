// This function is responsible for obtaining raw input data from the standard input stream.
function getInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

// This function serves as the primary mechanism for displaying results to the console.
function displayResult(outputValue) {
  console.log(outputValue);
}

/*
 * The transformInput utility provides various methods for processing string inputs.
 * It supports different conversion strategies based on the specified type.
 *
 * @param {string} inputString - The textual data to be processed.
 * @param {number} conversionType - An integer indicating the desired transformation:
 *   0: Returns the input string without any modifications.
 *   1: Parses the input string into an integer.
 *   2: Splits the string by single spaces into an array of substrings.
 *   3: Splits the string by newline characters into an array of substrings.
 *   4: Splits by spaces and then converts each resulting substring to a number.
 *   5: Splits by newlines and then converts each resulting substring to a number.
 *   6: Breaks the string into an array of individual characters.
 *   7: Breaks the string into individual characters and converts each to a number.
 * @returns {any} The result of the transformation, which can be a string, number, or array.
 */
function transformInput(inputString, conversionType) {
  switch (conversionType) {
    case 0:
      return inputString;
    case 1:
      return parseInt(inputString, 10);
    case 2:
      return inputString.split(" ");
    case 3:
      return inputString.split("\n");
    case 4:
      return inputString.split(" ").map((elementStr) => Number(elementStr));
    case 5:
      return inputString.split("\n").map((elementStr) => Number(elementStr));
    case 6:
      return inputString.split("");
    case 7:
      return inputString.split("").map((elementStr) => Number(elementStr));
  }
}

// The main function orchestrates the data processing logic.
function processData(rawData) {
  // Split the initial raw input into an array of lines.
  let processedLines = transformInput(rawData, 3);

  // Extract the first number from the first line, representing the count of elements.
  const countElements = transformInput(processedLines[0], 1);

  // Parse the second line into an array of numbers.
  const originalSequence = transformInput(processedLines[1], 4);

  // Initialize an auxiliary array with 'countElements' zeros.
  const indicatorArray = new Array(countElements).fill(0);

  // Populate the auxiliary array based on a specific condition.
  for (let idx = 0; idx < countElements; idx++) {
    // If an element in the original sequence matches its 1-based index, mark it in the indicator array.
    if (originalSequence[idx] === idx + 1) {
      indicatorArray[idx] = 1;
    }
  }

  // Initialize a variable to accumulate the final result.
  let finalCount = 0;

  // Iterate through the indicator array to compute the final count based on patterns.
  for (let idx = 1; idx < countElements; idx++) {
    const previousIndicator = indicatorArray[idx - 1];
    const currentIndicator = indicatorArray[idx];

    // Apply specific conditions to increment the final counter.
    if (idx !== 1 && previousIndicator === 0 && currentIndicator === 1) {
      finalCount++;
    } else if (idx === 1 && (currentIndicator === 1 || previousIndicator === 1)) {
      finalCount++;
    }
  }

  // Output the computed final count.
  displayResult(finalCount);
}

// Initiate the data processing by calling the main function with input from stdin.
processData(getInputData());
