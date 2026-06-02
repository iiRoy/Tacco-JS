"use strict";

// This function processes the input data to determine the minimum actions required.
const processInput = (inputData) => {
    // Normalize the input string by trimming whitespace and splitting it into individual lines.
    inputData = inputData.trim().split("\n");

    // Extract the total number of items and the target's health from the first line of input.
    const numItems = parseInt(inputData[0].split(" ")[0]);
    let targetHealth = parseInt(inputData[0].split(" ")[1]);

    // Parse the attack and throw damage statistics for each item from the subsequent lines.
    const itemStats = inputData.slice(1, numItems + 1).map(entry => entry.split(" "));

    // Initialize variables to keep track of the highest attack power found and its index,
    // along with the cumulative damage from throwing all items.
    let maxAttackPower = 0;
    let maxAttackIndex = 0;
    let totalThrowDamage = 0;

    // Iterate through each item's statistics to identify the strongest one
    // and calculate the sum of all throw damages.
    for (let idx in itemStats) {
        const currentAttack = parseInt(itemStats[idx][0]); // The regular attack power of the current item.
        const currentThrow = parseInt(itemStats[idx][1]);   // The throw damage of the current item.

        totalThrowDamage += currentThrow; // Add current item's throw damage to the total.

        // If the current item has a higher regular attack power than previously found,
        // update the strongest item's details.
        if (currentAttack > maxAttackPower) {
            maxAttackIndex = idx;
            maxAttackPower = currentAttack;
        }
    }

    // Store the statistics of the item with the highest regular attack power.
    let bestWeaponStats = itemStats[maxAttackIndex]; // This variable is assigned but not used further.

    // First strategy: Check if throwing all items is sufficient to defeat the target.
    if (totalThrowDamage >= targetHealth) {
        console.log(numItems); // If so, the answer is simply the total number of items.
        return; // Terminate execution as this is the optimal path.
    }

    // Second strategy: If throwing all items is not enough, we must use the strongest item for regular attacks.
    // We will throw all items except the strongest one.
    // Adjust the target's health by subtracting the throw damage of all items except the strongest.
    if (numItems > 1) {
        targetHealth -= (totalThrowDamage - itemStats[maxAttackIndex][1]);
    }
    // If numItems is 1, the expression (totalThrowDamage - itemStats[maxAttackIndex][1]) evaluates to 0,
    // so targetHealth remains unchanged, which is correct as there are no other items to throw.

    // Calculate the remaining health after accounting for the throws of all weaker items
    // and the throw of the strongest item itself.
    const remainingHealth = targetHealth - itemStats[maxAttackIndex][1];

    // Determine the number of regular attacks needed with the strongest item to defeat the remaining health.
    // We use Math.ceil to ensure any fractional health requires a full additional attack.
    const totalActionsRequired = Math.ceil(remainingHealth / itemStats[maxAttackIndex][0]);

    // Output the final calculated number of actions.
    // If there's only one item, it's `totalActionsRequired + 1` (one throw + attacks).
    // Otherwise, it's `totalActionsRequired + (numItems - 1)` (N-1 throws + attacks).
    console.log(numItems === 1 ? totalActionsRequired + 1 : totalActionsRequired + (numItems - 1));
};

// Read the input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
