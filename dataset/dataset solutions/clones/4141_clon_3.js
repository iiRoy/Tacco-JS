// This module processes combat scenario data to determine the minimum number of actions required
// to achieve a specified damage target. It considers two types of attacks:
// 1. Standard attacks, which have a consistent strength.
// 2. Special 'throw' attacks, which have varying strengths.
// The strategy prioritizes powerful throws (those stronger than the strongest standard attack)
// before resorting to standard attacks to cover any remaining damage.
function evaluateCombatOutcome(rawInputString) {
    // --- Input Parsing and Initialization ---
    // Prepare the raw input string by splitting it into individual lines
    const inputLines = rawInputString.trim().split("\n");

    // Extract the primary combat parameters from the first line
    const [numElementsStr, targetHealthStr] = inputLines[0].split(" ");
    const numElements = parseInt(numElementsStr, 10); // Number of weapon/item entries
    const targetHealth = parseInt(targetHealthStr, 10); // The total damage that needs to be dealt

    // Initialize arrays to store the attack strengths and throw potentials for each item
    const baseAttackStrengths = [];
    const specialThrowPotentials = [];

    // Populate the attack and throw arrays from subsequent input lines
    // Each line (from index 1 to numElements) contains a base attack value and a special throw value
    for (let currentItemIndex = 1; currentItemIndex <= numElements; currentItemIndex++) {
        const [attackValueStr, throwValueStr] = inputLines[currentItemIndex].split(" ");
        baseAttackStrengths.push(parseInt(attackValueStr, 10));
        specialThrowPotentials.push(parseInt(throwValueStr, 10));
    }

    // --- Core Logic: Determine Optimal Strategy ---

    // Guard clause: If target health is non-positive, no actions are needed.
    if (targetHealth <= 0) {
        console.log(0);
        return;
    }

    // Find the maximum base attack strength among all available items.
    // This value is crucial for determining which throws are "powerful" and for calculating
    // the efficiency of standard attacks.
    const strongestBaseAttack = Math.max(...baseAttackStrengths);

    // Filter out 'powerful' throw potentials: these are throws that deal more damage
    // than the strongest standard attack. These are prioritized.
    const powerfulThrows = specialThrowPotentials.filter(potential => potential > strongestBaseAttack);

    // Calculate the total damage that can be dealt by all powerful throws combined.
    const totalPowerfulThrowDamage = powerfulThrows.reduce((currentSum, value) => currentSum + value, 0);

    let minimumActionsRequired = 0; // This variable will store the final count of actions

    // --- Decision Branch: Sufficient Powerful Throws or Not ---

    // Scenario 1: Total damage from powerful throws is less than the target health.
    // In this case, all powerful throws must be used, and the remaining damage
    // must be covered by repeated use of the strongest standard attack.
    if (totalPowerfulThrowDamage < targetHealth) {
        // First, account for all powerful throws
        minimumActionsRequired += powerfulThrows.length;

        // Calculate the damage still needed after applying all powerful throws
        const remainingDamageToCover = targetHealth - totalPowerfulThrowDamage;

        // Calculate how many times the strongest standard attack needs to be used.
        // We use Math.ceil to ensure any fractional damage is covered by a full attack.
        const directAttackCount = Math.ceil(remainingDamageToCover / strongestBaseAttack);
        minimumActionsRequired += directAttackCount;
    }
    // Scenario 2: Total damage from powerful throws is sufficient or exceeds the target health.
    // In this case, we only need to use a subset of the powerful throws,
    // prioritizing the strongest ones first, until the target health is met.
    else {
        // Sort the powerful throws in descending order of damage.
        // We create a shallow copy to avoid modifying the original array.
        const sortedPowerfulThrows = [...powerfulThrows].sort((a, b) => b - a);

        let currentDamageAccumulated = 0; // Tracks damage dealt so far in this branch
        let throwActionIndex = 0; // Index for iterating through sorted throws

        // Iterate through the sorted powerful throws, adding them one by one
        // until the target health is reached or exceeded.
        while (throwActionIndex < sortedPowerfulThrows.length && currentDamageAccumulated < targetHealth) {
            currentDamageAccumulated += sortedPowerfulThrows[throwActionIndex];
            minimumActionsRequired++; // Each throw counts as an action
            throwActionIndex++;
        }
    }

    // Output the final calculated minimum number of actions.
    console.log(minimumActionsRequired);
}

// --- Standard Input Handling (Do Not Modify Below This Line) ---
// This part ensures the script can read input from standard I/O (e.g., from a file or console).
evaluateCombatOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));