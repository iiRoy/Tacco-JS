'use strict'
function ProcessItems(inputPayload) {
  const MOD_VAL = 998244353;
  
  const allNumericValues = inputPayload.trim().split(/\s+/).map(Number);
  const totalItemCount = allNumericValues.shift();
  const itemScores = allNumericValues;
  
  const overallScoreSum = itemScores.reduce((currentSum, score) => currentSum + score, 0);
  const maximumHalfSum = Math.floor(overallScoreSum / 2);
  
  // First calculation phase: Determine ways to form a sum 's' using a subset of items,
  // where each chosen item can be one of two distinct categories (e.g., Green or Blue).
  // Items not chosen for these two categories are implicitly assigned to a third category (e.g., Red).
  // This dynamic programming approach uses a Map to track counts for possible sums.
  let currentTwoCategorySumCounts = new Map(); // Represents the DP state for 'i' items processed
  currentTwoCategorySumCounts.set(0, 1); // Base case: a sum of 0 can be formed in 1 way (by choosing no items)
  
  for (let i = 0; i < totalItemCount; i++) {
    const currentItemScore = itemScores[i];
    let nextTwoCategorySumCounts = new Map(); // Represents the DP state for 'i+1' items processed
    
    // Iterate through all sums 's' that could be formed by the first 'i' items
    for (const [s, count] of currentTwoCategorySumCounts.entries()) {
      // Scenario 1: The current item (itemScores[i]) is NOT included in the sum 's'.
      // In this case, the count 'c' for sum 's' from the previous step carries over.
      nextTwoCategorySumCounts.set(s, (nextTwoCategorySumCounts.get(s) || 0) + count);

      // Scenario 2: The current item (itemScores[i]) IS included in the sum.
      // This creates a new sum 's + currentItemScore'.
      // Since the chosen item can be one of two categories, the count 'c' is doubled.
      const potentialNewSum = s + currentItemScore;
      if (potentialNewSum <= maximumHalfSum) { // Only consider sums up to maximumHalfSum
        nextTwoCategorySumCounts.set(potentialNewSum, (nextTwoCategorySumCounts.get(potentialNewSum) || 0) + (2 * count));
      }
    }
    
    // Apply modulo to all accumulated counts for the next DP state
    for (const [s, count] of nextTwoCategorySumCounts.entries()) {
      nextTwoCategorySumCounts.set(s, count % MOD_VAL);
    }
    
    currentTwoCategorySumCounts = nextTwoCategorySumCounts; // Update for the next iteration
  }
  
  let totalTwoCategoryWaysBelowHalf = 0;
  for (const count of currentTwoCategorySumCounts.values()) {
    totalTwoCategoryWaysBelowHalf = (totalTwoCategoryWaysBelowHalf + count) % MOD_VAL;
  }
  
  // Calculate initial total possibilities: Each of N items can be assigned to 3 categories.
  let finalOutcome = 1;
  for (let i = 0; i < totalItemCount; i++) {
    finalOutcome = (finalOutcome * 3) % MOD_VAL;
  }
  
  // Subtract terms based on the inclusion-exclusion principle.
  // This subtracts cases where Sum(Category1) + Sum(Category2) <= maximumHalfSum,
  // multiplied by 3 due to symmetry for (G,B), (G,R), (B,R) pairs.
  finalOutcome = (finalOutcome - (3 * totalTwoCategoryWaysBelowHalf) % MOD_VAL + MOD_VAL) % MOD_VAL;
  
  // Second calculation phase: Determine ways to form a sum 's' using a subset of items,
  // where each chosen item is of a single category (e.g., Green).
  // Remaining items can be of other categories (e.g., Red or Blue).
  let currentOneCategorySumCounts = new Map(); // Represents the DP state for 'i' items processed
  currentOneCategorySumCounts.set(0, 1); // Base case: sum 0 has 1 way (empty set)
  
  for (let i = 0; i < totalItemCount; i++) {
    const currentItemScore = itemScores[i];
    let nextOneCategorySumCounts = new Map(); // Represents the DP state for 'i+1' items processed
    
    for (const [s, count] of currentOneCategorySumCounts.entries()) {
      // Scenario 1: currentItemScore is NOT included
      nextOneCategorySumCounts.set(s, (nextOneCategorySumCounts.get(s) || 0) + count);

      // Scenario 2: currentItemScore IS included.
      // The chosen item is of one category, so the count 'c' is added as is.
      const potentialNewSum = s + currentItemScore;
      if (potentialNewSum <= maximumHalfSum) {
        nextOneCategorySumCounts.set(potentialNewSum, (nextOneCategorySumCounts.get(potentialNewSum) || 0) + count);
      }
    }
    
    // Apply modulo
    for (const [s, count] of nextOneCategorySumCounts.entries()) {
      nextOneCategorySumCounts.set(s, count % MOD_VAL);
    }
    
    currentOneCategorySumCounts = nextOneCategorySumCounts;
  }
  
  // Add back terms for specific conditions (when total sum is even)
  if (overallScoreSum % 2 === 0) {
    const oneCategoryWaysAtHalf = currentOneCategorySumCounts.get(maximumHalfSum) || 0;
    finalOutcome = (finalOutcome + (3 * oneCategoryWaysAtHalf) % MOD_VAL) % MOD_VAL;
  }
  
  // Ensure the final result is positive
  finalOutcome = (finalOutcome + MOD_VAL) % MOD_VAL;
  
  console.log(finalOutcome);
}

ProcessItems(require('fs').readFileSync('/dev/stdin','utf8'));