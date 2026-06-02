function readInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function printResult(dataToPrint) {
  console.log(dataToPrint);
}

// This utility function handles various input transformations.
// 0: No change
// 1: Convert to integer
// 2: Split by space
// 3: Split by newline
// 4: Split by space, then convert to number array
// 5: Split by newline, then convert to number array
// 6: Split into individual characters
// 7: Split into individual characters, then convert to number array
function transformInput(rawData, conversionType) {
  switch (conversionType) {
    case 0:
      return rawData;
    case 1:
      return parseInt(rawData, 10);
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

function processData(rawText) {
  // Split the entire input into lines
  let processedLines = transformInput(rawText, 3);

  // Get the count of elements from the first line
  let elementCount = transformInput(processedLines[0], 1);

  // Parse the second line into an array of numbers
  let numberSequence = transformInput(processedLines[1], 4);

  // Initialize a variable to store the cumulative sum
  let finalSum = 0;

  // Iterate through the array to calculate the sum of products of distinct pairs
  for (let firstIndex = 0; firstIndex < elementCount - 1; firstIndex++) {
    for (let secondIndex = firstIndex + 1; secondIndex < elementCount; secondIndex++) {
      // Add the product of the current pair to the total sum
      finalSum += numberSequence[firstIndex] * numberSequence[secondIndex];
    }
  }

  // Output the final calculated sum
  printResult(finalSum);
}

// Execute the main processing function with input obtained from stdin
processData(readInput());
