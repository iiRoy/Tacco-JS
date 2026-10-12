'use strict';

const ProcessInputData = (rawInputContent) => {
    const contentLines = rawInputContent.trim().split('\n');

    const [targetDamageThreshold, availableSpellCount] = contentLines[0].split(' ').map(Number);

    const spellDefinitions = contentLines.slice(1).map(line => line.split(' ').map(Number));

    return { targetDamageThreshold, availableSpellCount, spellDefinitions };
};

const DetermineMinimumManaCost = (targetDamageThreshold, availableSpellCount, spellDefinitions) => {
    // Initialize an array to store the minimum mana cost for each possible damage value.
    // minManaForDamage[d] will hold the minimum mana to achieve exactly 'd' damage.
    // Initialize with 0. For d > 0, 0 signifies an unreachable state.
    // For d = 0, 0 signifies 0 mana cost.
    const minManaForDamage = Array(targetDamageThreshold + 1).fill(0);

    // Iterate through each possible damage value from 1 up to the target threshold.
    // This is a common dynamic programming pattern for unbounded knapsack problems,
    // where the outer loop iterates through the "capacity" (damage) and the inner loop
    // iterates through the "items" (spells).
    for (let currentDamageTarget = 1; currentDamageTarget <= targetDamageThreshold; ++currentDamageTarget) {
        // For each damage target, consider all available spells to see if they can contribute.
        for (let spellIndex = 0; spellIndex < availableSpellCount; ++spellIndex) {
            const [spellDamageValue, spellManaCost] = spellDefinitions[spellIndex];

            const previousDamageRequired = currentDamageTarget - spellDamageValue;

            // Check if using this spell is possible for the current damage target:
            // 1. The spell's damage must not exceed the current damage target.
            // 2. The state 'previousDamageRequired' must have been reachable.
            //    A state 'd' is reachable if minManaForDamage[d] is not 0 (meaning it has a positive cost)
            //    OR if 'd' is 0 (meaning 0 damage, which costs 0 mana).
            if (previousDamageRequired >= 0 && (minManaForDamage[previousDamageRequired] !== 0 || previousDamageRequired === 0)) {
                const potentialTotalMana = minManaForDamage[previousDamageRequired] + spellManaCost;

                // Update the minimum mana cost for 'currentDamageTarget':
                // If minManaForDamage[currentDamageTarget] is currently 0 (unreachable),
                // set it to the first found potential cost.
                // Otherwise, take the minimum between the current stored cost and the new potential cost.
                if (minManaForDamage[currentDamageTarget] === 0) {
                    minManaForDamage[currentDamageTarget] = potentialTotalMana;
                } else {
                    minManaForDamage[currentDamageTarget] = Math.min(minManaForDamage[currentDamageTarget], potentialTotalMana);
                }
            }
        }
    }

    return minManaForDamage[targetDamageThreshold];
};

const standardInput = require("fs").readFileSync("/dev/stdin", "utf8");
const { targetDamageThreshold, availableSpellCount, spellDefinitions } = ProcessInputData(standardInput);
const finalResult = DetermineMinimumManaCost(targetDamageThreshold, availableSpellCount, spellDefinitions);
console.log(finalResult);
