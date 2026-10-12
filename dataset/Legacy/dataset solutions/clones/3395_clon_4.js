"use strict";

// Helper function to parse numbers from a line, similar to original's splitNum
function parseNumericLine(lineContent) {
  // Using Number constructor for parsing, which is equivalent to parseInt for base 10
  return lineContent.split(/\s+/).map(Number);
}

// Helper function to find potential complements that sum to a power of 2.
// This replaces the original 'diffs' function.
function findPowerComplements(currentValue) {
  const possibleComplements = [];
  // Iterate through powers of 2, up to the maximum specified in the original logic (2 * 1e9)
  for (let powerOfTwo = 2; powerOfTwo <= 2000000000; powerOfTwo *= 2) {
    const complementCandidate = powerOfTwo - currentValue;
    // Only consider positive complements, as per original 'd > 0' check
    if (complementCandidate > 0) {
      possibleComplements.push(complementCandidate);
    }
  }
  return possibleComplements;
}

// Main function to process input and calculate the result.
// This replaces the original 'main' function and its nested 'rec' function.
function processInputAndCalculate(rawData) {
  const inputLines = rawData.split('\n');
  const itemCount = parseInt(inputLines[0], 10);
  // Parse numbers from the second line and slice to 'itemCount'
  const initialNumbers = parseNumericLine(inputLines[1]).slice(0, itemCount);

  // Use a Map to store frequencies of numbers. This is similar to the original's 'map'.
  const numberFrequencies = new Map();
  for (const num of initialNumbers) {
    numberFrequencies.set(num, (numberFrequencies.get(num) || 0) + 1);
  }

  let totalMinimumCuts = 0;

  // To avoid issues with modifying the Map during iteration,
  // we get a static list of unique numbers present initially.
  const uniqueNumbersPresent = Array.from(numberFrequencies.keys());

  // Iterate through each unique number that was initially in the input.
  // This outer loop ensures that all connected components are processed.
  for (const startNodeValue of uniqueNumbersPresent) {
    // While there are still instances of this 'startNodeValue' available
    // (i.e., not yet used in a component), start a new component traversal.
    while (numberFrequencies.get(startNodeValue) > 0) {
      // Perform a Breadth-First Search (BFS) to find a connected component
      // and partition its nodes into two sets (bipartite coloring).
      const traversalQueue = [];
      const nodePartitionColors = new Map(); // Stores 0 or 1 for partition assignment within this component
      const currentPartitionCounts = [0, 0]; // Counts for nodes in partition 0 and partition 1

      // Decrement the frequency of the starting node as one instance is now "used"
      // to initiate this component's traversal. This replaces the 'remove' call.
      numberFrequencies.set(startNodeValue, numberFrequencies.get(startNodeValue) - 1);
      if (numberFrequencies.get(startNodeValue) === 0) {
        numberFrequencies.delete(startNodeValue);
      }

      // Initialize BFS: add the starting node to the queue, assign it to partition 0.
      traversalQueue.push(startNodeValue);
      nodePartitionColors.set(startNodeValue, 0);
      currentPartitionCounts[0] += 1;

      let queueHeadIndex = 0;
      // Process nodes from the queue until it's empty
      while (queueHeadIndex < traversalQueue.length) {
        const currentNode = traversalQueue[queueHeadIndex++];
        const currentNodeColor = nodePartitionColors.get(currentNode);

        const potentialNeighbors = findPowerComplements(currentNode);

        // Explore all potential neighbors (complements) for the current node
        for (const neighborCandidate of potentialNeighbors) {
          // Check if this neighbor exists in the remaining frequencies and has available instances
          if (numberFrequencies.has(neighborCandidate) && numberFrequencies.get(neighborCandidate) > 0) {
            // If the neighbor has not been assigned a color yet in this component traversal,
            // it means it's a new node for this component.
            if (!nodePartitionColors.has(neighborCandidate)) {
              // Decrement its frequency as one instance is now "used" for this component.
              // This mimics the 'remove' behavior from the original.
              numberFrequencies.set(neighborCandidate, numberFrequencies.get(neighborCandidate) - 1);
              if (numberFrequencies.get(neighborCandidate) === 0) {
                numberFrequencies.delete(neighborCandidate);
              }

              // Assign the neighbor to the opposite partition color.
              const neighborColor = 1 - currentNodeColor;
              nodePartitionColors.set(neighborCandidate, neighborColor);
              currentPartitionCounts[neighborColor] += 1;
              traversalQueue.push(neighborCandidate); // Add to queue for further exploration
            }
            // If the neighbor has already been colored, we don't need to re-process it.
            // The problem structure implies the graph formed is bipartite, so no explicit
            // bipartiteness check is needed here.
          }
        }
      }
      // After the BFS completes for a component, add the minimum of the two partition counts
      // to the total result. This is equivalent to the original 'Math.min(left, right)'.
      totalMinimumCuts += Math.min(currentPartitionCounts[0], currentPartitionCounts[1]);
    }
  }

  // Output the final result to console, as per original behavior.
  console.log(totalMinimumCuts);
}

// Read input from stdin and pass it to the main processing function.
processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
