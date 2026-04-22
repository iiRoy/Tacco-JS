"use strict";

// Helper utility to safely convert a string to an integer.
// It handles potential non-numeric inputs by returning a default of 0.
const convertToInteger = (inputStringValue) => {
    const parsedNumber = parseInt(inputStringValue, 10);
    // Basic check for NaN to ensure valid number conversion.
    if (isNaN(parsedNumber)) {
        // In a production environment, one might throw an error or log a warning.
        // For competitive programming, returning 0 or a similar default is common.
        return 0;
    }
    return parsedNumber;
};

// The primary function orchestrating the monster combat simulation.
// It takes raw input data, processes it, and determines the minimum actions.
const executeBattleStrategy = (rawInputData) => {
    // Input validation: ensure the data is a non-empty string.
    if (typeof rawInputData !== 'string' || rawInputData.trim() === '') {
        console.error("Battle simulation received empty or invalid input.");
        return; // Terminate execution if input is unusable.
    }

    // Prepare input by trimming whitespace and splitting into individual lines.
    const inputLines = rawInputData.trim().split("\n");

    // Extract global combat parameters from the first line.
    const firstDataLineParts = inputLines[0].split(" ");
    const numberOfWeaponsAvailable = convertToInteger(firstDataLineParts[0]);
    let currentMonsterVitality = convertToInteger(firstDataLineParts[1]);

    // Parse weapon attributes from subsequent lines.
    // Each weapon has [swing_power, throw_damage].
    // Filter out any potential blank lines before mapping.
    const weaponAttributeSet = inputLines
        .slice(1, numberOfWeaponsAvailable + 1)
        .filter(line => line.trim() !== '') // Remove empty lines
        .map(line => line.split(" ").map(convertToInteger));

    let maximumSwingPower = 0; // Tracks the highest 'a' value found.
    let indexOfBestSwingWeapon = -1; // Stores the array index of the weapon with max 'a'.
    let totalProjectileDamage = 0; // Accumulates the sum of all 'b' values.

    // Iterate through all weapons to identify the strongest and sum up throw damages.
    for (let weaponIterator = 0; weaponIterator < weaponAttributeSet.length; weaponIterator++) {
        const individualWeaponStats = weaponAttributeSet[weaponIterator];
        const weaponSwingDamage = individualWeaponStats[0]; // Attack power ('a').
        const weaponThrowDamage = individualWeaponStats[1]; // Throw damage ('b').

        totalProjectileDamage += weaponThrowDamage; // Add to cumulative throw damage.

        // Update the strongest swinging weapon if a new one is found.
        if (weaponSwingDamage > maximumSwingPower) {
            maximumSwingPower = weaponSwingDamage;
            indexOfBestSwingWeapon = weaponIterator;
        }
    }

    // Retrieve the specific stats for the weapon identified as having the highest swing power.
    // Provide a safe default if no weapons were processed (though unlikely with `numberOfWeaponsAvailable`).
    const weaponWithOptimalSwing = indexOfBestSwingWeapon !== -1
        ? weaponAttributeSet[indexOfBestBestSwingWeapon]
        : [0, 0]; // Fallback if no weapons.

    const optimalWeaponThrowDamage = weaponWithOptimalSwing[1];

    // Strategy Check 1: Can the monster be defeated by just throwing all available weapons?
    if (totalProjectileDamage >= currentMonsterVitality) {
        console.log(numberOfWeaponsAvailable); // If yes, total actions = total weapons thrown.
        return; // Battle concluded.
    }

    // Strategy Check 2: If throwing all weapons isn't enough, apply a mixed strategy.

    // First, determine the monster's health after throwing all weapons *except* the strongest one.
    // This step only modifies `currentMonsterVitality` if there's more than one weapon.
    let vitalityAfterNonOptimalThrows = currentMonsterVitality;
    if (numberOfWeaponsAvailable > 1) {
        const damageFromOtherWeaponsThrown = totalProjectileDamage - optimalWeaponThrowDamage;
        vitalityAfterNonOptimalThrows -= damageFromOtherWeaponsThrown;
    }
    // If `numberOfWeaponsAvailable` is 1, `vitalityAfterNonOptimalThrows` retains its original value.

    // Next, calculate the monster's health after also throwing the strongest weapon.
    // This implies that, for calculation purposes, all N weapons are considered thrown.
    const finalVitalityAfterAllWeaponThrows = vitalityAfterNonOptimalThrows - optimalWeaponThrowDamage;

    // Calculate how many additional swings of the strongest weapon are needed
    // to finish off the remaining monster health.
    let requiredAdditionalSwings = 0;
    if (finalVitalityAfterAllWeaponThrows > 0 && maximumSwingPower > 0) {
        // Use Math.ceil to ensure any remaining health, even fractional, requires a full swing.
        requiredAdditionalSwings = Math.ceil(finalVitalityAfterAllWeaponThrows / maximumSwingPower);
    } else if (finalVitalityAfterAllWeaponThrows <= 0) {
        // If monster is already defeated by throws (after initial check, and subsequent throw calculations),
        // no additional swings are needed.
        requiredAdditionalSwings = 0;
    } else {
        // This case handles scenarios where `finalVitalityAfterAllWeaponThrows > 0` but `maximumSwingPower` is 0.
        // The monster cannot be defeated by swings if the best weapon has no attack power.
        // In such a case, the problem implies it's impossible or requires infinite actions.
        // For cloning, we maintain the behavior of the original code which would lead to Infinity.
        requiredAdditionalSwings = Infinity;
    }

    // Compute the total number of actions based on the specific logic structure:
    // `requiredAdditionalSwings` plus the count of *other* weapons thrown.
    let totalEngagementActions;
    if (numberOfWeaponsAvailable === 1) {
        // For a single weapon: one throw action + any required swings.
        totalEngagementActions = requiredAdditionalSwings + 1;
    } else {
        // For multiple weapons: (total weapons - 1) throw actions + any required swings.
        totalEngagementActions = requiredAdditionalSwings + (numberOfWeaponsAvailable - 1);
    }

    // Output the final calculated number of actions to the console.
    console.log(totalEngagementActions);
};

// Self-invoking function to kick off the script execution.
// This reads input from standard input and passes it to the main processing function.
(function() {
    // The 'fs' module is typically available in Node.js environments for file system operations.
    const fileSystemModule = require('fs');
    // Read the entire standard input stream, assuming UTF-8 encoding.
    const standardInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    // Initiate the battle simulation with the acquired input.
    executeBattleStrategy(standardInputData);
})();