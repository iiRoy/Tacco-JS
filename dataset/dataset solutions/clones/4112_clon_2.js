"use strict";

// Main processing function for the input data
const processInput = (inputString) => {
  // Clean up the input string and split it into lines
  let cleanedInput = inputString.trim().split("\n");

  // Parse the initial parameters from the first line
  const numItems = parseInt(cleanedInput[0].split(" ")[0]);
  let healthPoints = parseInt(cleanedInput[0].split(" ")[1]);

  // Extract and parse the attack data from subsequent lines
  let attackDetails = cleanedInput
    .slice(1, numItems + 1)
    .map((line) => line.split(" ").map((val) => parseInt(val)));

  // Sort the attack details in descending order based on the first value (attack power)
  attackDetails.sort((firstItem, secondItem) => secondItem[0] - firstItem[0]);

  // Determine the maximum base attack power from the strongest item
  const maxBaseAttack = attackDetails[0][0];

  // Re-sort the attack details by the second value (throw damage) in descending order,
  // then filter to keep only items with throw damage greater than the max base attack.
  // This creates a list of effective "throwable" items.
  let throwableAttacks = attackDetails
    .sort((itemA, itemB) => itemB[1] - itemA[1])
    .filter((item) => item[1] > maxBaseAttack);

  // Initialize counters for damage and thrown attacks
  let cumulativeDamage = 0; // This variable is declared but not used in the original logic, so it remains unused.
  let thrownWeaponCount = 0;

  // Iterate through the filtered throwable attacks
  for (let idx in throwableAttacks) {
    // Reduce health points by the throw damage of the current item
    healthPoints -= throwableAttacks[idx][1];
    // Increment the count of thrown weapons
    thrownWeaponCount++;

    // If health points drop to or below zero, we've defeated the target
    if (healthPoints <= 0) {
      // Output the total number of thrown attacks needed
      console.log(thrownWeaponCount);
      return; // Exit the function early
    }
  }

  // If the target is still alive after all effective throws, calculate remaining attacks
  // using the strongest base attack. Use Math.ceil to ensure any remaining health requires a full attack.
  const finalMeleeStrikes = Math.ceil(healthPoints / maxBaseAttack);

  // Output the total attacks: thrown weapons plus the final melee strikes
  console.log(thrownWeaponCount + finalMeleeStrikes);
};

// Read input from standard input and pass it to the processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
