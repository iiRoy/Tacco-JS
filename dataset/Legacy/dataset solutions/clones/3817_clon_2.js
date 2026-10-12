function readInput() {
  // Reads input from stdin, decodes as UTF-8, and removes leading/trailing whitespace.
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function printResult(content) {
  // Outputs the given content to standard output.
  console.log(content);
}

function logError(message) {
  // Outputs an error message to standard error.
  console.error(message);
}

// Helper function to convert input strings based on a specified type.
// conversionType:
// 0: No conversion, return as is.
// 1: Convert to integer.
// 2: Split by space.
// 3: Split by newline.
// 4: Split by space and convert each part to a number.
// 5: Split by newline and convert each part to a number.
// 6: Split into individual characters.
// 7: Split into individual characters and convert each to a number.
function transformData(inputStr, conversionType) {
  switch (conversionType) {
    case 0:
      return inputStr;
    case 1:
      return parseInt(inputStr, 10);
    case 2:
      return inputStr.split(" ");
    case 3:
      return inputStr.split("\n");
    case 4:
      return inputStr.split(" ").map((val) => Number(val));
    case 5:
      return inputStr.split("\n").map((item) => Number(item));
    case 6:
      return inputStr.split("");
    case 7:
      return inputStr.split("").map((char) => Number(char));
    default:
      return inputStr; // Default to no conversion if type is unknown
  }
}

function ProcessInput(rawData) {
  // Convert the raw input string into an array of numbers, split by newlines.
  rawData = transformData(rawData, 5);

  // The first element is the total number of elements (N).
  let totalElements = rawData[0];

  // Remove N from the array as it's now stored in totalElements.
  rawData.shift();

  // Add a sentinel value (0) to the end of the array for boundary conditions.
  rawData.push(0);

  // Check the first element of the processed data. If it's not 0, it's an invalid state.
  if (rawData[0] !== 0) {
    printResult(-1);
    return;
  }

  let finalSum = 0; // Accumulator for the final result.

  // Initialize a difference array for the "imos" method (prefix sums).
  const diffArray = new Array(totalElements + 1).fill(0);

  // Iterate backwards through the input data to populate the difference array.
  for (let idx = totalElements - 1; idx >= 1; --idx) {
    let previousVal = rawData[idx]; // Value at current index.
    let nextVal = rawData[idx + 1]; // Value at the next index.

    // If the difference between next and current value is greater than 1, it's an invalid sequence.
    if (nextVal - previousVal > 1) {
      printResult(-1);
      return;
    }

    // If the current value is greater than or equal to the next value,
    // apply the "imos" technique to mark a range.
    if (previousVal - nextVal >= 0) {
      diffArray[idx + 1]--; // Decrement at the end of the range.
      diffArray[idx - (rawData[idx] - 1)]++; // Increment at the start of the range.
    } else if (nextVal - previousVal === 1) {
      // If the next value is exactly 1 greater than the current, no operation needed.
      continue;
    }
  }

  // Calculate prefix sums on the difference array.
  for (let k = 0; k < totalElements; ++k) {
    diffArray[k + 1] += diffArray[k];
  }

  // Sum up the values in the modified difference array to get the final result.
  for (let j = 0; j < totalElements; ++j) {
    finalSum += diffArray[j];
  }

  // Output the calculated sum.
  printResult(finalSum);
}

// Execute the main processing function with input from stdin.
ProcessInput(readInput());
