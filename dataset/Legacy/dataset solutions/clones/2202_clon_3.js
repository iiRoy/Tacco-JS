'use strict';

// Helper function to safely parse a string into an integer.
const parseInteger = (strValue) => parseInt(strValue, 10);

// Helper function to parse a line of space-separated string values into an array of integers.
const parseLineOfIntegers = (lineString) => lineString.split(' ').map(parseInteger);

/**
 * Processes the input string to solve the problem.
 * This function calculates the minimum magic points required to deal a specific amount of damage.
 *
 * @param {string} rawInputString - The raw input string from stdin.
 */
function solveProblem(rawInputString) {
  // Split the input into individual lines and remove leading/trailing whitespace.
  const inputLines = rawInputString.trim().split('\n');

  // Parse the first line which contains the target health (H) and number of spells (N).
  const [targetHealthPoints, numberOfSpells] = parseLineOfIntegers(inputLines[0]);

  // Process the remaining lines to extract spell data.
  // Each spell has a damage value and a magic point cost.
  const spellDataCollection = inputLines.slice(1).map(line => {
    const [spellDamage, spellCost] = parseLineOfIntegers(line);
    return { spellDamage, spellCost };
  });

  // Define a constant for the maximum capacity of the DP array.
  // The original code uses 9999, implying the target health H can be up to 9998.
  const DP_ARRAY_MAX_CAPACITY = 9999;

  // Initialize the dynamic programming array.
  // minMagicPointCost[i] will store the minimum magic points needed to deal 'i' damage.
  // A value of 0 for i > 0 indicates that 'i' damage is currently unreachable.
  // minMagicPointCost[0] is 0, representing 0 cost for 0 damage (base case).
  const minMagicPointCost = Array(DP_ARRAY_MAX_CAPACITY).fill(0);

  // Iterate through each available spell.
  for (let spellIndex = 0; spellIndex < numberOfSpells; ++spellIndex) {
    const currentSpell = spellDataCollection[spellIndex];
    const damageValue = currentSpell.spellDamage;
    const magicPointCost = currentSpell.spellCost;

    // Iterate through possible damage targets, starting from the current spell's damage value
    // up to the overall target health points.
    for (let currentDamageTarget = damageValue; currentDamageTarget <= targetHealthPoints; ++currentDamageTarget) {
      // Determine the damage target that must have been reached before applying the current spell.
      const previousDamageTarget = currentDamageTarget - damageValue;
      const costToReachPreviousDamage = minMagicPointCost[previousDamageTarget];

      // Calculate the potential new total cost if we use the current spell.
      const potentialTotalCost = costToReachPreviousDamage + magicPointCost;

      // Check if the previous damage target was a valid, reachable state.
      // A state is valid if its cost is non-zero, or if it's the base case (0 damage, 0 cost).
      const isPreviousStateReachable = (costToReachPreviousDamage !== 0 || previousDamageTarget === 0);

      if (isPreviousStateReachable) {
        // If the current damage target has not been reached before (its cost is 0, and it's not dp[0]),
        // set its cost to the potential total cost.
        if (minMagicPointCost[currentDamageTarget] === 0) {
          minMagicPointCost[currentDamageTarget] = potentialTotalCost;
        } else {
          // If the current damage target has been reached before, update it with the minimum cost found so far.
          minMagicPointCost[currentDamageTarget] = Math.min(minMagicPointCost[currentDamageTarget], potentialTotalCost);
        }
      }
      // If !isPreviousStateReachable, it means the path to currentDamageTarget via previousDamageTarget is invalid.
      // In this case, minMagicPointCost[currentDamageTarget] remains 0 (if it was 0) or its existing value.
      // This correctly models that an unreachable previous state cannot lead to a reachable current state.
    }
  }

  // Output the minimum magic points required to reach the target health.
  console.log(minMagicPointCost[targetHealthPoints]);
}

// Read input from stdin and pass it to the main processing function.
solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
