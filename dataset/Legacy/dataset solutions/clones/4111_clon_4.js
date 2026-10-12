"use strict";

// Helper function to perform ceiling division, diverging from direct Math.ceil in main logic
const calculateCeilingDivision = (numerator, denominator) => Math.ceil(numerator / denominator);

// Helper function to determine the base number of actions (throws)
// based on the quantity of weapons, abstracting the conditional logic.
const determineInitialOperations = (armamentCount) => {
    return armamentCount === 1 ? 1 : armamentCount - 1;
};

// Main logic function, renamed and restructured
const resolveCombatOutcome = (scenarioInput) => {
    // Parse input data using destructuring and map for type conversion
    const battleLines = scenarioInput.trim().split('\n');
    const [headerLine, ...weaponEntries] = battleLines;

    const [weaponQuantity, targetLifeForce] = headerLine.split(' ').map(Number);

    // Transform weapon data into an array of objects for different data representation
    const arsenal = weaponEntries.slice(0, weaponQuantity).map(entry => {
        const [strikeValue, throwValue] = entry.split(' ').map(Number);
        return { strike: strikeValue, throw: throwValue };
    });

    let totalThrowDamage = 0;
    let highestStrikeValue = 0;

    // Iterate through armaments using 'for...of' loop, diverging from 'for...in'
    for (const armament of arsenal) {
        totalThrowDamage += armament.throw;
        if (armament.strike > highestStrikeValue) {
            highestStrikeValue = armament.strike;
        }
    }

    // Early exit condition, preserving exact behavior
    if (totalThrowDamage >= targetLifeForce) {
        return weaponQuantity;
    }

    // Calculate remaining health after all possible throws
    const remainingLifeForce = targetLifeForce - totalThrowDamage;

    // Calculate required strikes using the helper function
    const strikesRequired = calculateCeilingDivision(remainingLifeForce, highestStrikeValue);

    // Combine strikes and initial operations using the helper function
    const finalOperationCount = strikesRequired + determineInitialOperations(weaponQuantity);
    
    return finalOperationCount;
};

// External execution wrapper, diverging from the original 'main' function structure
const executeChallenge = (solverFunction) => {
    const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
    const result = solverFunction(rawInput);
    console.log(result);
};

// Invoke the execution wrapper with the solver function
executeChallenge(resolveCombatOutcome);
