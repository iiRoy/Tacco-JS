function getInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(outputValue) {
  console.log(outputValue); // Outputs the final computed value.
}

// This utility function handles various input transformations.
// Parameter 'conversionType' dictates the transformation:
// 0: No change, return as is.
// 1: Convert to integer.
// 2: Split by space.
// 3: Split by newline.
// 4: Split by space and convert to number array.
// 5: Split by newline and convert to number array.
// 6: Split into individual characters.
// 7: Split into individual characters and convert to number array.
function transformInput(rawData, conversionType) {
  switch (conversionType) {
    case 0:
      return rawData;
    case 1:
      return parseInt(rawData);
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
  }
}

function processCalculation(initialValue) {
  // Convert the initial string input to an integer.
  initialValue = transformInput(initialValue, 1);

  // Calculate two potential cost prices based on floor and ceil divisions.
  let costPriceA = Math.floor(initialValue / 1.08);
  let costPriceB = Math.ceil(initialValue / 1.08);

  // Re-calculate the taxed price for verification.
  let tempCalcA = Math.floor(costPriceA * 1.08);
  let tempCalcB = Math.floor(costPriceB * 1.08);

  // Check which cost price, if any, matches the initial value after tax.
  if (initialValue === tempCalcA) {
    displayResult(costPriceA);
  } else if (initialValue === tempCalcB) {
    displayResult(costPriceB);
  } else {
    displayResult(":("); // No matching cost price found.
  }
}

processCalculation(getInputData());
