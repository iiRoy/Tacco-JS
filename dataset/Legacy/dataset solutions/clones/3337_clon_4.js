'use strict';
(function(input){
  input = input.trim().split(/\s+/).map(x => x - 0);
  const childCount = input.shift();
  const totalCandies = input.shift();
  const modulus = Math.pow(10, 9) + 7;
  const capacities = input;

  // currentWays[k] stores the number of ways to distribute exactly 'k' candies
  // among the children processed up to the previous iteration.
  // Initialize for the "zero children" case (conceptually childIndex = -1):
  // There's 1 way to distribute 0 candies (give 0 to 0 children), and 0 ways for any other amount.
  let currentWays = new Array(totalCandies + 1).fill(0);
  currentWays[0] = 1;

  // Iterate through each child from the first (index 0) to the last.
  for (let cIdx = 0; cIdx < childCount; cIdx++) {
    const childCapacity = capacities[cIdx];
    // nextWays will store the results for the current child (cIdx).
    let nextWays = new Array(totalCandies + 1).fill(0);

    // Calculate prefix sums of currentWays. This allows efficient computation
    // of the sum of ways for the previous children.
    // prevWaysPrefixSum[k] = sum(currentWays[j] for j=0 to k)
    let prevWaysPrefixSum = new Array(totalCandies + 1).fill(0);
    prevWaysPrefixSum[0] = currentWays[0];
    for (let k = 1; k <= totalCandies; k++) {
      prevWaysPrefixSum[k] = (prevWaysPrefixSum[k - 1] + currentWays[k]) % modulus;
    }

    // For each possible total candy count 'k', calculate the number of ways
    // to distribute 'k' candies among children up to 'cIdx'.
    for (let k = 0; k <= totalCandies; k++) {
      // The number of ways to distribute exactly 'k' candies among children 0 to 'cIdx'
      // is the sum of ways to distribute 'k - j' candies among children 0 to 'cIdx-1',
      // where 'j' is the number of candies given to child 'cIdx' (0 <= j <= childCapacity).
      // This sum can be expressed using prefix sums:
      // sum(currentWays[k-j] for j=0 to childCapacity)
      // = prevWaysPrefixSum[k] - prevWaysPrefixSum[k - childCapacity - 1]
      
      let lowerBoundIndex = k - childCapacity - 1;
      let waysToSubtract = (lowerBoundIndex >= 0) ? prevWaysPrefixSum[lowerBoundIndex] : 0;
      
      nextWays[k] = (prevWaysPrefixSum[k] - waysToSubtract + modulus) % modulus;
    }
    // Update currentWays to be nextWays for the next iteration.
    currentWays = nextWays;
  }

  // After processing all children, currentWays[totalCandies] holds the
  // number of ways to distribute exactly 'totalCandies' among all children.
  console.log(currentWays[totalCandies]);
})(require('fs').readFileSync('/dev/stdin','utf8'));
