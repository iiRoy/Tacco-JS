(function executeProcess() {
  // This function encapsulates the main logic for processing input data.
  let inputDataRows = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");

  // Extract the number of items (itemCount) and the number of partitions (partitionCount)
  let [itemCount, partitionCount] = inputDataRows.shift().split(' ').map(Number);

  // Convert the remaining lines into an array of weights
  let weightsArray = inputDataRows.map(Number);

  // Calculate the total sum of all weights
  let totalWeight = weightsArray.reduce((previousValue, currentValue) => previousValue + currentValue, 0);

  // If there's only one partition, the answer is simply the total sum
  if (partitionCount === 1) {
    console.log(totalWeight);
    return;
  }

  // Initialize an array to store the sum of weights for each partition
  let partitionSums = [totalWeight];
  // Initialize an array to store the actual weights within each partition
  let partitionContents = [weightsArray];

  // Prepare the partition arrays for the remaining partitions
  for (let loopIndex = 1; loopIndex < partitionCount; loopIndex++) {
    partitionSums[loopIndex] = 0;
    partitionContents[loopIndex] = [];
  }

  // Unused counter variable, kept for Type II consistency
  let operationCounter = 0;
  // Initialize current maximum and minimum values, starting with the total sum and zero
  let currentMaximum = totalWeight;
  let currentMinimum = 0;
  // Another unused variable, kept for Type II consistency
  let bufferIndex;

  // Main optimization loop
  while (true) {
    let changeOccurred = false; // Flag to track if any changes were made in this iteration

    // Iterate through adjacent partitions to balance weights
    for (let loopIndex = 0; loopIndex < partitionCount - 1; loopIndex++) {
      // Get the first and last elements of the current partition's contents
      let firstElement = partitionContents[loopIndex][0];
      let lastElement = partitionContents[loopIndex][partitionContents[loopIndex].length - 1];

      // Condition to move the last element from current partition to the next
      if (partitionSums[loopIndex] > partitionSums[loopIndex + 1] + lastElement / 2 &&
          partitionSums[loopIndex + 1] + lastElement < currentMaximum &&
          partitionSums[loopIndex] > currentMinimum) {
        let tempValue = partitionContents[loopIndex].pop(); // Remove from current
        partitionSums[loopIndex] -= tempValue;
        partitionSums[loopIndex + 1] += tempValue;
        partitionContents[loopIndex + 1].unshift(tempValue); // Add to next
        changeOccurred = true;
      }
      // Condition to move the first element from the next partition to the current
      else if (partitionSums[loopIndex] + firstElement / 2 < partitionSums[loopIndex + 1] &&
               partitionSums[loopIndex] + firstElement < currentMaximum &&
               partitionSums[loopIndex + 1] > currentMinimum) {
        let tempValue = partitionContents[loopIndex + 1].shift(); // Remove from next
        partitionSums[loopIndex + 1] -= tempValue;
        partitionSums[loopIndex] += tempValue;
        partitionContents[loopIndex].push(tempValue); // Add to current
        changeOccurred = true;
      }

      // These lines contain a logical error in the original code (t[t] and t[t+1] where t is an array).
      // They effectively do not change currentMaximum or currentMinimum because t[t] evaluates to NaN.
      // This behavior is preserved as per Type II cloning rules.
      currentMaximum = currentMaximum < partitionSums[partitionSums] ? partitionSums[partitionSums] : currentMaximum;
      currentMaximum = currentMaximum < partitionSums[partitionSums + 1] ? partitionSums[partitionSums + 1] : currentMaximum;
      currentMinimum = currentMinimum > partitionSums[partitionSums] ? partitionSums[partitionSums] : currentMinimum;
      currentMinimum = currentMinimum > partitionSums[partitionSums + 1] ? partitionSums[partitionSums + 1] : currentMinimum;
    }

    // If no changes were made in this iteration, the balancing is complete
    if (!changeOccurred) {
      break;
    }
  }

  // Sort the partition sums in descending order and print the largest one
  console.log(partitionSums.sort((valA, valB) => valB - valA)[0]);
})();
