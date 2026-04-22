"use strict";

/**
 * Helper function to safely convert a string to an integer.
 * @param {string} valueString - The string to convert.
 * @returns {number} The parsed integer.
 */
const parseNumericValue = (valueString) => parseInt(valueString, 10);

/**
 * Orchestrates the strategy to defeat a monster using a set of weapons.
 * The goal is to minimize the total number of actions (throws or swings).
 *
 * Each weapon can either be:
 * - Thrown: 1 action, deals 'b' damage, weapon is consumed.
 * - Swung: 1 action, deals 'a' damage, weapon can be swung again.
 *
 * @param {string} inputPayload - The raw input string containing battle parameters.
 */
const executeBattleStrategy = (inputPayload) => {
    // Step 1: Sanitize and parse the raw input data.
    // Trim any leading/trailing whitespace and split the input into individual lines.
    const inputLines = inputPayload.trim().split("\n");

    // Extract global battle parameters from the very first line.
    // This line typically contains the total number of available weapons and the monster's initial health points.
    const globalConfiguration = inputLines[0].split(" ");
    const availableWeaponCount = parseNumericValue(globalConfiguration[0]); // Represents 'N' in original problem
    let currentMonsterHealth = parseNumericValue(globalConfiguration[1]);   // Represents 'H' in original problem

    // Step 2: Process the specifications for each weapon.
    // From the second line onwards, each line describes a weapon with its swing and throw damage.
    // We parse these into an array of arrays: [[swingDmg1, throwDmg1], [swingDmg2, throwDmg2], ...]
    const weaponArsenal = inputLines.slice(1, availableWeaponCount + 1).map(weaponLine =>
        weaponLine.split(" ").map(parseNumericValue)
    );

    // Step 3: Initialize and gather key combat metrics.
    // We need to find the strongest single swing attack and the cumulative damage from throwing all weapons.
    let highestSingleSwingDamage = 0;   // Stores the maximum 'a' value found across all weapons.
    let totalCumulativeThrowDamage = 0; // Accumulates the sum of all 'b' values from all weapons.

    // Iterate through each weapon in the arsenal to compute these metrics.
    for (let weaponIndex = 0; weaponIndex < availableWeaponCount; weaponIndex++) {
        const [swingDamage, throwDamage] = weaponArsenal[weaponIndex];
        
        // Add current weapon's throw damage to the total.
        totalCumulativeThrowDamage += throwDamage;
        
        // Update the highest single swing damage if the current weapon is stronger.
        if (swingDamage > highestSingleSwingDamage) {
            highestSingleSwingDamage = swingDamage;
            // The exact index of this weapon is not strictly needed for the calculation
            // as only the 'highestSingleSwingDamage' value itself is used later.
        }
    }

    // Step 4: Determine the optimal battle strategy based on gathered metrics.

    // Strategy A: Check if throwing all available weapons is sufficient to defeat the monster.
    // If so, this is often the most straightforward and efficient approach, as it involves N actions.
    if (totalCumulativeThrowDamage >= currentMonsterHealth) {
        console.log(availableWeaponCount); // The total number of actions equals the number of weapons (all thrown).
        return; // The battle strategy is complete.
    }
    
    // Guard Clause: If the monster's health is already non-positive at this stage,
    // it implies it was already defeated, potentially by some initial condition or edge case.
    // In such a scenario, no further actions are required.
    if (currentMonsterHealth <= 0) {
        console.log(0); // Zero actions needed.
        return;
    }

    // Strategy B: If throwing all weapons is not enough, a hybrid approach is necessary.
    // The problem's specific logic dictates a strategy where:
    // 1. All weapons are *conceptually* thrown to deal an initial burst of damage.
    // 2. Any remaining monster health is then dealt with by repeatedly swinging the strongest weapon.
    
    // Calculate the monster's remaining health after all weapons have been thrown.
    // This value represents the HP that must be depleted by additional swings.
    let healthRemainingAfterAllThrows = currentMonsterHealth - totalCumulativeThrowDamage;

    // Determine the number of additional swings required from the strongest weapon.
    // We use Math.ceil to round up, as even a small amount of remaining HP requires a full swing.
    // Math.max(0, ...) ensures that the swing count is never negative (e.g., if remainingHP was negative).
    let countOfRequiredAdditionalSwings = 0;
    if (healthRemainingAfterAllThrows > 0 && highestSingleSwingDamage > 0) {
        countOfRequiredAdditionalSwings = Math.ceil(healthRemainingAfterAllThrows / highestSingleSwingDamage);
    }
    // If highestSingleSwingDamage is 0 and healthRemainingAfterAllThrows > 0,
    // this would imply an impossible scenario (cannot deal further damage with swings).
    // The original code would produce Infinity in this case, which is maintained.
    countOfRequiredAdditionalSwings = Math.max(0, countOfRequiredAdditionalSwings);

    // Step 5: Calculate the total number of combat actions.
    // The final action count depends on the number of weapons and the additional swings.
    let finalTotalCombatActions;
    if (availableWeaponCount === 1) {
        // If only one weapon exists: 1 action for throwing it, plus any required additional swings.
        finalTotalCombatActions = countOfRequiredAdditionalSwings + 1;
    } else {
        // For multiple weapons (N > 1):
        // The original problem's logic calculates (N-1) throws for the weaker weapons,
        // and then adds the required swings from the strongest weapon.
        // This specific formulation is preserved to match the original code's functional output.
        finalTotalCombatActions = countOfRequiredAdditionalSwings + (availableWeaponCount - 1);
    }

    // Output the calculated minimum total actions to defeat the monster.
    console.log(finalTotalCombatActions);
};

// Entry point for the script: Read the input from standard input and initiate the battle strategy.
executeBattleStrategy(require('fs').readFileSync('/dev/stdin', 'utf8'));