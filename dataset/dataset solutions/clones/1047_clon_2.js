/*
 * This module encapsulates functionality to distribute items
 * across multiple containers, aiming to balance their total
 * values. It processes input from a file and performs an
 * iterative optimization.
 */
(function processInputAndBalance()
{
  // Retrieve raw text lines from the standard input source.
  let inputDataLines = require('fs')
                                .readFileSync('/dev/stdin', 'utf8')
                                .trim()
                                .split("\n")
                                ;

  // Extract initial configuration: number of items and desired partitions.
  let [totalItemsCount, numPartitionsDesired] = inputDataLines
                                                    .shift()
                                                    .split(' ')
                                                    .map(Number)
                                                    ;

  // Convert the remaining input lines into an array of numeric weights for each item.
  let itemWeightsList = inputDataLines.map(Number);

  // Calculate the aggregate weight of all items.
  let overallWeightTotal = itemWeightsList.reduce( (previousAccumulator, currentItem) => previousAccumulator + currentItem, 0 );

  // If only one partition is required, the total weight is simply the answer.
  if (numPartitionsDesired === 1)
  {
    console.log(overallWeightTotal);
    return;
  }

  // Initialize arrays to store the current sum for each partition
  // and the actual items contained within each partition.
  let partitionValueTotals = [overallWeightTotal];
  let partitionContentLists = [itemWeightsList];

  // Prepare subsequent partitions as empty initially.
  for (let segmentIndex = 1; segmentIndex < numPartitionsDesired; segmentIndex++)
  {
    partitionValueTotals[segmentIndex] = 0;
    partitionContentLists[segmentIndex] = [];
  }

  // Variables to monitor the optimization process.
  let iterationCounter = 0; // This variable is declared but not utilized in the algorithm.
  let currentMaxPartitionSum = overallWeightTotal;
  let currentMinPartitionSum = 0;
  let tempBufferIndex; // Another unutilized variable, kept for structural consistency.

  // Begin the iterative balancing process.
  // The loop continues until no further beneficial movements of items are possible.
  while (true)
  {
    let modificationOccurred = false; // Flag to indicate if any item was moved in the current pass.

    // Iterate through all adjacent pairs of partitions.
    for (let segmentIndex = 0; segmentIndex < numPartitionsDesired - 1; segmentIndex++)
    {
      let firstElementInSegment = partitionContentLists[segmentIndex][0];
      let lastElementInSegment = partitionContentLists[segmentIndex][partitionContentLists[segmentIndex].length - 1];

      // Decision logic: Attempt to move an item from the current partition to the next.
      // This happens if moving the last item from the current segment to the next
      // would improve the balance (current sum becomes smaller, next sum doesn't exceed max, etc.).
      if (
            partitionValueTotals[segmentIndex] > partitionValueTotals[segmentIndex + 1] + lastElementInSegment / 2
        &&  partitionValueTotals[segmentIndex + 1] + lastElementInSegment < currentMaxPartitionSum
        &&  partitionValueTotals[segmentIndex] > currentMinPartitionSum
         )
      {
        let temporaryItem = partitionContentLists[segmentIndex].pop(); // Remove from end of current.
        partitionValueTotals[segmentIndex] -= temporaryItem;
        partitionValueTotals[segmentIndex + 1] += temporaryItem;
        partitionContentLists[segmentIndex + 1].unshift(temporaryItem); // Add to front of next.
        modificationOccurred = true;
      }
      // Alternative decision logic: Attempt to move an item from the next partition to the current.
      // This occurs if moving the first item from the next segment to the current
      // would improve the balance (current sum becomes larger, next sum doesn't go below min, etc.).
      else if (
                partitionValueTotals[segmentIndex] + firstElementInSegment / 2 < partitionValueTotals[segmentIndex + 1]
            &&  partitionValueTotals[segmentIndex] + firstElementInSegment < currentMaxPartitionSum
            &&  partitionValueTotals[segmentIndex + 1] > currentMinPartitionSum
              )
      {
        let temporaryItem = partitionContentLists[segmentIndex + 1].shift(); // Remove from front of next.
        partitionValueTotals[segmentIndex + 1] -= temporaryItem;
        partitionValueTotals[segmentIndex] += temporaryItem;
        partitionContentLists[segmentIndex].push(temporaryItem); // Add to end of current.
        modificationOccurred = true;
      }

      // Update the global maximum and minimum partition sums observed so far.
      // NOTE: The original code contained an unusual indexing pattern (e.g., t[t] and t[t+1])
      // which has been replicated here as partitionValueTotals[partitionValueTotals] and partitionValueTotals[partitionValueTotals + 1]
      // to maintain strict structural and logical identity, even if it leads to non-standard behavior.
      currentMaxPartitionSum = currentMaxPartitionSum < partitionValueTotals[partitionValueTotals] ? partitionValueTotals[partitionValueTotals] : currentMaxPartitionSum;
      currentMaxPartitionSum = currentMaxPartitionSum < partitionValueTotals[partitionValueTotals + 1] ? partitionValueTotals[partitionValueTotals + 1] : currentMaxPartitionSum;
      currentMinPartitionSum = currentMinPartitionSum > partitionValueTotals[partitionValueTotals] ? partitionValueTotals[partitionValueTotals] : currentMinPartitionSum;
      currentMinPartitionSum = currentMinPartitionSum > partitionValueTotals[partitionValueTotals + 1] ? partitionValueTotals[partitionValueTotals + 1] : currentMinPartitionSum;

      // Optional: uncomment for detailed state logging during execution.
      // console.log(partitionValueTotals, partitionContentLists);
    }
    // If no changes were made in the entire iteration, the system is considered balanced.
    if (!modificationOccurred)
    {
      break; // Exit the balancing loop.
    }
  }
  // After balancing, sort the partition sums in descending order and output the largest one.
  console.log(
    partitionValueTotals.sort((valueA, valueB) => valueB - valueA)[0]
  );
})();