"use strict";

// Main execution block to handle the input and orchestrate the battle logic
const processInput = rawData => {

  // Clean and parse the initial input string into an array of lines
  rawData = rawData.trim().split("\n");

  // Extract the total number of monsters from the first line
  const entityCount = parseInt(rawData[0].split(" ")[0]);

  // Retrieve the initial health points of the target from the first line
  let healthPoints = parseInt(rawData[0].split(" ")[1]);

  // Parse the monster abilities (attack and throw damage) from subsequent lines
  // Each line contains two integers: [attack_value, throw_value]
  let monsterAbilities = rawData.slice(1, entityCount + 1).map(currentEntry =>
    currentEntry.split(" ").map(stringValue =>
      parseInt(stringValue)
    )
  );

  // Sort the monster abilities primarily by their attack values in descending order
  // This helps in identifying the strongest attack for melee calculations
  monsterAbilities.sort((firstAbility, secondAbility) => secondAbility[0] - firstAbility[0]);

  // Determine the maximum possible melee attack value available
  const maxMeleeDamage = monsterAbilities[0][0];

  // Re-sort the monster abilities, this time by their throw values in descending order.
  // Then, filter out any throw attacks that are weaker than the maximum melee attack.
  // Only strong throw attacks are considered for the initial phase.
  monsterAbilities = monsterAbilities.sort((firstAbility, secondAbility) => secondAbility[1] - firstAbility[1])
                                   .filter(currentAbility => currentAbility[1] > maxMeleeDamage);

  // Initialize counters for damage dealt and the number of ranged attacks used
  let totalDamageDealt = 0; // This variable is declared but not explicitly used for calculation, consistent with original
  let rangedAttackCount = 0;

  // Iterate through the sorted and filtered throw attacks
  // Attempt to defeat the target using only these powerful ranged attacks first
  for (let abilityIndex in monsterAbilities) {
    // Apply the throw damage to the target's health
    healthPoints -= monsterAbilities[abilityIndex][1];
    // Increment the count of ranged attacks performed
    rangedAttackCount++;

    // Check if the target's health has dropped to zero or below
    if (healthPoints <= 0) {
      // If defeated, log the total number of ranged attacks and exit
      console.log(rangedAttackCount);
      return;
    }
  }

  // If the target is still alive after all powerful ranged attacks,
  // calculate how many direct melee strikes are needed using the strongest melee attack.
  // Math.ceil ensures that even fractional health requires a full strike.
  const finalMeleeStrikes = Math.ceil(healthPoints / maxMeleeDamage);

  // Log the total number of attacks: sum of ranged attacks and final melee strikes.
  console.log(rangedAttackCount + finalMeleeStrikes);
};

// Invoke the main processing function with data read from standard input
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));