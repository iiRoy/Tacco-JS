"use strict";

/**
 * Orchestrates a simulated combat encounter to determine the minimum
 * number of actions required to defeat a formidable opponent.
 *
 * This function processes raw combat data, calculates optimal attack sequences,
 * and outputs the total action count. It employs a two-phase strategy:
 * 1. An initial burst of regular attacks, considering the potential of powerful throws.
 * 2. A final, decisive sequence of throws if the foe still stands.
 *
 * @param {string} combatLogData - The raw input string containing the foe's initial vitality
 *                                 and the statistics of available armaments.
 *                                 Format:
 *                                 Line 1: "ARMAMENT_COUNT FOE_VITALITY"
 *                                 Subsequent lines: "PRIMARY_DAMAGE THROW_DAMAGE" for each armament.
 * @returns {void} - The calculated total number of actions is printed to the console.
 */
const resolveEncounter = (combatLogData) => {
    // Sanitize and segment the input string into individual data lines.
    const battleParameters = combatLogData.trim().split("\n");

    // Extract core combat metrics: the number of available weapons and the foe's starting health.
    const initialConfiguration = battleParameters[0].split(" ").map(Number);
    const availableArmamentsCount = initialConfiguration[0]; // Corresponds to N
    let foeCurrentVitality = initialConfiguration[1];       // Corresponds to H

    // Parse the statistics for each armament. We'll store them as objects for better readability.
    const armamentCollection = []; // Corresponds to AB
    for (let armamentIndex = 1; armamentIndex <= availableArmamentsCount; armamentIndex++) {
        const statsPair = battleParameters[armamentIndex].split(" ").map(Number);
        armamentCollection.push({
            primaryAttackDamage: statsPair[0], // Corresponds to A
            secondaryThrowDamage: statsPair[1] // Corresponds to B
        });
    }

    // Create a temporary sorted list to easily find the most potent regular attack.
    // This is a copy to preserve the original `armamentCollection` order if needed later.
    const armamentsSortedByPrimary = [...armamentCollection].sort((weaponAlpha, weaponBeta) =>
        weaponBeta.primaryAttackDamage - weaponAlpha.primaryAttackDamage
    );

    // Identify the maximum damage achievable with a single regular (primary) attack.
    const maximumPrimaryDamage = armamentsSortedByPrimary[0].primaryAttackDamage; // Corresponds to 'strongest'

    let cumulativePotentThrowDamage = 0; // Corresponds to 'throwSum'
    // Sum up the damage potential of all 'potent' throws. A throw is 'potent'
    // if its damage exceeds the maximum regular attack damage.
    for (const currentArmament of armamentCollection) {
        if (currentArmament.secondaryThrowDamage > maximumPrimaryDamage) {
            cumulativePotentThrowDamage += currentArmament.secondaryThrowDamage;
        }
    }

    let totalActionCount = 0; // Corresponds to 'cnt'

    // --- Phase 1: Initial sustained assault with regular attacks ---
    // The objective here is to reduce the foe's vitality significantly using regular attacks,
    // considering the cumulative damage that could be dealt by potent throws.

    // Early exit if the foe is already defeated (e.g., negative health from a previous encounter).
    if (foeVitality <= 0) {
        console.log(totalActionCount);
        return;
    }

    // Calculate the remaining health if all 'cumulativePotentThrowDamage' were applied immediately.
    // This helps determine how much damage the regular attacks need to cover.
    const healthAfterPotentialThrows = foeVitality - cumulativePotentThrowDamage;

    // Guard against division by zero or invalid scenarios where no primary damage can be dealt.
    if (maximumPrimaryDamage <= 0) {
        // If foeVitality is still positive and no primary damage can be dealt,
        // we must rely entirely on secondary throws. No regular attacks are added here.
        // The remaining health will be handled in Phase 2.
    } else {
        // Determine the number of regular attacks required. We take the ceiling
        // to ensure enough damage is dealt, and Math.max(0, ...) to avoid negative counts.
        const calculatedRegularAttacks = Math.ceil(Math.max(0, healthAfterPotentialThrows) / maximumPrimaryDamage);

        totalActionCount += calculatedRegularAttacks;
        foeVitality -= (calculatedRegularAttacks * maximumPrimaryDamage);
    }

    // --- Phase 2: Final decisive throws if the foe persists ---
    // If the foe's vitality is still above zero after the initial phase,
    // we unleash all remaining secondary throws, prioritizing the strongest ones.

    // Another check for early termination if the foe was vanquished in Phase 1.
    if (foeVitality <= 0) {
        console.log(totalActionCount);
        return;
    }

    // Extract only the secondary throw damages and sort them in descending order.
    // This optimization avoids re-sorting the entire `armamentCollection` object array.
    const sortedSecondaryDamages = armamentCollection
        .map(armament => armament.secondaryThrowDamage)
        .sort((dmgA, dmgB) => dmgB - dmgA);

    let currentThrowIndex = 0;
    // Continuously apply throw damage until the foe is defeated or all throws are exhausted.
    while (foeVitality > 0 && currentThrowIndex < sortedSecondaryDamages.length) {
        const damageFromCurrentThrow = sortedSecondaryDamages[currentThrowIndex];
        foeVitality -= damageFromCurrentThrow;
        totalActionCount++;
        currentThrowIndex++;
    }

    // Output the final tally of actions taken to defeat the foe.
    console.log(totalActionCount);
};

// Standard boilerplate for reading input in competitive programming environments.
// The entire execution is wrapped in an Immediately Invoked Function Expression (IIFE)
// to encapsulate scope and handle potential errors during input processing or battle logic.
((inputPayload) => {
    try {
        resolveEncounter(inputPayload);
    } catch (executionError) {
        // Log any errors that occur during the battle simulation.
        console.error("An unexpected error occurred during the encounter resolution:", executionError);
        // Depending on requirements, could also exit with a non-zero status code or provide more detailed error messages.
    }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));