const rawData = require("node:fs") . readFileSync ('/proc/self/fd/0', 'utf8') ;

// This script determines the fewest number of coins required to achieve a specific total.
// It employs a dynamic programming methodology, akin to the classic change-making problem.

const lineArray = rawData.trim() . split('\n');

/*
 * The initial line of input provides two space-separated numerical values:
 * 'targetValue' (representing the desired sum) and 'numDenominations' (the count of available coin types).
 */
let [ targetValueStr ,  numDenominationsStr ] = lineArray[0] . split (' ');

let targetValue = parseInt(targetValueStr, 10);
let numDenominations = parseInt(numDenominationsStr, 10);

// The subsequent line of input contains 'numDenominations' space-separated integers,
// each representing a distinct coin denomination.
let coinDenominationsStr = lineArray[1].trim().split(' ');
let coinDenominations = coinDenominationsStr.map ( denominationStr  =>  parseInt(denominationStr, 10) );


// Initialize a memoization table (implemented as a Map) to store computed results.
// Keys represent various sums, and values indicate the minimum coins needed to form that sum.
const memoizationTable = new Map();

// Establish base cases: For each direct coin denomination, only one coin is necessary.
for ( let denominationIndex = 0 ; denominationIndex < numDenominations ; denominationIndex++ ) {
  memoizationTable.set(coinDenominations[denominationIndex], 1) ;
}

// Define a constant that signifies an unachievable or unreachable state for a sum.
const impossibleCount = targetValue + 1 ;

// Iterate through all possible sums from zero up to and including the target value.
for ( let currentSum = 0 ; currentSum <= targetValue ; currentSum++ ) {
  // If the current sum is already a known coin denomination (a base case),
  // there's no need to compute it further; simply proceed to the next sum.
  if ( memoizationTable.has(currentSum) ) {
    continue ;
  }

  // Initialize the 'minimumCoins' for the 'currentSum' to the 'impossibleCount'.
  // This value will be updated if a valid combination is found.
  let minimumCoins = impossibleCount ;

  // Traverse through each available coin denomination to find optimal combinations.
  for ( let denomIdx = 0 ; denomIdx < numDenominations ; denomIdx++ ) {
    const currentDenomination = coinDenominations[denomIdx];
    const remainingSum = currentSum - currentDenomination ;

    // If the 'remainingSum' is negative or if it's not a sum that can be formed
    // (i.e., not present in the memoization table), this path is invalid.
    if ( remainingSum < 0  ||  !memoizationTable.has(remainingSum) ) {
      continue ;
    }

    // Retrieve the number of coins required to achieve the 'remainingSum'.
    const previousCount = memoizationTable.get(remainingSum) ;

    // Update 'minimumCoins' with the smallest count found so far for the 'currentSum'.
    minimumCoins = Math.min(previousCount, minimumCoins) ;
  }

  // If a feasible path was identified (meaning 'minimumCoins' is less than 'impossibleCount'),
  // store the result in the memoization table. The result is 'minimumCoins' plus one
  // (for the current coin added to form 'currentSum').
  if ( minimumCoins < impossibleCount ) {
    memoizationTable.set(currentSum, minimumCoins + 1) ;
  }
}

// Output the final calculated minimum number of coins for the 'targetValue'.
process.stdout.write(memoizationTable.get(targetValue) + '\n');