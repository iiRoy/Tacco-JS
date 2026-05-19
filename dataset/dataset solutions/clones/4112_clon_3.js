"use strict";

const processBattle = (inputString) => {
    // Define constants for clarity and potential reusability
    const LINE_SEPARATOR = "\n";
    const VALUE_SEPARATOR = " ";
    const DECIMAL_RADIX = 10;

    // 1. Initial input parsing and data extraction
    const inputLines = inputString.trim().split(LINE_SEPARATOR);

    const firstLineData = inputLines[0].split(VALUE_SEPARATOR);
    const totalWeaponTypes = parseInt(firstLineData[0], DECIMAL_RADIX);
    let currentHealthRemaining = parseInt(firstLineData[1], DECIMAL_RADIX);

    // Helper function to parse a single weapon's attack and damage stats
    const parseWeaponStats = (weaponStatString) => {
        const [attackPowerStr, throwDamageStr] = weaponStatString.split(VALUE_SEPARATOR);
        return [parseInt(attackPowerStr, DECIMAL_RADIX), parseInt(throwDamageStr, DECIMAL_RADIX)];
    };

    // Parse all weapon statistics from the input lines
    const allWeaponStatistics = inputLines.slice(1, totalWeaponTypes + 1).map(parseWeaponStats);

    // 2. Determine the maximum direct swing attack power (aMax)
    let maximumSwingAttackPower = 0;
    if (allWeaponStatistics.length > 0) {
        // Create a temporary copy to sort by attack power without altering the original array order
        const sortedByAttackPower = [...allWeaponStatistics].sort((weaponA, weaponB) => weaponB[0] - weaponA[0]);
        maximumSwingAttackPower = sortedByAttackPower[0][0];
    }
    // Note: If allWeaponStatistics is empty, maximumSwingAttackPower remains 0.
    // Problem constraints typically ensure valid positive attack values.

    // 3. Identify and prioritize throwable attacks
    // Filter for weapons whose throw damage (b) is greater than the maximum swing attack power (aMax).
    // Then, sort these throwable weapons by their throw damage in descending order.
    const effectiveThrowableWeapons = allWeaponStatistics
        .filter(weapon => weapon[1] > maximumSwingAttackPower)
        .sort((weaponA, weaponB) => weaponB[1] - weaponA[1]);

    // 4. Apply throwable attacks until health is depleted or all effective throws are used
    let totalThrowsUsed = 0;

    // Guard clause: If the target's health is already zero or less, no attacks are needed.
    if (currentHealthRemaining <= 0) {
        console.log(0);
        return;
    }

    for (const currentWeapon of effectiveThrowableWeapons) {
        const damageFromThrow = currentWeapon[1];
        currentHealthRemaining -= damageFromThrow;
        totalThrowsUsed++;

        // If health drops to zero or below, output the count and exit
        if (currentHealthRemaining <= 0) {
            console.log(totalThrowsUsed);
            return;
        }
    }

    // 5. If health still remains, apply direct swing attacks
    // Calculate the number of direct swings needed to finish off the remaining health.
    // Use Math.ceil to account for partial health points requiring a full swing.
    // Assuming maximumSwingAttackPower is always positive if currentHealthRemaining > 0.
    const directSwingsRequired = Math.ceil(currentHealthRemaining / maximumSwingAttackPower);

    // Output the total number of attacks (throws + swings)
    console.log(totalThrowsUsed + directSwingsRequired);
};

// Execute the battle simulation by reading input from standard input
processBattle(require('fs').readFileSync('/dev/stdin', 'utf8'));
