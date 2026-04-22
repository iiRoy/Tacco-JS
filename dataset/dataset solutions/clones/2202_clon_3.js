'use strict';

/**
 * Helper function to parse a space-separated string of numbers.
 * @param {string} lineInput - The string line to parse.
 * @returns {number[]} An array of numbers.
 */
function parseNumericLine(lineInput) {
    // Trim whitespace and split by spaces, then convert each part to a number.
    return lineInput.trim().split(' ').map(valStr => {
        const num = +valStr; // Using unary plus for string to number conversion
        if (isNaN(num)) {
            // In a real application, this might throw an error or handle invalid input more robustly.
            // For this clone, we'll just return NaN which will likely cause issues later,
            // mimicking potential unexpected behavior if input isn't strictly numeric.
            console.error(`Warning: Non-numeric input encountered: "${valStr}"`);
        }
        return num;
    });
}

/**
 * Processes battle data to determine the minimum magic cost to defeat a monster.
 * This function calculates the optimal strategy using dynamic programming.
 * @param {string} rawBattleData - The raw string input containing battle parameters.
 */
function processBattleData(rawBattleData) {
    // Ensure input is not empty or just whitespace.
    if (!rawBattleData || rawBattleData.trim().length === 0) {
        console.error("Error: No battle data provided.");
        return;
    }

    // Split the entire input into individual lines.
    const battleLines = rawBattleData.trim().split('\n');

    // Parse the first line to get the target health and number of available spells.
    const generalParameters = parseNumericLine(battleLines[0]);
    if (generalParameters.length < 2) {
        console.error("Error: Insufficient parameters in the first line (expected target health and spell count).");
        return;
    }

    const targetHealth = generalParameters[0]; // The total health points to deplete
    const numSpells = generalParameters[1];    // The count of different spells available

    // Add a basic validation for input parameters.
    if (targetHealth <= 0 || numSpells <= 0) {
        console.log(0); // If no health to deplete or no spells, cost is 0.
        return;
    }

    // Extract spell descriptions from the remaining lines.
    // Each line describes a spell's damage output and its magic cost.
    const availableSpells = battleLines.slice(1).map(spellLine => {
        const currentSpellStats = parseNumericLine(spellLine);
        if (currentSpellStats.length < 2) {
            console.error(`Warning: Incomplete spell data found: "${spellLine}". Skipping.`);
            return null; // Indicate invalid spell entry
        }
        return {
            damageOutput: currentSpellStats[0], // How much damage this spell deals
            magicCost: currentSpellStats[1]     // How much magic points this spell consumes
        };
    }).filter(spell => spell !== null); // Filter out any invalid spell entries

    // Determine the maximum possible damage from a single spell.
    // This helps in sizing the DP array more accurately.
    let maxSingleSpellDamage = 0;
    if (availableSpells.length > 0) {
        maxSingleSpellDamage = Math.max(...availableSpells.map(s => s.damageOutput));
    } else {
        console.error("Error: No valid spells available to cast.");
        console.log(-1); // Indicate impossible scenario
        return;
    }

    // Initialize the dynamic programming array.
    // minMagicCost[i] will store the minimum magic points needed to deal 'i' damage.
    // Initialize with Infinity, as we are looking for a minimum value.
    // The size of the array should accommodate up to targetHealth + maxSingleSpellDamage to prevent out-of-bounds access
    // when calculating dp[j - spell.damageOutput] for small j.
    const dpArraySize = targetHealth + maxSingleSpellDamage + 1; // A safe upper bound for DP array size
    let minMagicCost = new Array(dpArraySize).fill(Infinity);

    // Base case: 0 damage requires 0 magic points.
    minMagicCost[0] = 0;

    // Iterate through each available spell.
    for (let spellIdx = 0; spellIdx < availableSpells.length; ++spellIdx) {
        const currentSpell = availableSpells[spellIdx];
        const currentSpellDamage = currentSpell.damageOutput;
        const currentSpellCost = currentSpell.magicCost;

        // For each possible damage target 'currentDamageTarget' from the spell's damage up to the maximum needed.
        // The loop goes up to 'targetHealth' because we are interested in reaching exactly 'targetHealth'.
        // However, the DP array itself can go higher to handle intermediate calculations.
        for (let currentDamageTarget = currentSpellDamage; currentDamageTarget <= targetHealth; ++currentDamageTarget) {
            // Check if the previous state (currentDamageTarget - currentSpellDamage) is reachable.
            // If it's Infinity, it means we cannot reach that damage amount, so we can't use this spell from there.
            if (minMagicCost[currentDamageTarget - currentSpellDamage] !== Infinity) {
                // Update the minimum magic cost for 'currentDamageTarget'.
                // It's either the current stored minimum, or the cost of reaching
                // 'currentDamageTarget - currentSpellDamage' plus the cost of the current spell.
                minMagicCost[currentDamageTarget] = Math.min(
                    minMagicCost[currentDamageTarget],
                    minMagicCost[currentDamageTarget - currentSpellDamage] + currentSpellCost
                );
            }
            // An additional check for values beyond targetHealth, if the problem allows for over-killing.
            // For this specific problem, we only care about exactly H.
            // However, a Type III change could involve considering "overkill" as well.
            // Let's add a small fragment for potential over-killing scenarios for robustness,
            // though it might not be strictly necessary for the original problem's solution.
            // This part is an "added fragment" illustrating a slightly different DP approach.
            if (currentDamageTarget + currentSpellDamage <= dpArraySize - 1) { // Check bounds
                if (minMagicCost[currentDamageTarget] !== Infinity) {
                     // This considers using the current spell to reach an even higher damage amount
                     // from the current 'currentDamageTarget'. This is slightly different from
                     // the original DP formulation which only considers building up to 'currentDamageTarget'.
                     // It's more like a knapsack where you can exceed capacity.
                     // For this specific problem, the original loop condition (j <= H) is usually sufficient.
                     // Let's keep it commented out to stick closer to the original problem's intent
                     // but demonstrate a thought process for "new fragments".
                     /*
                     minMagicCost[currentDamageTarget + currentSpellDamage] = Math.min(
                         minMagicCost[currentDamageTarget + currentSpellDamage],
                         minMagicCost[currentDamageTarget] + currentSpellCost
                     );
                     */
                }
            }
        }
    }

    // The result is the minimum magic cost to reach exactly 'targetHealth'.
    const finalMagicPoints = minMagicCost[targetHealth];

    // Check if the target health is reachable.
    if (finalMagicPoints === Infinity) {
        console.log(-1); // Indicate that the target health cannot be reached.
    } else {
        console.log(finalMagicPoints);
    }
}

// Read input from standard input and pass it to the processing function.
const fileSystem = require("fs");
const inputData = fileSystem.readFileSync("/dev/stdin", "utf8");
processBattleData(inputData);