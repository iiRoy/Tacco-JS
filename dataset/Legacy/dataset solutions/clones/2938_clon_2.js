function ProcessInputData(rawData) {
  // Split the entire input string into an array of lines.
  let lineSegments = rawData.split("\n");

  // Parse the initial counts from the first line.
  let firstLineParts = lineSegments[0].split(" ");
  let initialCount = parseInt(firstLineParts[0], 10); // N
  let additionalCount = parseInt(firstLineParts[1], 10); // M

  // This variable is declared but not used in the original logic.
  // It's kept to preserve the exact executable logic structure.
  let unusedVariable = 0;

  // Create an array to store all item details.
  // The size is N + M to accommodate all items.
  let itemDetails = new Array(initialCount + additionalCount);

  // Populate the array with initial items (from the second line).
  // These items always have a quantity of 1.
  let initialItemValues = lineSegments[1].split(" ");
  for (let k = 0; k < initialCount; k++) {
    let singleItemVal = parseInt(initialItemValues[k], 10);
    itemDetails[k] = [1, singleItemVal]; // [quantity, value]
  }

  // Populate the array with additional items (from subsequent lines).
  // These items have varying quantities and values.
  for (let k = 0; k < additionalCount; k++) {
    let currentLineParts = lineSegments[k + 2].split(" ");
    let batchSize = parseInt(currentLineParts[0], 10);
    let batchVal = parseInt(currentLineParts[1], 10);
    itemDetails[k + initialCount] = [batchSize, batchVal]; // [quantity, value]
  }

  // Sort the item details array in descending order based on item value.
  // If values are equal, their relative order doesn't matter for the sum.
  itemDetails.sort(function(firstItem, secondItem) {
    if (firstItem[1] < secondItem[1]) return 1; // second item has higher value, so first item comes after
    if (firstItem[1] > secondItem[1]) return -1; // first item has higher value, so first item comes before
    return 0; // values are equal
  });

  let totalValue = 0; // Accumulator for the total value of items taken.
  let currentQuantity = 0; // Counter for the total number of items taken.

  // Iterate through the sorted items to select up to 'initialCount' items.
  // The loop condition `k < initialCount` is from the original code,
  // implying we only consider up to N items from the sorted list,
  // even if more are available. This is a subtle point of the original algorithm.
  for (let k = 0; k < initialCount; k++) {
    // If we can take all items from the current batch without exceeding 'initialCount'.
    if (currentQuantity + itemDetails[k][0] <= initialCount) {
      totalValue += itemDetails[k][1] * itemDetails[k][0];
      currentQuantity += itemDetails[k][0];
    }
    // If we can take at least one more item, but not necessarily the whole batch.
    else if (currentQuantity + 1 <= initialCount) {
      // Take only the remaining items needed to reach 'initialCount'.
      totalValue += itemDetails[k][1] * (initialCount - currentQuantity);
      currentQuantity = initialCount; // We have now reached the target quantity.
    }
    // If we cannot take any more items (currentQuantity is already 'initialCount').
    else {
      break; // Exit the loop as we've taken enough items.
    }
  }

  // Output the final calculated total value.
  console.log('%s', totalValue);
  return totalValue; // Return the result.
}

// This function is for local debugging/testing in a browser environment.
// It's not part of the main execution flow in Node.js.
function testSolution(testCaseNum) {
  let testInput = document.getElementById("input" + testCaseNum).value;
  let computedAnswer = ProcessInputData(testInput);
  let testOutcome = "WA"; // Assume Wrong Answer initially.

  // Compare the computed answer with the expected output.
  if (computedAnswer == document.getElementById("output" + testCaseNum).value.split("\n")[0]) {
    testOutcome = "AC"; // If they match, it's Accepted.
  }
  // Display the test outcome.
  document.getElementById("result" + testCaseNum).innerHTML = testOutcome;
}

// Main execution block for Node.js environment.
// Reads input from standard input and passes it to the primary function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
