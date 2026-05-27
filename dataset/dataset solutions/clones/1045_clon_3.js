(function executeProgram() {
  const fileSystem = require('fs');
  const inputPath = '/dev/stdin';
  const rawInputContent = fileSystem.readFileSync(inputPath, 'utf8');
  let processedInputLines = rawInputContent.trim().split("\n");

  const [itemCount, partitionCount] = processedInputLines.shift().split(' ').map(Number);
  const weightsArray = processedInputLines.map(Number);

  let totalRemainingWeightSum = weightsArray.reduce((previousValue, currentValue) => previousValue + currentValue, 0);

  if (partitionCount === 1) {
    console.log(totalRemainingWeightSum);
    return;
  }

  const partitionSums = Array.from({ length: partitionCount }, () => 0);
  const partitionElements = Array.from({ length: partitionCount }, () => []);

  let currentPartitionIndex = 0;
  let maximumPartitionSum = 0;

  let currentAverageThreshold = totalRemainingWeightSum / partitionCount;

  for (const currentElement of weightsArray) {
    const currentPartitionAccumulatedSum = partitionSums[currentPartitionIndex];
    const comparisonValue = (2 * currentPartitionAccumulatedSum + currentElement);

    if (2 * currentAverageThreshold > comparisonValue) {
      // The current element can be added to the current partition without exceeding the average threshold.
    } else {
      // The current partition is "too heavy" or cannot accommodate the element based on the threshold.
      // Finalize the current partition and move to the next.
      maximumPartitionSum = Math.max(maximumPartitionSum, currentPartitionAccumulatedSum);
      currentPartitionIndex++;
    }

    // Recalculate the average threshold for the *next* iteration's decision.
    // This uses the 'totalRemainingWeightSum' (sum of elements from current to end)
    // and 'effectiveRemainingPartitionSlots' (partitions available after potential index increment).
    const effectiveRemainingPartitionSlots = partitionCount - currentPartitionIndex - 1;
    currentAverageThreshold = totalRemainingWeightSum / effectiveRemainingPartitionSlots;

    totalRemainingWeightSum -= currentElement;
    partitionSums[currentPartitionIndex] += currentElement;
    partitionElements[currentPartitionIndex].push(currentElement);
  }

  // After the loop, ensure the sum of the last partition is also considered for the maximum.
  maximumPartitionSum = Math.max(maximumPartitionSum, partitionSums[currentPartitionIndex]);

  console.log(maximumPartitionSum);
})();
