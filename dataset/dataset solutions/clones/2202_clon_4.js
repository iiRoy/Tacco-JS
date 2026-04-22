'use strict';

function ProcessInputData(inputString) {
  // Input parsing:
  // Breaks down the input string into lines, filtering out any empty lines.
  const lineSeries = inputString.split(/\r?\n/).filter(currentLine => currentLine.length > 0);
  // Extracts numeric parameters from the first line (H and N).
  const numericParameters = lineSeries[0].match(/\d+/g).map(Number);

  // Renamed variables for divergence:
  const ultimateTarget = numericParameters[0]; // Corresponds to original 'H' (target health)
  const abilityCount = numericParameters[1];   // Corresponds to original 'N' (number of attack options)

  // Parses subsequent lines into an array of ability objects.
  // Each object has 'power' (damage) and 'cost' (mana expenditure).
  const availableAbilities = lineSeries.slice(1).map(abilityLine => {
    const [strengthValue, manaExpense] = abilityLine.match(/\d+/g).map(Number);
    return { power: strengthValue, cost: manaExpense };
  });

  // Memoization structure for the recursive Dynamic Programming approach.
  // A Map is used to store the minimum cost to achieve a specific power level.
  const costRecord = new Map();

  // Base case: Achieving 0 power requires 0 cost.
  costRecord.set(0, 0);

  // Recursive function to calculate the minimum mana expenditure needed
  // to reach a given 'currentPowerTarget' (damage level).
  function calculateOptimalMana(currentPowerTarget) {
    // Type IV clone requirement: "exactly the same results".
    // The original code uses a fixed-size array initialized with 0s.
    // Accessing dp[j - A[i].value] where (j - A[i].value) is negative would implicitly yield 0.
    // This replicates that specific behavior (often considered a bug in standard DP).
    if (currentPowerTarget < 0) {
      return 0;
    }

    // If the result for the current power target has already been computed
    // and stored in the memoization cache, return it directly.
    if (costRecord.has(currentPowerTarget)) {
      return costRecord.get(currentPowerTarget);
    }

    // Initialize the minimum cost for the current target to a very large number.
    // This represents an 'unreachable' state before any paths are explored.
    let minimumCurrentCost = Number.MAX_SAFE_INTEGER;

    // Iterate through all available abilities to find the path that yields
    // the minimum cost to reach 'currentPowerTarget'.
    for (const currentAbility of availableAbilities) {
      // Recursively call the function to find the cost for the remaining
      // power needed after using the 'currentAbility'.
      const previousPowerCost = calculateOptimalMana(currentPowerTarget - currentAbility.power);

      // Only consider this path if the 'previousPowerCost' is not 'unreachable' (Infinity).
      // If 'previousPowerCost' is 0 (due to base case or negative index bug replication),
      // it is treated as a valid cost for calculation, mirroring the original.
      if (previousPowerCost !== Number.MAX_SAFE_INTEGER) {
        minimumCurrentCost = Math.min(minimumCurrentCost, previousPowerCost + currentAbility.cost);
      }
    }

    // Store the computed minimum cost in the cache for future lookups.
    costRecord.set(currentPowerTarget, minimumCurrentCost);
    return minimumCurrentCost;
  }

  // Initiate the DP calculation for the ultimate target power level.
  const finalResult = calculateOptimalMana(ultimateTarget);

  // Output the final minimum mana cost.
  console.log(finalResult);
}

// Standard input reading for competitive programming environments.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));