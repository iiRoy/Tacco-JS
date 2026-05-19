function ProcessData(rawData) {
  // Split the incoming raw data string into individual lines.
  let processedInput = rawData.split("\n");

  // Parse the first line to determine the total number of items.
  let itemCount = parseInt(processedInput[0]);

  // Initialize two distinct arrays to hold item details.
  let collectionA = new Array(itemCount);
  let collectionB = new Array(itemCount);

  // Iterate through the input lines, starting from the second line, to populate the collections.
  for (let idx = 0; idx < itemCount; idx++) {
    // Split each line into its constituent parts.
    let tempParts = processedInput[idx + 1].split(" ");
    // Store the parsed numeric values along with the original index in both collections.
    collectionA[idx] = [parseInt(tempParts[0]), parseInt(tempParts[1]), idx];
    collectionB[idx] = [parseInt(tempParts[0]), parseInt(tempParts[1]), idx];
  }

  // Initialize variables to manage the processing state and accumulated sums.
  let toggleState = 0; // This variable alternates between 0 and 1 to switch processing logic.
  let sumValA = 0;     // Accumulator for values derived from collectionA.
  let sumValB = 0;     // Accumulator for values derived from collectionB.

  // Sort collectionA based on a specific comparison rule.
  collectionA.sort(compareByFirstThenSecond);
  // Sort collectionB using a different comparison rule.
  collectionB.sort(compareBySecondThenFirst);

  // Create an array to keep track of the indices of items that have already been processed.
  let processedIndices = new Array();

  // Main loop to process items, alternating between collectionA and collectionB.
  for (let idx = 0; idx < itemCount; idx++) {
    // Check the current state of the toggle.
    if (toggleState === 0) {
      // If the item at the front of collectionA has already been processed,
      if (processedIndices.indexOf(collectionA[0][2]) !== -1) {
        // remove items from the front until an unprocessed item is found.
        while (processedIndices.indexOf(collectionA[0][2]) !== -1) {
          collectionA.shift();
        }
      }
      // Add the first component of the current item to sumValA.
      sumValA += collectionA[0][0];
      // Flip the toggle state.
      toggleState = 1;
      // Record the original index of the processed item.
      processedIndices.push(collectionA[0][2]);
      // Remove the processed item from collectionA.
      collectionA.shift();
    } else {
      // If the item at the front of collectionB has already been processed,
      if (processedIndices.indexOf(collectionB[0][2]) !== -1) {
        // remove items from the front until an unprocessed item is found.
        while (processedIndices.indexOf(collectionB[0][2]) !== -1) {
          collectionB.shift();
        }
      }
      // Add the second component of the current item to sumValB.
      sumValB += collectionB[0][1];
      // Flip the toggle state.
      toggleState = 0;
      // Record the original index of the processed item.
      processedIndices.push(collectionB[0][2]);
      // Remove the processed item from collectionB.
      collectionB.shift();
    }
  }

  // Compute the final result by subtracting sumValB from sumValA.
  let finalResult = sumValA - sumValB;

  // Output the calculated final result to the console.
  console.log('%s', finalResult);
}

// This function is provided for debugging purposes, typically in a browser environment.
function testExecution() {
  let rawData = document.getElementById("input").value;
  ProcessData(rawData);
}

// Invoke the main processing function, reading input from standard input in a Node.js environment.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));

// Custom comparison function for sorting items.
// It prioritizes sorting by the first element in descending order,
// and then by the second element in descending order if the first elements are equal.
function compareByFirstThenSecond(itemX, itemY) {
  if (itemX[0] < itemY[0]) return 1; // itemX should come after itemY
  if (itemX[0] > itemY[0]) return -1; // itemX should come before itemY
  // If the first elements are identical, compare the second elements.
  if (itemX[1] < itemY[1]) return 1; // itemX should come after itemY
  if (itemX[1] > itemY[1]) return -1; // itemX should come before itemY
  return 0; // Both items are considered equal for sorting purposes.
}

// Another custom comparison function for sorting items.
// It prioritizes sorting by the second element in descending order,
// and then by the first element in descending order if the second elements are equal.
function compareBySecondThenFirst(itemX, itemY) {
  if (itemX[1] < itemY[1]) return 1; // itemX should come after itemY
  if (itemX[1] > itemY[1]) return -1; // itemX should come before itemY
  // If the second elements are identical, compare the first elements.
  if (itemX[0] < itemY[0]) return 1; // itemX should come after itemY
  if (itemX[0] > itemY[0]) return -1; // itemX should come before itemY
  return 0; // Both items are considered equal for sorting purposes.
}
