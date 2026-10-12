function readInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayOutput(resultValue) {
  console.log(resultValue); // Prints the final outcome
}

// This utility function handles various input parsing scenarios.
// 0: No conversion, returns as is.
// 1: Converts to integer.
// 2: Splits by space.
// 3: Splits by newline.
// 4: Splits by space and converts to number array.
// 5: Splits by newline and converts to number array.
// 6: Splits into individual characters.
// 7: Splits into individual characters and converts to number array.
function processInputData(dataString, conversionType) {
  switch (conversionType) {
    case 0:
      return dataString;
    case 1:
      return parseInt(dataString, 10);
    case 2:
      return dataString.split(" ");
    case 3:
      return dataString.split("\n");
    case 4:
      return dataString.split(" ").map((item) => Number(item));
    case 5:
      return dataString.split("\n").map((item) => Number(item));
    case 6:
      return dataString.split("");
    case 7:
      return dataString.split("").map((item) => Number(item));
    default:
      return dataString; // Default case, though not explicitly in original
  }
}

function CalculatePrice(rawInputVal) {
  // Convert the input to an integer, as per original logic (case 1)
  let processedInput = processInputData(rawInputVal, 1);

  // Calculate the approximate original cost before tax
  let originalCost = processedInput / 1.08;

  // Calculate two temporary values based on floor and ceil of the original cost
  // then apply the tax (1.08)
  let tempResultOne = Math.floor(originalCost * 1.08);
  let tempResultTwo = Math.ceil(originalCost * 1.08);

  // Check if the input matches either of the calculated values after tax
  if (processedInput === tempResultOne) {
    // If it matches the floor-based calculation, output the ceiling of the original cost
    displayOutput(Math.ceil(originalCost));
  } else if (processedInput === tempResultTwo) {
    // If it matches the ceil-based calculation, output the floor of the original cost
    displayOutput(Math.floor(originalCost));
  } else {
    // If neither matches, output the specific error string
    displayOutput(":(");
  }
}

// Execute the main logic by reading input and passing it to the primary function
CalculatePrice(readInput());
