/*
 * This JavaScript module processes battle simulation data.
 * It calculates the cumulative strength of monsters defeated by a series of heroes.
 * The input format consists of three lines:
 * 1. An integer (unused in this version).
 * 2. Space-separated integers representing the initial capacities of heroes (A-series).
 * 3. Space-separated integers representing the power of monsters (B-series).
 *
 * This version incorporates extensive structural and superficial modifications
 * to demonstrate Type III code cloning.
 */
function processInputData(rawBattleData) {
    // Validate the presence of input data. A crucial first step.
    if (!rawBattleData || rawBattleData.trim().length === 0) {
        console.error("Error: The provided battle data is empty or invalid. Cannot proceed.");
        return;
    }

    // Split the raw input string into individual lines for processing.
    const battleDataSegments = rawBattleData.trim().split('\n');

    // Ensure we have the minimum required lines for hero capacities and monster strengths.
    // The first line (N) is ignored as per Type III deletion, but its presence is expected.
    if (battleDataSegments.length < 3) {
        console.error("Error: Incomplete battle data. Expected at least three lines.");
        return;
    }

    // Parse the hero capacities from the second line.
    // Each string element is converted to an integer. Invalid numbers default to zero.
    let heroPowerLevels = battleDataSegments[1].split(' ').map(strVal => {
        const parsedNum = parseInt(strVal, 10);
        // Add a guard for non-numeric input values.
        return isNaN(parsedNum) ? 0 : parsedNum;
    });

    // Parse the monster strengths from the third line.
    // Similar parsing and validation as for hero capacities.
    let monsterThreatLevels = battleDataSegments[2].split(' ').map(strVal => {
        const parsedNum = parseInt(strVal, 10);
        return isNaN(parsedNum) ? 0 : parsedNum;
    });

    // Initialize an accumulator for the total monster strength vanquished.
    let totalVanquishedPower = 0; // Renamed from 'output'

    // Iterate through each monster to simulate successive battles.
    // The loop runs for the number of monsters present.
    for (let currentEncounterIndex = 0; currentEncounterIndex < monsterThreatLevels.length; currentEncounterIndex++) {
        // Retrieve the current monster's power.
        // Ensure it's non-negative, as negative power doesn't make sense.
        let monsterStrengthForThisRound = Math.max(0, monsterThreatLevels[currentEncounterIndex]);

        // Retrieve the capacity of the current hero.
        // Ensure it's non-negative.
        let currentHeroOffensive = Math.max(0, heroPowerLevels[currentEncounterIndex]);

        // Retrieve the capacity of the next hero in sequence.
        // Use `|| 0` to safely handle cases where `currentEncounterIndex + 1` is out of bounds
        // (i.e., for the last hero in the sequence), preventing `undefined` issues.
        let subsequentHeroOffensive = Math.max(0, heroPowerLevels[currentEncounterIndex + 1] || 0);

        // --- Battle Logic Simulation ---
        // This section replaces the original complex if-else chain with a more sequential,
        // step-by-step approach, using intermediate variables for clarity.

        let powerRemovedFromMonster = 0; // Tracks how much of the monster is defeated in this round.
        let remainingMonsterToDefeat = monsterStrengthForThisRound; // What's left of the monster.

        // Step 1: Current hero attempts to defeat the monster.
        const defeatedByCurrentHero = Math.min(remainingMonsterToDefeat, currentHeroOffensive);
        powerRemovedFromMonster += defeatedByCurrentHero;
        remainingMonsterToDefeat -= defeatedByCurrentHero;

        // Step 2: If the monster is still active, the subsequent hero provides assistance.
        if (remainingMonsterToDefeat > 0) {
            const defeatedBySubsequentHero = Math.min(remainingMonsterToDefeat, subsequentHeroOffensive);
            powerRemovedFromMonster += defeatedBySubsequentHero;
            remainingMonsterToDefeat -= defeatedBySubsequentHero;

            // Update the subsequent hero's remaining capacity.
            // This modifies the array in place, affecting future iterations.
            heroPowerLevels[currentEncounterIndex + 1] = subsequentHeroOffensive - defeatedBySubsequentHero;
        }
        // If remainingMonsterToDefeat is 0, the subsequent hero's capacity is untouched,
        // which is implicitly handled as no update occurs for `heroPowerLevels[currentEncounterIndex + 1]`.

        // Accumulate the total power vanquished in this round to the overall total.
        totalVanquishedPower += powerRemovedFromMonster;
    }

    // Display the final accumulated vanquished power.
    console.log(totalVanquishedPower);
}

// Entry point for execution.
// Reads input from standard input (e.g., piped file or console input in competitive programming).
// Renamed the file system module variable for Type II change.
const fsOperations = require("fs");
processInputData(fsOperations.readFileSync("/dev/stdin", "utf8"));