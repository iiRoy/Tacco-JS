function ProcessInput(rawData) {
  // Split the raw input data into individual lines.
  rawData = rawData.split('\n');

  // Parse the dimensions of the grid from the first line.
  const initialLineParts = rawData[0].split(' ');
  const gridHeight = Number.parseInt(initialLineParts[0], 10);
  const gridWidth = Number.parseInt(initialLineParts[1], 10);

  // Initialize a 10x10 matrix to store the costs of transforming one digit to another.
  // Each row `costAdjacencyMatrix[r]` represents the costs to transform digit `r` to other digits.
  const costAdjacencyMatrix = new Array(10);
  for (let rIdx = 0; rIdx < 10; rIdx++) {
    const costRowStrings = rawData[rIdx + 1].split(' ');
    costAdjacencyMatrix[rIdx] = [
      Number.parseInt(costRowStrings[0], 10),
      Number.parseInt(costRowStrings[1], 10),
      Number.parseInt(costRowStrings[2], 10),
      Number.parseInt(costRowStrings[3], 10),
      Number.parseInt(costRowStrings[4], 10),
      Number.parseInt(costRowStrings[5], 10),
      Number.parseInt(costRowStrings[6], 10),
      Number.parseInt(costRowStrings[7], 10),
      Number.parseInt(costRowStrings[8], 10),
      Number.parseInt(costRowStrings[9], 10),
    ];
  }

  // Initialize an array to count the occurrences of each digit in the input grid.
  const digitFrequencyCounts = new Array(10).fill(0);
  for (let rowNum = 0; rowNum < gridHeight; rowNum++) {
    const gridRowStrings = rawData[rowNum + 11].split(' ');
    for (let colNum = 0; colNum < gridWidth; colNum++) {
      const currentDigit = Number.parseInt(gridRowStrings[colNum], 10);
      // Only count valid digits (non-negative, assuming they are 0-9).
      if (currentDigit >= 0) {
        digitFrequencyCounts[currentDigit]++;
      }
    }
  }

  // This array seems to be unused in the original logic, but we clone it.
  // It stores the direct cost from each digit to digit '1'.
  const directCostsToTargetOne = new Array(10);
  for (let k = 0; k < 10; k++) {
    directCostsToTargetOne[k] = costAdjacencyMatrix[k][1];
  }

  // Initialize the total accumulated minimum cost.
  let totalCalculatedCost = 0;

  // Iterate through each possible starting digit (0-9) to find the minimum cost to transform it to '1'.
  for (let startDigit = 0; startDigit < 10; startDigit++) {
    // `shortestPathCosts` will store the minimum cost to reach each digit from `startDigit`.
    // Each element is `[digit_value, min_cost_from_start_digit]`.
    const shortestPathCosts = new Array(10);
    for (let targetDigit = 0; targetDigit < 10; targetDigit++) {
      shortestPathCosts[targetDigit] = [targetDigit, 10000]; // 10000 acts as infinity
    }
    // The cost to reach the `startDigit` from itself is 0.
    shortestPathCosts[startDigit][1] = 0;

    // `remainingNodes` is a list of digits that have not yet been processed (visited).
    const remainingNodes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    // Only proceed if the current `startDigit` exists in the grid and is not already '1'.
    // The condition `startDigit !== 1` implies we only calculate paths for digits that need changing.
    if (digitFrequencyCounts[startDigit] !== 0 && startDigit !== 1) {
      let currentProcessingNode = startDigit;

      // This loop implements a variation of Dijkstra's algorithm.
      while (remainingNodes.length > 0) {
        let minimumPathValue = 10000; // Initialize with a large value
        let nextProcessingNode; // Stores the digit to be processed next

        // Iterate through all unvisited nodes to update their shortest path costs
        // and find the next node with the minimum cost.
        for (let nodeIndex = 0; nodeIndex < remainingNodes.length; nodeIndex++) {
          const neighborDigit = remainingNodes[nodeIndex];

          // Relax edges: if a shorter path to `neighborDigit` is found through `currentProcessingNode`.
          if (shortestPathCosts[currentProcessingNode][1] + costAdjacencyMatrix[currentProcessingNode][neighborDigit] < shortestPathCosts[neighborDigit][1]) {
            shortestPathCosts[neighborDigit][1] = shortestPathCosts[currentProcessingNode][1] + costAdjacencyMatrix[currentProcessingNode][neighborDigit];
          }

          // Find the unvisited node with the smallest known distance from the source.
          // The condition `shortestPathCosts[neighborDigit][1] !== 0` is unusual for Dijkstra,
          // but it's part of the original logic, preventing nodes with 0 cost from being chosen as `nextProcessingNode`.
          // The condition `remainingNodes[nodeIndex] !== currentProcessingNode` ensures we don't pick the current node itself.
          if (shortestPathCosts[neighborDigit][1] < minimumPathValue && shortestPathCosts[neighborDigit][1] !== 0 && remainingNodes[nodeIndex] !== currentProcessingNode) {
            minimumPathValue = shortestPathCosts[neighborDigit][1];
            nextProcessingNode = neighborDigit;
          }
        }

        // Remove the `currentProcessingNode` from the set of unvisited nodes.
        remainingNodes.splice(remainingNodes.indexOf(currentProcessingNode), 1);
        // Set the `nextProcessingNode` as the new `currentProcessingNode` for the next iteration.
        currentProcessingNode = nextProcessingNode;
      }

      // Add the total cost for this `startDigit` to the overall sum.
      // This is the minimum cost to transform `startDigit` to '1', multiplied by its frequency.
      totalCalculatedCost += shortestPathCosts[1][1] * digitFrequencyCounts[startDigit];
    }
  }

  // Output the final calculated total minimum cost.
  console.log('%s', totalCalculatedCost);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
