"use strict";

// Helper function to safely parse a string into an integer.
// Returns a default value (0) if parsing fails or the input is invalid.
const parseNumericValue = (strValue, defaultValue = 0) => {
    const parsedNumber = parseInt(strValue, 10);
    // Check if the parsed value is a valid number; otherwise, return the default.
    return Number.isInteger(parsedNumber) ? parsedNumber : defaultValue;
};

// Main function responsible for calculating the minimum number of attacks required
// to defeat a target with a given health, using a set of available weapons.
const calculateMinAttacks = (rawInputData) => {
    // Step 1: Process the raw input string
    // Trim any leading/trailing whitespace and split the input into an array of lines.
    const inputLines = rawInputData.trim().split('\n');

    // Guard clause: Ensure there's at least some input data to process.
    if (inputLines.length === 0) {
        console.error("Input processing error: No data lines were provided.");
        return; // Exit if input is empty
    }

    // Step 2: Parse the initial configuration (number of weapons and target's health)
    const firstLineSegments = inputLines[0].split(' ');
    // The total number of unique weapon types available.
    const totalWeaponTypes = parseNumericValue(firstLineSegments[0]);
    // The target's initial health points that need to be depleted.
    let currentTargetHealth = parseNumericValue(firstLineSegments[1]);

    // Guard clause: Validate the parsed initial values.
    if (totalWeaponTypes <= 0 || currentTargetHealth <= 0) {
        console.error("Input validation error: Invalid number of weapon types or target health specified.");
        return;
    }

    // Step 3: Parse and filter the weapon statistics
    // Each weapon has two damage values: [swing_damage, throw_damage].
    // We slice the array to get only the lines containing weapon data.
    const allWeaponStats = inputLines.slice(1, totalWeaponTypes + 1).map(weaponLine => {
        const damages = weaponLine.split(' ').map(damageStr => parseNumericValue(damageStr));
        // Validate that each weapon line provides two valid damage values.
        if (damages.length !== 2 || damages.some(isNaN)) {
            console.warn(`Warning: Skipping invalid weapon line: "${weaponLine}"`);
            return [0, 0]; // Return a placeholder for invalid entries.
        }
        return damages;
    })
    // Filter out any weapons that have zero or negative damage for both swing and throw, as they are useless.
    .filter(weapon => weapon[0] > 0 || weapon[1] > 0);

    // Guard clause: Ensure there are valid weapons to use.
    if (allWeaponStats.length === 0) {
        console.error("Processing error: No valid weapon statistics could be parsed.");
        return;
    }

    // Step 4: Determine the maximum possible swing damage
    // Create a copy of the weapon stats and sort it to find the highest swing damage.
    const weaponsSortedBySwing = [...allWeaponStats].sort((weaponA, weaponB) => weaponB[0] - weaponA[0]);
    const strongestSwingDamage = weaponsSortedBySwing[0][0];

    // Guard clause: Ensure the strongest swing damage is positive to avoid division by zero later.
    if (strongestSwingDamage <= 0) {
        console.error("Logic error: No weapon found with positive swing damage. Cannot defeat target.");
        return;
    }

    // Step 5: Identify and prioritize effective throw attacks
    // Filter for throw attacks that deal more damage than the strongest swing attack.
    // Sorting these by throw damage (descending) ensures we use the most impactful throws first.
    const optimalThrowAttacks = allWeaponStats
        .filter(weapon => weapon[1] > strongestSwingDamage)
        .sort((weaponA, weaponB) => weaponB[1] - weaponA[1]);

    // Step 6: Execute throw attacks as long as they are beneficial
    let totalThrowAttackCount = 0; // Initialize a counter for throw attacks.

    for (const currentWeapon of optimalThrowAttacks) {
        // If the target's health is already depleted, we don't need more attacks.
        if (currentTargetHealth <= 0) {
            break; // Exit the loop early.
        }

        const currentThrowDamage = currentWeapon[1];
        currentTargetHealth = currentTargetHealth - currentThrowDamage; // Apply damage.
        totalThrowAttackCount = totalThrowAttackCount + 1; // Increment throw count.
    }

    // Step 7: Calculate remaining damage using direct swing attacks if needed
    let finalSwingAttackCount = 0; // Initialize counter for swing attacks.

    // If the target still has health after all effective throws,
    // we must finish them off using the strongest available swing attack.
    if (currentTargetHealth > 0) {
        // Use Math.ceil to ensure any remaining fractional health is covered by a full swing.
        finalSwingAttackCount = Math.ceil(currentTargetHealth / strongestSwingDamage);
    }

    // Step 8: Output the total minimum attacks required
    // This is the sum of all throw attacks and any necessary final swing attacks.
    console.log(totalThrowAttackCount + finalSwingAttackCount);
};

// Self-executing anonymous function to handle input/output and error management.
(() => {
    try {
        // Dynamically import the 'fs' module for file system operations.
        const fileSystemModule = require('fs');
        // Read the entire content of standard input synchronously, decoded as UTF-8.
        const standardInputBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
        // Invoke the main calculation function with the processed input.
        calculateMinAttacks(standardInputBuffer);
    } catch (operationError) {
        // Log any errors that occur during file reading or processing.
        console.error("An operational error occurred:", operationError.message);
        // Optionally, terminate the process with an error code.
        process.exit(1);
    }
})();