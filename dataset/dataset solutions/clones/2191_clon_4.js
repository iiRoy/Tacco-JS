"use strict"

function processData(incomingPayload) {
    const dataLines = incomingPayload.split(/\r?\n/);

    const firstLineNumerical = dataLines[0].split(" ").map(s => parseInt(s, 10));
    const initialVitality = firstLineNumerical[0];
    const maxPermittedOperations = firstLineNumerical[1];

    const offensivePattern = dataLines[1].split(" ").map(s => parseInt(s, 10));

    // A recursive function to calculate the total operations until the entity's vitality drops below zero.
    // It takes the current vitality, the operations performed so far, the current index for the attack pattern,
    // and the array of strike values.
    const calculateDefeatOperations = (currentVitality, operationsPerformed, patternIndex, strikeValues) => {
        // Base case: If vitality is already negative, we've reached the defeat state.
        // The 'operationsPerformed' at this point is the count including the final, fatal blow.
        if (currentVitality < 0) {
            return operationsPerformed;
        }

        // Determine the next strike value using modulo for cyclic pattern access.
        const nextStrikeValue = strikeValues[patternIndex % strikeValues.length];
        // Calculate the vitality after the current strike.
        const newVitality = currentVitality - nextStrikeValue;

        // Recursive step: Call the function with updated vitality, incremented operations count,
        // and the next index in the pattern.
        return calculateDefeatOperations(newVitality, operationsPerformed + 1, patternIndex + 1, strikeValues);
    };

    // Initiate the recursive calculation starting with initial vitality, zero operations, and first attack.
    const totalOperationsToDefeat = calculateDefeatOperations(initialVitality, 0, 0, offensivePattern);

    // Compare the total operations required for defeat with the maximum permitted operations.
    // Output "yes" if defeat occurs within or at the permitted limit, otherwise "no".
    console.log(totalOperationsToDefeat <= maxPermittedOperations ? "yes" : "no");
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));