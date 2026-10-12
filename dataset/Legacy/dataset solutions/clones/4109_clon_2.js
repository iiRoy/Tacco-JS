"use strict";

// This function processes the input data to calculate the minimum attacks needed.
const processInput = (inputData) => {
  // Clean up the input string and split it into lines.
  inputData = inputData.trim().split("\n");

  // Parse the number of weapons and the target health from the first line.
  const numItems = parseInt(inputData[0].split(" ")[0]);
  let targetHealth = parseInt(inputData[0].split(" ")[1]);

  // Extract weapon attack and throw damage statistics.
  // Each weapon's stats are stored as an array of two strings: [attack_power, throw_damage].
  const weaponStats = inputData.slice(1, numItems + 1).map((itemStr) => itemStr.split(" "));

  // Initialize variables to track the strongest attack and total throw damage.
  let maxAttackPower = 0;
  let maxAttackIndex = 0;
  let totalThrowDamage = 0;

  // Iterate through all weapons to find the one with the highest attack power
  // and calculate the total damage if all weapons were thrown.
  for (let idx in weaponStats) {
    const currentAttack = parseInt(weaponStats[idx][0]); // Attack power of the current weapon
    const currentThrow = parseInt(weaponStats[idx][1]);   // Throw damage of the current weapon

    totalThrowDamage += currentThrow; // Accumulate total throw damage

    // Update the strongest attack power and its index if a stronger weapon is found.
    if (currentAttack > maxAttackPower) {
      maxAttackIndex = idx;
      maxAttackPower = currentAttack;
    }
  }

  // Store the stats of the weapon with the highest attack power.
  // Note: This variable is declared but not directly used later in the calculation,
  // but its components are accessed via `weaponStats[maxAttackIndex]`.
  let bestWeaponStats = weaponStats[maxAttackIndex];

  // Scenario 1: If throwing all weapons is enough to defeat the enemy.
  // This is the most efficient strategy if it works.
  if (totalThrowDamage >= targetHealth) {
    console.log(numItems); // Output the total number of weapons (all thrown).
    return;                // Exit the function as the solution is found.
  }

  // Scenario 2: Throwing all weapons is not enough.
  // We need to combine throwing with regular attacks from the strongest weapon.

  // First, throw all weapons that are not the strongest one.
  // The strongest weapon will be used for regular attacks.
  // If there's only one weapon, this step is skipped.
  if (numItems > 1) {
    // Subtract the throw damage of all weapons except the strongest one from the target health.
    // The strongest weapon's throw damage is `parseInt(weaponStats[maxAttackIndex][1])`.
    targetHealth -= totalThrowDamage - parseInt(weaponStats[maxAttackIndex][1]);
  }

  // Calculate the remaining health after throwing all non-strongest weapons (or all if N=1).
  // This is the health that needs to be dealt by the strongest weapon's regular attacks.
  const remainingHealthAfterThrow = targetHealth - parseInt(weaponStats[maxAttackIndex][1]);

  // Calculate the number of regular attacks needed from the strongest weapon.
  // We use Math.ceil to ensure any remaining health, even a fraction, requires a full attack.
  const strikesAndThrowsCount = Math.ceil(remainingHealthAfterThrow / parseInt(weaponStats[maxAttackIndex][0]));

  // The problem has a specific output format depending on N.
  // The first console.log is for a specific intermediate value,
  // and the second one is the final answer based on N.
  console.log(strikesAndThrowsCount);

  // Output the final answer:
  // If there was only one weapon (N=1), it was thrown once and then attacked.
  // If there were multiple weapons, (N-1) weapons were thrown, and then the strongest attacked.
  console.log(numItems === 1 ? strikesAndThrowsCount + 1 : strikesAndThrowsCount + (numItems - 1));
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
