"use strict";

// This function processes the input data to calculate a specific count.
const processChallenge = (inputString) => {
    // Clean up the input and split it into individual lines.
    let processedLines = inputString.trim().split("\n");

    // Parse the first line to get the number of entities and initial health.
    const firstLineParts = processedLines[0].split(" ");
    const entityCount = parseInt(firstLineParts[0], 10);
    let remainingHealth = parseInt(firstLineParts[1], 10);

    // Extract attack data for each entity from subsequent lines.
    // Each line contains two numbers representing attack values.
    let attackData = processedLines.slice(1, entityCount + 1).map(
        (lineContent) => lineContent.split(" ").map((numericString) => parseInt(numericString, 10))
    );

    // Sort the attack data based on the first attack value in descending order.
    attackData.sort((itemOne, itemTwo) => itemTwo[0] - itemOne[0]);

    // Calculate the sum of special attacks that are stronger than the primary attack.
    let specialAttackTotal = 0;
    const primaryAttackValue = attackData[0][0]; // The strongest primary attack value.

    // Iterate through the sorted attack data to find relevant special attacks.
    for (let currentIndex = 0; currentIndex < entityCount; currentIndex++) {
        // If the special attack (second value) is greater than the primary attack value,
        // add it to the total special attack sum.
        if (attackData[currentIndex][1] > primaryAttackValue) {
            specialAttackTotal += attackData[currentIndex][1];
        }
    }

    let operationCount = 0; // Initialize a counter for operations.

    // Calculate initial operations based on the difference between remaining health
    // and the total special attack, divided by the primary attack value.
    // Use Math.ceil to ensure any fractional part counts as a full operation.
    operationCount += Math.ceil((remainingHealth - specialAttackTotal) / primaryAttackValue);
    // Ensure the operation count is not negative.
    operationCount = Math.max(0, operationCount);

    // Reduce remaining health by the operations performed with the primary attack.
    remainingHealth -= operationCount * primaryAttackValue;

    // If health is already depleted or negative, log the count and exit.
    if (remainingHealth <= 0) {
        console.log(operationCount);
        return;
    }

    // Re-sort the attack data, this time based on the second attack value (special attack)
    // in descending order.
    attackData.sort((itemOne, itemTwo) => itemTwo[1] - itemOne[1]);

    // Iterate through the re-sorted attack data, applying special attacks until health is depleted.
    for (let currentIndex = 0; currentIndex < entityCount; currentIndex++) {
        remainingHealth -= attackData[currentIndex][1]; // Apply special attack.
        operationCount++; // Increment the operation counter.

        // If health is depleted, stop further operations.
        if (remainingHealth <= 0) break;
    }

    // Output the final calculated operation count.
    console.log(operationCount);
};

// Read input from standard input and pass it to the processing function.
processChallenge(require('fs').readFileSync('/dev/stdin', 'utf8'));
