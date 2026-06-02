function getInputData() {
  // Reads raw input from standard input, decodes as UTF-8, and trims whitespace.
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(content) {
  // Outputs the given content to standard output.
  console.log(content);
}

function logError(errorMessage) {
  // Outputs the given error message to standard error.
  console.error(errorMessage);
}

/**
 * Converts input data based on a specified type.
 * @param {string} rawData - The input string to convert.
 * @param {number} conversionType - The type of conversion to apply.
 *   0: No conversion, return as is.
 *   1: Convert to integer.
 *   2: Split by space.
 *   3: Split by newline.
 *   4: Split by space and convert to number array.
 *   5: Split by newline and convert to number array.
 *   6: Split into individual characters.
 *   7: Split into individual characters and convert to number array.
 * @returns {any} The converted data.
 */
function transformInput(rawData, conversionType) {
  switch (conversionType) {
    case 0:
      return rawData;
    case 1:
      return parseInt(rawData, 10); // Explicit radix for safety
    case 2:
      return rawData.split(" ");
    case 3:
      return rawData.split("\n");
    case 4:
      return rawData.split(" ").map((item) => Number(item));
    case 5:
      return rawData.split("\n").map((item) => Number(item));
    case 6:
      return rawData.split("");
    case 7:
      return rawData.split("").map((item) => Number(item));
    default:
      return rawData; // Fallback for unknown types
  }
}

// Main function to process the input and generate the required output.
function processInputAndGenerateOutput(numericValue) {
  // Convert the initial input string to an integer.
  numericValue = transformInput(numericValue, 1);

  // Handle specific edge cases for small input values.
  if (numericValue === 3) {
    displayResult("2\n1 3\n2 3");
    return;
  }
  if (numericValue === 4) {
    displayResult("4\n1 3\n2 1\n4 2\n3 4");
    return;
  }

  // Initialize an array to store the lines of the generated output.
  let resultLines = [];

  // Check if the input number is odd.
  if (numericValue % 2 === 1) {
    // For odd numbers, the first line of output is (numericValue - 1) * 2.
    resultLines.push((numericValue - 1) * 2);

    // Loop through a range determined by half of the input number.
    for (let idx = 0; idx < Math.floor(numericValue / 2); idx++) {
      // Calculate four related numbers based on the current index and input.
      let firstNum = idx + 1;
      let secondNum = firstNum + 1;
      let thirdNum = numericValue - 1 - idx;
      let fourthNum = thirdNum - 1;

      // Special handling for the first and last iterations of the loop.
      if (idx === Math.floor(numericValue / 2) - 1 || idx === 0) {
        // Add specific pairs involving the input number itself.
        resultLines.push(firstNum.toString() + " " + numericValue.toString());
        resultLines.push(thirdNum.toString() + " " + numericValue.toString());
        // If it's the very last iteration, break out of the loop.
        if (idx === Math.floor(numericValue / 2) - 1) {
          break;
        }
      }

      // Add four pairs of numbers to the output array.
      resultLines.push(firstNum.toString() + " " + secondNum.toString());
      resultLines.push(firstNum.toString() + " " + fourthNum.toString());
      resultLines.push(thirdNum.toString() + " " + secondNum.toString());
      resultLines.push(thirdNum.toString() + " " + fourthNum.toString());
    }
    // Join all generated lines with newline characters and display the final result.
    displayResult(resultLines.join("\n"));
  } else {
    // If the input number is even.
    // The first line of output is numericValue * 2.
    resultLines.push(numericValue * 2);

    // Loop through a range determined by half of the input number.
    for (let idx = 0; idx < numericValue / 2; idx++) {
      // Calculate four related numbers based on the current index and input.
      let firstNum = idx + 1;
      let secondNum = firstNum + 1;
      let thirdNum = numericValue - idx;
      let fourthNum = thirdNum - 1;

      // Special adjustment for the last iteration of the loop.
      if (idx === numericValue / 2 - 1) {
        secondNum = 1; // Reset second number to 1.
        fourthNum = numericValue; // Reset fourth number to the input value.
      }

      // Add four pairs of numbers to the output array.
      resultLines.push(firstNum.toString() + " " + secondNum.toString());
      resultLines.push(firstNum.toString() + " " + fourthNum.toString());
      resultLines.push(thirdNum.toString() + " " + secondNum.toString());
      resultLines.push(thirdNum.toString() + " " + fourthNum.toString());
    }
    // Join all generated lines with newline characters and display the final result.
    displayResult(resultLines.join("\n"));
  }
}

// Execute the main processing function with the input obtained from standard input.
processInputAndGenerateOutput(getInputData());
