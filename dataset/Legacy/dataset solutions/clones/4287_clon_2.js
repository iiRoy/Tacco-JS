function readInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(messageContent) {
  console.log(messageContent);
}

function logError(messageContent) {
  console.error(messageContent);
}

// This utility function handles various input string conversions.
// conversionType:
// 0: No conversion, return as is.
// 1: Convert to integer.
// 2: Split by space.
// 3: Split by newline.
// 4: Split by space and convert to number array.
// 5: Split by newline and convert to number array.
// 6: Split into individual characters.
// 7: Split into individual characters and convert to number array.
function processInputString(inputStr, conversionType) {
  switch (conversionType) {
    case 0:
      return inputStr;
    case 1:
      return parseInt(inputStr);
    case 2:
      return inputStr.split(" ");
    case 3:
      return inputStr.split("\n");
    case 4:
      return inputStr.split(" ").map((itemVal) => Number(itemVal));
    case 5:
      return inputStr.split("\n").map((itemVal) => Number(itemVal));
    case 6:
      return inputStr.split("");
    case 7:
      return inputStr.split("").map((itemVal) => Number(itemVal));
  }
}

function executeCoreLogic(rawData) {
  // First, split the raw input by newlines.
  let processedLines = processInputString(rawData, 3);

  // The first line contains the count N.
  const countElements = processInputString(processedLines[0], 1);

  // The second line contains a space-separated list of numbers.
  const numberSequence = processInputString(processedLines[1], 4);

  // Calculate the total possible combinations (3^N).
  let totalCombinations = Math.pow(3, countElements);

  // Initialize a variable to store the product of 2 for each even number found.
  let evenProduct = 1;

  // Iterate through the number sequence to find even numbers.
  for (let idx = 0; idx < countElements; idx++) {
    // If the current number is even, multiply evenProduct by 2.
    if (numberSequence[idx] % 2 === 0) {
      evenProduct *= 2;
    }
  }

  // The final result is totalCombinations minus evenProduct.
  displayResult(totalCombinations - evenProduct);
}

// Execute the main logic by reading input from stdin.
executeCoreLogic(readInputData());
