const determineMinSpecialAttacks = (inputDataContent) => {
  // Parse the raw input string into an array of lines.
  const inputLines = inputDataContent.trim().split('\n');

  // The first line contains global parameters:
  // total number of monsters, special attack power (A), base attack power (B).
  const [generalParametersString, ...monsterHealthLineStrings] = inputLines;
  const [totalMonstersCount, specialAttackValue, baseAttackValue] = generalParametersString.split(' ').map(val => parseInt(val, 10));

  // Convert the remaining lines into an array of initial monster health values.
  const initialMonsterHitPoints = monsterHealthLineStrings.map(hpStr => parseInt(hpStr, 10));

  // --- Input Validation (Type III addition for robustness) ---
  // In competitive programming, inputs are usually guaranteed valid,
  // but in a real-world scenario, these checks would be crucial.
  if (totalMonstersCount <= 0 || specialAttackValue <= baseAttackValue || baseAttackValue <= 0) {
      // If special attack is not strictly better than base attack,
      // or if base attack is zero/negative, the problem's logic might break
      // or it might be unsolvable in a practical sense.
      // For this specific problem context, we assume A > B.
      // Returning a special value or throwing an error would be appropriate here.
      // As per problem constraints, A > B is usually guaranteed.
  }

  // Define bounds for the binary search.
  // We are searching for the minimum number of special attacks (X) needed.
  // 'maximumFeasibleAttacks' represents an upper bound where X attacks are possible.
  // A safe, sufficiently large upper bound for X could be twice the maximum possible monster HP
  // if (A-B) is 1, multiplied by the number of monsters. Or simply a very large constant.
  // The original used 1e9/B, which works as a loose initial guess.
  // Let's set a more general large value to ensure it covers all cases.
  let maximumFeasibleAttacks = 2 * 10**9; // A very large number of attacks as an upper limit.
  // 'minimumImpossibleAttacks' represents a lower bound where X attacks are not enough.
  let minimumImpossibleAttacks = 0; // Zero special attacks is typically not enough.

  // Execute the binary search algorithm.
  // The loop continues as long as there's a range to search within.
  while (maximumFeasibleAttacks - minimumImpossibleAttacks > 1) {
    // Calculate the midpoint of the current search range.
    // This `currentAttempt` represents our guess for the number of special attacks.
    const currentAttempt = Math.floor((maximumFeasibleAttacks + minimumImpossibleAttacks) / 2);

    // Initialize a counter for the special attacks budget, starting with our guess.
    let specialAttacksBudget = currentAttempt;
    // A flag to determine if `currentAttempt` is a feasible number of special attacks.
    let isCurrentAttemptPossible = true;

    // Calculate the effective extra damage provided by a special attack over a base attack.
    const effectiveSpecialDamageBoost = specialAttackValue - baseAttackValue;

    // --- Critical Check (Type III addition) ---
    // If A <= B, then special attacks offer no additional benefit or even harm.
    // This case would lead to division by zero or negative values later,
    // indicating an invalid problem setup or an impossible scenario.
    if (effectiveSpecialDamageBoost <= 0) {
        isCurrentAttemptPossible = false; // Mark as impossible if special attacks aren't superior.
        // In a real application, one might throw an error or return a specific code.
        // For this competitive programming context, assume A > B.
    }

    // Iterate through each monster to determine if they can all be defeated
    // within the `specialAttacksBudget` using `currentAttempt` base attacks.
    for (let monsterIndex = 0; monsterIndex < totalMonstersCount; monsterIndex++) {
      const monsterInitialHealth = initialMonsterHitPoints[monsterIndex];

      // Calculate the monster's remaining health after applying `currentAttempt` base attacks.
      const healthAfterBaseHits = monsterInitialHealth - (currentAttempt * baseAttackValue);

      // If the monster is already defeated by base attacks (or has 0 or less HP),
      // no special attacks are needed for this monster. Move to the next.
      if (healthAfterBaseHits <= 0) {
        continue;
      }

      // If the monster still has health, calculate how many special attacks are required.
      // `Math.ceil` ensures that any remaining fractional HP requires a full special attack.
      const requiredSpecialAttacksForThisMonster = Math.ceil(healthAfterBaseHits / effectiveSpecialDamageBoost);

      // Deduct the required special attacks from the total budget.
      specialAttacksBudget -= requiredSpecialAttacksForThisMonster;

      // If the budget for special attacks drops below zero,
      // it means `currentAttempt` is not enough special attacks in total.
      if (specialAttacksBudget < 0) {
        isCurrentAttemptPossible = false;
        // Optimization: No need to check further monsters if the budget is already exhausted.
        break;
      }
    }

    // Adjust the binary search bounds based on whether the current attempt was feasible.
    if (isCurrentAttemptPossible) {
      // If it's possible with `currentAttempt` special attacks, then `currentAttempt` is a potential
      // answer, or we can try to achieve it with even fewer attacks.
      maximumFeasibleAttacks = currentAttempt;
    } else {
      // If it's not possible, we need more attacks, so `currentAttempt` is too low.
      minimumImpossibleAttacks = currentAttempt;
    }
  }

  // After the binary search, 'maximumFeasibleAttacks' will hold the smallest number
  // of special attacks required to defeat all monsters.
  return String(maximumFeasibleAttacks);
};

// --- Main execution block for reading input and printing output ---
// This immediately-invoked function expression handles the I/O.
((processorFunction) => {
  const fileSystemModule = require('fs');
  const standardInputFilePath = '/dev/stdin'; // Standard input file path in Unix-like systems.
  const fileEncoding = 'utf8'; // Specify the encoding for reading the file.

  try {
    // Read the entire content of the standard input file.
    const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, fileEncoding);
    // Process the input content using our specialized function.
    const finalResult = processorFunction(rawInputContent);
    // Output the computed result to standard output.
    console.log(finalResult);
  } catch (ioError) {
    // --- Error Handling (Type III addition) ---
    // If there's an error reading the file or during processing, log it.
    // In a competitive programming setting, this might result in a runtime error.
    // For a more robust application, specific error codes or messages would be returned.
    console.error("An error occurred during input/output operations or data processing:", ioError.message);
    console.log("-1"); // Indicate an error state.
  }
})(determineMinSpecialAttacks);