processData(getInputData());

/**
 * Retrieves input from standard input.
 * @returns {string} The trimmed content read from stdin.
 */
function getInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

/**
 * Displays information to standard output.
 * @param {*} content The data to be logged.
 */
function displayOutput(content) {
  console.log(content);
}

/**
 * Reports an error message to standard error.
 * @param {*} errorMessage The error content to be logged.
 */
function reportError(errorMessage) {
  console.error(errorMessage);
}

/**
 * Transforms an input value based on a specified conversion type.
 * @param {string|Array} inputValue The input string or array to convert.
 * @param {number} conversionType The type of conversion to apply.
 *   1: Convert to integer.
 *   2: Split by space.
 *   3: Split by newline.
 *   4: Split by space and convert elements to numbers.
 *   5: Split by newline and convert elements to numbers.
 *   6: Split into individual characters.
 *   7: Split into individual characters and convert to numbers.
 *   8: Join array elements with space.
 *   9: Join array elements with newline.
 *   0: Join array elements without separator.
 *   (Any other value): Return input as is.
 * @returns {*} The converted value.
 */
function transformInput(inputValue, conversionType) {
  switch (conversionType) {
    case 1:
      return parseInt(inputValue);
    case 2:
      return inputValue.split(" ");
    case 3:
      return inputValue.split("\n");
    case 4:
      return inputValue.split(" ").map((itemStr) => Number(itemStr));
    case 5:
      return inputValue.split("\n").map((elementStr) => Number(elementStr));
    case 6:
      return inputValue.split("");
    case 7:
      return inputValue.split("").map((charVal) => Number(charVal));
    case 8:
      return inputValue.join(" ");
    case 9:
      return inputValue.join("\n");
    case 0:
      return inputValue.join("");
    default:
      return inputValue;
  }
}

/**
 * Main function to process the input data and generate output.
 * @param {string} rawInputString The raw input string from stdin.
 */
function processData(rawInputString) {
  // Convert the input string into an array of numbers, split by spaces.
  rawInputString = transformInput(rawInputString, 4);

  // Extract problem parameters from the processed input array.
  const countN = rawInputString[0]; // Represents N
  const limitK = rawInputString[1]; // Represents K
  const valueS = rawInputString[2]; // Represents S

  // Initialize an array with a size of N.
  const resultCollection = new Array(countN);

  // Populate the array based on the conditions.
  for (let idx = 0; idx < countN; idx++) {
    if (idx < limitK) {
      // If the current index is less than K, assign S.
      resultCollection[idx] = valueS;
    } else {
      // Otherwise, assign the value 1.
      resultCollection[idx] = 1;
    }
  }

  // Join the elements of the resulting array with spaces and print to console.
  displayOutput(resultCollection.join(" "));
}
