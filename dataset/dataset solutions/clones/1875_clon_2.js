function aggregateArrays(inputArray = []) {
  // Determine the total count of arrays within the input collection.
  let arrayLength = inputArray.length;

  // If the provided array is empty, there's nothing to process, so return false.
  if (!(arrayLength > 0)) {
    return false;
  }

  // Initialize the result array with the values from the very first sub-array.
  // This array will accumulate the sums of corresponding elements.
  let resultArray = inputArray[0];

  // Iterate through the remaining sub-arrays, starting from the second one.
  for (let outerIndex = 1; outerIndex < arrayLength; outerIndex++) {
    // For each element in the current sub-array, add its value to the
    // corresponding element in the `resultArray`.
    for (let innerIndex = 0; innerIndex < resultArray.length; innerIndex++) {
      resultArray[innerIndex] += inputArray[outerIndex][innerIndex];
    }
  }
  // Return the array containing the aggregated sums.
  return resultArray;
}

function ProcessInput(rawData) {
  // Clean up the input string by trimming whitespace and splitting it into individual lines.
  rawData = rawData.trim().split("\n");

  // Parse the first line of input to extract configuration values: N, M, and X.
  const configValues = rawData[0].split(" ");
  const numItems = parseInt(configValues[0], 10); // N: Represents the total number of available items.
  const numSkills = parseInt(configValues[1], 10); // M: Represents the total number of distinct skills.
  const minSkillLevel = parseInt(configValues[2], 10); // X: The minimum required level for each skill.

  // Prepare an array to store the cost and skill contributions for each item.
  // Each entry will be an array like [itemCost, skill1_val, skill2_val, ..., skillM_val].
  let itemCostsAndSkills = [];
  for (let itemIdx = 1; itemIdx <= numItems; itemIdx++) {
    itemCostsAndSkills.push(
      rawData[itemIdx].split(" ").map((parsedValue) => parseInt(parsedValue, 10))
    );
  }

  // Initialize a variable to keep track of the minimum cost found so far.
  // Set it to a very high value initially, assuming no valid combination has been found.
  let minCostFound = 9999999;

  // Define a helper function to verify if all skill levels in an array meet the minimum requirement.
  function VerifySkillLevels(skillLevels) {
    // The `every` method checks if all elements in the `skillLevels` array satisfy the condition.
    return skillLevels.every((level) => level >= minSkillLevel);
  }

  // Iterate through all possible combinations of items using a bitmask approach.
  // There are 2^N possible combinations for N items.
  for (let combinationMask = 0; combinationMask < 1 << numItems; combinationMask++) {
    let currentCost = 0; // Variable to store the total cost for the current item combination.
    let selectedItems = []; // An array to hold the data of items chosen in this combination.

    // Examine each item to see if it's included in the current combination.
    for (let itemBit = 0; itemBit < numItems; itemBit++) {
      // If the 'itemBit'-th bit is set in the `combinationMask`, it means the item is selected.
      if (combinationMask & (1 << itemBit)) {
        selectedItems.push(itemCostsAndSkills[itemBit]);
      }
    }

    // Aggregate the costs and skill levels of all selected items.
    // The `aggregateArrays` function sums up corresponding elements across the selected item arrays.
    // The first element of the `aggregatedResult` will be the total cost,
    // and subsequent elements will be the combined skill levels.
    let aggregatedResult = aggregateArrays(selectedItems);

    // Proceed only if `aggregatedResult` is not false (meaning at least one item was selected).
    if (aggregatedResult) {
      currentCost = aggregatedResult[0]; // Extract the total cost from the aggregated result.
      // Extract the combined skill levels, which are all elements after the first one.
      // The original code uses `numItems + 1` as the end index for slicing.
      let combinedSkills = aggregatedResult.slice(1, numItems + 1);

      // Check if all combined skill levels meet the `minSkillLevel` requirement
      // AND if the `currentCost` is lower than the `minCostFound` so far.
      if (VerifySkillLevels(combinedSkills) && minCostFound > currentCost) {
        minCostFound = currentCost; // Update `minCostFound` with the new lower cost.
      }
    }

    // This block re-initializes `itemCostsAndSkills` to its original state for each iteration.
    // This behavior is preserved from the original code, even if it appears redundant.
    itemCostsAndSkills = [];
    for (let itemIdx = 1; itemIdx <= numItems; itemIdx++) {
      itemCostsAndSkills.push(
        rawData[itemIdx].split(" ").map((parsedValue) => parseInt(parsedValue, 10))
      );
    }
  }

  // After evaluating all possible combinations, output the final result.
  if (minCostFound == 9999999) {
    console.log("-1"); // If `minCostFound` is still the initial high value, no valid combination was found.
  } else {
    console.log(minCostFound); // Otherwise, print the lowest cost found.
  }
}

// Read the input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
