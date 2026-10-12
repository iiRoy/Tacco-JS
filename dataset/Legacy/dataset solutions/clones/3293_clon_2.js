// This function processes the input string to calculate the minimum cost
// to traverse a series of stones, following specific jump rules.
function ProcessInputData(rawData) {
  // Split the entire input string into an array of individual lines.
  const inputLines = rawData.split("\n");

  // The first line contains two space-separated integers:
  // totalStones (N) and maxStepSize (K).
  const firstLineValues = inputLines[0].split(" ");
  const totalStones = Number(firstLineValues[0]); // Convert string to number for N
  const maxStepSize = Number(firstLineValues[1]); // Convert string to number for K

  // The second line contains N space-separated integers representing
  // the heights of the stones.
  const stoneHeights = inputLines[1].split(" ").map(heightString => Number(heightString));

  // Initialize a dynamic programming array to store the minimum cost
  // to reach each stone. Fill with a very large number (infinity) initially.
  const minimumCosts = new Array(totalStones).fill(Number.POSITIVE_INFINITY);

  // The cost to reach the first stone (index 0) is always zero.
  minimumCosts[0] = 0x0; // Using hexadecimal literal for 0

  // Iterate from the second stone up to the last stone.
  for (let currentStoneIndex = 0b1; currentStoneIndex < totalStones; currentStoneIndex++) { // Using binary literal for 1
    // For each current stone, consider all possible previous stones
    // from which we could have jumped.
    // The previous stone must be within the allowed jump distance (maxStepSize)
    // and its index must not be negative.
    for (let previousStoneIndex = currentStoneIndex - 0b1; previousStoneIndex >= currentStoneIndex - maxStepSize; previousStoneIndex--) {
      // Calculate the cost to reach the current stone from the previous stone:
      // cost_to_prev_stone + absolute_difference_in_heights.
      // Update minimumCosts[currentStoneIndex] if this path is cheaper.
      minimumCosts[currentStoneIndex] = Math.min(
        minimumCosts[currentStoneIndex],
        minimumCosts[previousStoneIndex] + Math.abs(stoneHeights[previousStoneIndex] - stoneHeights[currentStoneIndex])
      );

      // Special condition: if we just processed the very first stone (index 0),
      // we break out of the inner loop. This implies that no jumps *before*
      // the first stone are considered, and once the first stone is processed
      // as a 'previous' stone, we don't need to look further back for this 'currentStoneIndex'.
      if (previousStoneIndex === 0x0) { // Using hexadecimal literal for 0
        break;
      }
    }
  }

  // After calculating all minimum costs, the result is the cost to reach
  // the very last stone in the sequence.
  console.log(minimumCosts[minimumCosts.length - 0b1]); // Using binary literal for 1
}

// Read the entire content of standard input synchronously,
// using UTF-8 encoding, and pass it to the processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
