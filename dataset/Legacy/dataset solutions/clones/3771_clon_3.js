'use strict';
console.log((function(inputString){
  // Renamed variables for clarity (Type II)
  const MAX_REACHABLE_VALUE = Infinity; // Extracted constant (Type III)
  const UNIT_STEP_COST = 1; // Extracted constant (Type III)
  const PRIMARY_FACTOR_BASE = 6; // Extracted constant (Type III)
  const SECONDARY_FACTOR_BASE = 9; // Extracted constant (Type III)

  // Preserve original input parsing behavior (Type I/II)
  const targetNumber = inputString.trim() | 0;

  // Initialize DP array (Type I/II)
  const minimumSteps = new Array(targetNumber + 1).fill(MAX_REACHABLE_VALUE);
  minimumSteps[0] = 0;

  // Helper function to abstract the update logic (Type III)
  // This replaces the repeated 'if (dp[i] < dp[i+j]) dp[i+j] = dp[i] + 1;' pattern
  const tryUpdateMinimum = (dpArray, sourceIndex, destinationIndex, costToAdd) => {
    const currentSourceCost = dpArray[sourceIndex];
    const currentDestinationCost = dpArray[destinationIndex];
    // The original logic implicitly handles Infinity: Infinity + 1 is Infinity,
    // and Infinity < any_number is false. This condition maintains that behavior.
    if (currentSourceCost + costToAdd < currentDestinationCost) {
      dpArray[destinationIndex] = currentSourceCost + costToAdd;
    }
  };

  // Main dynamic programming loop (Type I/II)
  for ( let currentPosition = 0; currentPosition < targetNumber; currentPosition++ ) {
    // Step by 1 (Type I/II, using helper)
    // The outer loop condition (currentPosition < targetNumber) ensures currentPosition + UNIT_STEP_COST is always <= targetNumber
    tryUpdateMinimum(minimumSteps, currentPosition, currentPosition + UNIT_STEP_COST, UNIT_STEP_COST);

    // Steps by powers of PRIMARY_FACTOR_BASE (6) (Type III: changed to while loop, added robustness check)
    let currentFactorSix = PRIMARY_FACTOR_BASE;
    while ( currentPosition + currentFactorSix <= targetNumber ) {
      const nextPositionSix = currentPosition + currentFactorSix;
      tryUpdateMinimum(minimumSteps, currentPosition, nextPositionSix, UNIT_STEP_COST);

      // Add a robustness check for potential overflow before next multiplication (Type III)
      // This prevents currentFactorSix from becoming excessively large and potentially overflowing
      // Number.MAX_SAFE_INTEGER, which could lead to incorrect loop termination or calculations
      // for extremely large targetNumber values. For typical N, this won't be hit before
      // currentPosition + currentFactorSix > targetNumber.
      if (currentFactorSix > targetNumber / PRIMARY_FACTOR_BASE) {
          break;
      }
      currentFactorSix *= PRIMARY_FACTOR_BASE;
    }

    // Steps by powers of SECONDARY_FACTOR_BASE (9) (Type III: changed to while loop, added robustness check)
    let currentFactorNine = SECONDARY_FACTOR_BASE;
    while ( currentPosition + currentFactorNine <= targetNumber ) {
      const nextPositionNine = currentPosition + currentFactorNine;
      tryUpdateMinimum(minimumSteps, currentPosition, nextPositionNine, UNIT_STEP_COST);

      // Add a robustness check for potential overflow before next multiplication (Type III)
      if (currentFactorNine > targetNumber / SECONDARY_FACTOR_BASE) {
          break;
      }
      currentFactorNine *= SECONDARY_FACTOR_BASE;
    }
  }
  return minimumSteps[targetNumber].toString(); // Preserve return value and type (Type I/II)
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
