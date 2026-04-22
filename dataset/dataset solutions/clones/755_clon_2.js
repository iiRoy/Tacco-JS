const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Parse the raw input string into an array of individual lines.
let contentLines = sourceData.trim().split("\n");

// The very first item is often a count, but not always used.
const unusedCount = parseInt(contentLines.shift(), 10);

// Extract the initial values for an arithmetic sequence: starting_val and step_size.
const [startingValue, stepSize] = contentLines.shift().split(" ").map(Number);

// Initialize a dictionary-like structure to store various associations.
let associationStore = {};

// Determine how many association operations will be performed.
const associationCount = parseInt(contentLines.shift(), 10);

// Iterate through each specified association operation.
for (let currentIteration = 0; currentIteration < associationCount; currentIteration++) {
    // Break down the current operation into its type and two operand keys.
    const [operationKind, operandA, operandB] = contentLines.shift().split(" ");

    // Check the operation type to decide the linking behavior.
    if (operationKind === "0") {
        // Operation type "0" implies a bidirectional or swapping link.
        const isOperandAPresent = associationStore.hasOwnProperty(operandA);
        const isOperandBPresent = associationStore.hasOwnProperty(operandB);

        if (!isOperandAPresent && !isOperandBPresent) {
            // If neither key exists, establish a new mutual link.
            associationStore[operandA] = operandB;
            associationStore[operandB] = operandA;
        } else if (isOperandAPresent && !isOperandBPresent) {
            // If only A exists, B takes A's partner, then A links to B.
            associationStore[operandB] = associationStore[operandA];
            associationStore[operandA] = operandB;
        } else if (!isOperandAPresent && isOperandBPresent) {
            // If only B exists, A takes B's partner, then B links to A.
            associationStore[operandA] = associationStore[operandB];
            associationStore[operandB] = operandA;
        } else {
            // If both exist, swap their associated values.
            [associationStore[operandA], associationStore[operandB]] = [associationStore[operandB], associationStore[operandA]];
        }
    } else {
        // Operation type "1" (or any other) implies a unidirectional assignment or re-assignment.
        const operandAExists = associationStore.hasOwnProperty(operandA);
        const operandBExists = associationStore.hasOwnProperty(operandB);

        if (!operandAExists && !operandBExists) {
            // If neither exists, A is simply assigned B.
            associationStore[operandA] = operandB;
        } else if (operandAExists && !operandBExists) {
            // If only A exists, A's value is updated to B.
            associationStore[operandA] = operandB;
        } else if (!operandAExists && operandBExists) {
            // If only B exists, A is assigned B's current associated value.
            associationStore[operandA] = associationStore[operandB];
        } else {
            // If both exist, A is assigned B's current associated value.
            associationStore[operandA] = associationStore[operandB];
        }
    }
}

// Retrieve the final key whose value needs to be determined.
let finalKeyQuery = contentLines.shift();

// If the final key has an association, update the query to its associated value.
if (associationStore.hasOwnProperty(finalKeyQuery)) {
    finalKeyQuery = associationStore[finalKeyQuery];
}

// Convert the potentially updated key to a numerical format for calculation.
const numericalFinalKey = parseInt(finalKeyQuery, 10);

// Compute and output the result using the arithmetic sequence formula: a + (n-1)d.
console.log(startingValue + ((numericalFinalKey - 1) * stepSize));