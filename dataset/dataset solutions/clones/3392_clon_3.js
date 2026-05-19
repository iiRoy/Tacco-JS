"use strict";
function processInput(rawData) {
  const lines = rawData.split("\n").filter(line => line !== "");
  const targetString = lines[0];

  const charToFind = "W"; // Helper constant for the target character

  // Step 1: Identify and collect the original indices of the target character,
  // excluding the first position as per the original logic (map to 0, then filter 0).
  const collectedIndices = [];
  for (let charPosition = 0; charPosition < targetString.length; charPosition++) {
    const currentCharacter = targetString[charPosition];
    if (currentCharacter === charToFind && charPosition !== 0) {
      collectedIndices.push(charPosition);
    }
  }

  let finalAccumulatedSum = 0; // Initialize the accumulator for the final calculation

  // Step 2: Iterate through the collected indices and apply the reduction logic.
  // The original reduce was: acc + cur - index, where 'cur' is the original index
  // and 'index' is its position within the filtered array.
  for (let listPosition = 0; listPosition < collectedIndices.length; listPosition++) {
    const originalIndexValue = collectedIndices[listPosition];
    finalAccumulatedSum += (originalIndexValue - listPosition);
  }

  console.log(finalAccumulatedSum);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
