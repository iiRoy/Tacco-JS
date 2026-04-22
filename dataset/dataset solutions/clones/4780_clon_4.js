function computeSolutionCount(inputStringData) {
  const tokens = inputStringData.trim().split(' ');
  const upperLimit = Number(tokens[0]);
  const desiredTotal = Number(tokens[1]);

  let finalTally = 0;

  // The original problem counts triplets (x, y, z) such that:
  // 0 <= x <= upperLimit
  // 0 <= y <= upperLimit
  // 0 <= z <= upperLimit
  // x + y + z = desiredTotal

  // We can rephrase this by fixing the sum of x and y (let's call it currentXYSum).
  // Then z = desiredTotal - currentXYSum.
  // The condition 0 <= z <= upperLimit implies:
  // 0 <= desiredTotal - currentXYSum <= upperLimit

  // This breaks down into two inequalities for currentXYSum:
  // 1. desiredTotal - currentXYSum >= 0  =>  currentXYSum <= desiredTotal
  // 2. desiredTotal - currentXYSum <= upperLimit => currentXYSum >= desiredTotal - upperLimit

  // Additionally, since 0 <= x <= upperLimit and 0 <= y <= upperLimit,
  // the sum currentXYSum = x + y must be in the range [0, 2 * upperLimit].

  // Combining these, the valid range for currentXYSum is:
  const lowerBoundForXYSum = Math.max(0, desiredTotal - upperLimit);
  const upperBoundForXYSum = Math.min(desiredTotal, 2 * upperLimit);

  // Iterate through all possible sums for x + y
  for (let currentXYSum = lowerBoundForXYSum; currentXYSum <= upperBoundForXYSum; currentXYSum++) {
    // For a fixed currentXYSum, we need to count pairs (x, y) such that:
    // x + y = currentXYSum
    // 0 <= x <= upperLimit
    // 0 <= y <= upperLimit

    // From y = currentXYSum - x, the condition 0 <= y <= upperLimit implies:
    // 0 <= currentXYSum - x  =>  x <= currentXYSum
    // currentXYSum - x <= upperLimit => x >= currentXYSum - upperLimit

    // So, x must be in the range:
    // [Math.max(0, currentXYSum - upperLimit), Math.min(upperLimit, currentXYSum)]

    const xStart = Math.max(0, currentXYSum - upperLimit);
    const xEnd = Math.min(upperLimit, currentXYSum);

    // The number of integers in this range (inclusive) is end - start + 1.
    const countForThisSum = xEnd - xStart + 1;
    finalTally += countForThisSum;
  }

  process.stdout.write(String(finalTally) + '\n');
}

(function() {
  const suppliedData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
  computeSolutionCount(suppliedData);
})();