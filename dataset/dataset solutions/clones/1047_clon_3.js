const acquireInputData = () => require('fs').readFileSync('/dev/stdin', 'utf8');

const parseRawInputIntoLines = (rawContent) => rawContent.trim().split('\n');

const extractNumbersFromString = (numericString) => numericString.split(' ').map(Number);

const presentFinalResult = (value) => console.log(value);

(function executeDistributionLogic() {
  // Obtain the raw input data from standard input
  let rawInputData = acquireInputData();
  // Process the raw input into an array of individual lines
  let processedLines = parseRawInputIntoLines(rawInputData);

  // The first line contains two numbers: total item count (unused) and number of partitions (containers)
  let [itemQuantity, partitionCount] = extractNumbersFromString(processedLines.shift());

  // The remaining lines represent the weights of individual items
  let individualWeights = processedLines.map(Number);

  // Calculate the sum of all item weights, which is the total weight to be distributed
  let grandTotalWeight = 0;
  for (const weightValue of individualWeights) {
    grandTotalWeight += weightValue;
  }

  // If there's only one partition, no balancing is necessary; all items are in that single partition
  if (partitionCount === 1) {
    presentFinalResult(grandTotalWeight);
    return;
  }

  // Initialize two arrays:
  // 1. partitionWeightTotals: Stores the current sum of weights for each partition.
  // 2. partitionItemLists: Stores the actual list of item weights within each partition.
  let partitionWeightTotals = Array(partitionCount).fill(0);
  let partitionItemLists = Array(partitionCount).map(() => []);

  // Initially, all items are placed into the first partition
  partitionWeightTotals[0] = grandTotalWeight;
  // Use spread syntax to create a shallow copy of the individualWeights array for the first partition
  partitionItemLists[0] = [...individualWeights];

  // A flag to indicate if any item movement occurred during a complete iteration through all partition pairs
  let movementOccurredInCycle = true;

  // The main balancing loop continues as long as items are being moved between partitions
  do {
    movementOccurredInCycle = false; // Reset the flag at the start of each cycle

    // Iterate through adjacent pairs of partitions (from 0 to partitionCount - 2)
    for (let currentPartitionIndex = 0; currentPartitionIndex < partitionCount - 1; currentPartitionIndex++) {
      let currentPartitionContents = partitionItemLists[currentPartitionIndex];
      let nextPartitionContents = partitionItemLists[currentPartitionIndex + 1];

      // Identify potential items for movement based on the original algorithm's logic:
      // - The last item from the current partition (if moving right)
      // - The first item from the next partition (if moving left)
      let itemToMoveFromCurrentToEnd = currentPartitionContents.length > 0 ? currentPartitionContents[currentPartitionContents.length - 1] : undefined;
      let itemToMoveFromNextFromStart = nextPartitionContents.length > 0 ? nextPartitionContents[0] : undefined;

      // Heuristic 1: Check if moving an item from the current (left) partition to the next (right) partition
      // would help balance their sums. The condition implies the left partition is significantly heavier.
      if (itemToMoveFromCurrentToEnd !== undefined &&
          partitionWeightTotals[currentPartitionIndex] > partitionWeightTotals[currentPartitionIndex + 1] + itemToMoveFromCurrentToEnd / 2) {

        // Perform the item transfer:
        // 1. Remove the item from the end of the current partition
        let transferredWeight = currentPartitionContents.pop();
        // 2. Update the total weight for both partitions
        partitionWeightTotals[currentPartitionIndex] -= transferredWeight;
        partitionWeightTotals[currentPartitionIndex + 1] += transferredWeight;
        // 3. Add the item to the beginning of the next partition
        nextPartitionContents.unshift(transferredWeight);

        movementOccurredInCycle = true; // Mark that a movement occurred
      }
      // Heuristic 2: Check if moving an item from the next (right) partition to the current (left) partition
      // would help balance their sums. The condition implies the right partition is significantly heavier.
      else if (itemToMoveFromNextFromStart !== undefined &&
               partitionWeightTotals[currentPartitionIndex] + itemToMoveFromNextFromStart / 2 < partitionWeightTotals[currentPartitionIndex + 1]) {

        // Perform the item transfer:
        // 1. Remove the item from the beginning of the next partition
        let transferredWeight = nextPartitionContents.shift();
        // 2. Update the total weight for both partitions
        partitionWeightTotals[currentPartitionIndex + 1] -= transferredWeight;
        partitionWeightTotals[currentPartitionIndex] += transferredWeight;
        // 3. Add the item to the end of the current partition
        currentPartitionContents.push(transferredWeight);

        movementOccurredInCycle = true; // Mark that a movement occurred
      }
    }
  } while (movementOccurredInCycle); // Continue looping if any movements happened in the cycle

  // After the balancing process completes, find the maximum sum among all partitions.
  // Create a copy of the partition totals, sort them in descending order, and pick the first element.
  let sortedPartitionSums = [...partitionWeightTotals].sort((sumA, sumB) => sumB - sumA);
  let maximumPartitionLoad = sortedPartitionSums[0];

  // Display the final maximum partition load
  presentFinalResult(maximumPartitionLoad);

})();