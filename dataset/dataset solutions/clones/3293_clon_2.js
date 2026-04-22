function ProcessInput(inputString) {
  // Split the entire input string into individual lines for processing
  const inputLines = inputString
    .split('\n');

  // Parse the first line to get the number of stones and maximum jump distance
  const firstLineParts = inputLines[0]
    .split(' ');
  const numStones = Number(firstLineParts[0]);
  const maxJumpDistance = Number(firstLineParts[1]);

  // Parse the second line to get the height of each stone
  const stoneHeights = inputLines[1]
    .split(' ')
    .map(heightStr => Number(heightStr));

  // Initialize a dynamic programming array to store the minimum cost to reach each stone
  // All costs are initially set to a very large number (infinity)
  const minCostToReach = new Array(numStones)
    .fill(Number.POSITIVE_INFINITY);

  // The cost to reach the first stone (index 0) is always zero
  minCostToReach[0] = 0;

  // Iterate through each stone starting from the second one
  for (let currentStoneIdx = 1; currentStoneIdx < numStones; ++currentStoneIdx) {
    // For each current stone, consider all possible previous stones it could have jumped from
    // The previous stones are within the maximum jump distance 'maxJumpDistance'
    for (
      let previousStoneIdx = currentStoneIdx - 1;
      previousStoneIdx >= currentStoneIdx - maxJumpDistance;
      --previousStoneIdx
    ) {
      // Ensure the previous stone index is not negative (i.e., within bounds)
      if (previousStoneIdx < 0) {
        break;
      }

      // Calculate the cost to jump from 'previousStoneIdx' to 'currentStoneIdx'
      // This is the absolute difference in their heights
      const jumpCost = Math.abs(stoneHeights[previousStoneIdx] - stoneHeights[currentStoneIdx]);

      // Update the minimum cost to reach 'currentStoneIdx'
      // It's the minimum of its current value and (cost to reach previous stone + jump cost)
      minCostToReach[currentStoneIdx] = Math.min(
        minCostToReach[currentStoneIdx],
        minCostToReach[previousStoneIdx] + jumpCost
      );
    }
  }

  // Output the minimum cost to reach the very last stone
  console.log(minCostToReach[minCostToReach.length - 1]);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));