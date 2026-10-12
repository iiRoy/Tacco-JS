function getStandardInputContent() {
  return require("fs").readFileSync("/dev/stdin", "utf8");
}

function parseSpaceSeparatedIntegers(inputString) {
  return inputString.split(" ").map(strValue => parseInt(strValue, 10));
}

function processInputData(rawInputText) {
  const inputLines = rawInputText.split("\n");

  const firstLineNumericValues = parseSpaceSeparatedIntegers(inputLines[0]);
  const totalCapacity = firstLineNumericValues[0];
  const numberOfTypes = firstLineNumericValues[1];

  const itemCountsArray = parseSpaceSeparatedIntegers(inputLines[1]);

  // Sort the array in descending order to get the largest element at index 0
  itemCountsArray.sort((valueA, valueB) => valueB - valueA);

  const largestItemCount = itemCountsArray[0];

  // Calculate the sum of counts for all other items
  const sumOfOtherItemCounts = totalCapacity - largestItemCount;

  // Perform the core calculation: largestItemCount - 1 - (totalCapacity - largestItemCount)
  const calculatedDifference = largestItemCount - 1 - sumOfOtherItemCounts;

  // Ensure the final result is not negative
  const finalOutputValue = Math.max(calculatedDifference, 0);

  console.log(finalOutputValue);
}

processInputData(getStandardInputContent());
