"use strict";
// This class provides methods to parse input data from a multi-line string.
function InputFeeder(sourceContent, itemConverter) {
  // Store the input string split into an array of lines.
  this._contentLines = sourceContent.split("\n");
  // Initialize current column position for token extraction.
  this._columnIndex = 0;
  // Initialize current line position.
  this._lineIndex = 0;
  // Store the function used to convert extracted tokens (defaults to Number).
  this._converterFunction = itemConverter || Number;
}

// Prototype method to retrieve the next single data item.
InputFeeder.prototype.fetchNextItem = function() {
  // Get the current line from the stored content.
  let currentLine = this._contentLines[this._lineIndex];
  // If no more lines, return undefined.
  if (!currentLine) return;

  // Trim whitespace and split the line into individual parts.
  let lineParts = currentLine.trim().split(" ");
  // Extract the part at the current column index.
  let extractedPart = lineParts[this._columnIndex];
  // Advance the column index for the next extraction.
  this._columnIndex++;

  // If all parts of the current line have been processed, reset column and advance line.
  if (lineParts.length === this._columnIndex) {
    this._columnIndex = 0;
    this._lineIndex++;
  }
  // Convert and return the extracted part.
  return this._converterFunction(extractedPart);
};

// Prototype method to retrieve all data items from the current line.
InputFeeder.prototype.fetchLineItems = function() {
  let currentLine = this._contentLines[this._lineIndex];
  if (!currentLine) return; // No more lines available.

  this._columnIndex = 0; // Reset column index for a new line.
  this._lineIndex++;     // Move to the next line.

  // Split the line into parts and convert each part using the stored function.
  return currentLine.split(" ").map(this._converterFunction);
};

// Main function to execute the problem-solving logic.
function processChallenge(challengeData) {
  // Create an instance of the input parser.
  const dataParser = new InputFeeder(challengeData);

  // Read the total count of elements and the target value.
  const totalCount = dataParser.fetchNextItem();
  const targetValue = dataParser.fetchNextItem();

  // Populate an array with numerical values read from the input.
  const numberList = [];
  for (let idx = 0; idx < totalCount; idx++) {
    numberList.push(dataParser.fetchNextItem());
  }

  // Sort the list of numbers in ascending order.
  numberList.sort((valA, valB) => valA - valB);

  // Pre-calculate factorials up to totalCount, modulo 1000000007.
  const factorialCache = [1, 1];
  for (let idx = 2; idx <= totalCount; idx++) {
    factorialCache[idx] = (factorialCache[idx - 1] * idx) % 1000000007;
  }

  // Initiate the recursive computation and print the final result.
  console.log(computeCombinations(targetValue, "0".repeat(totalCount)));

  // Recursive function to compute combinations.
  function computeCombinations(currentAmount, selectionStatus) {
    // Base case: if the current amount is less than the smallest number in the list.
    if (currentAmount < numberList[0]) {
      // Count unselected elements (marked '0') in the selection status string.
      const unselectedCount = selectionStatus.split("").filter(charElement => charElement === "0").length;
      // Return the product of current amount and factorial of unselected count.
      return currentAmount * factorialCache[unselectedCount];
    }

    // Find the position where numbers in the list are greater than or equal to currentAmount.
    let searchPosition = 0;
    while (numberList[searchPosition] < currentAmount) {
      searchPosition++;
    }

    // Initialize the accumulated result for this level of recursion.
    let accumulatedResult = 0;
    // Iterate through numbers smaller than currentAmount.
    for (let idx = 0; idx < searchPosition; idx++) {
      // If the current number has not been selected yet (marked '0').
      if (selectionStatus[idx] !== "1") {
        // Create an updated selection status string by marking the current number as selected.
        let updatedStatus = selectionStatus.split("");
        updatedStatus[idx] = "1";
        updatedStatus = updatedStatus.join("");
        // Recursively call with the remainder and the updated selection status.
        accumulatedResult += computeCombinations(currentAmount % numberList[idx], updatedStatus);
        // Apply modulo operation to prevent overflow.
        accumulatedResult = accumulatedResult % 1000000007;
      }
    }
    return accumulatedResult;
  }
}

// Read input from standard input and pass it to the main processing function.
processChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));