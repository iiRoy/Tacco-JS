let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string into an array of lines.
let linesOfData = rawData.trim().split("\n");

// Extract the first numerical value, which is not used in the final calculation.
let initialCount = Number(linesOfData.shift());

// Parse the next line to get the first term and common difference for an arithmetic progression.
let [firstTerm, commonDifference] = linesOfData.shift().split(" ").map(Number);

// Initialize an object to store key-value mappings.
const mappingStore = {};

// Get the total number of mapping operations to perform.
let operationCount = Number(linesOfData.shift());

// Iterate through each mapping operation.
for (let opIndex = 0; opIndex < operationCount; opIndex++) {
    // Extract the operation type and the two keys involved in the current operation.
    let [operationType, firstKey, secondKey] = linesOfData.shift().split(" ");

    // Conditional logic based on the operation type.
    if (operationType === "0") {
        // Operation type "0" implies a bidirectional mapping or a swap.
        // Case 1: Both keys are new to the mapping store.
        if (!mappingStore.hasOwnProperty(firstKey) && !mappingStore.hasOwnProperty(secondKey)) {
            mappingStore[firstKey] = secondKey;
            mappingStore[secondKey] = firstKey;
        }
        // Case 2: Only the first key exists in the store.
        else if (mappingStore.hasOwnProperty(firstKey) && !mappingStore.hasOwnProperty(secondKey)) {
            mappingStore[secondKey] = mappingStore[firstKey];
            mappingStore[firstKey] = secondKey;
        }
        // Case 3: Only the second key exists in the store.
        else if (!mappingStore.hasOwnProperty(firstKey) && mappingStore.hasOwnProperty(secondKey)) {
            mappingStore[firstKey] = mappingStore[secondKey];
            mappingStore[secondKey] = firstKey;
        }
        // Case 4: Both keys already exist; their mapped values are swapped.
        else {
            let temporaryValue = mappingStore[firstKey];
            mappingStore[firstKey] = mappingStore[secondKey];
            mappingStore[secondKey] = temporaryValue;
        }
    } else {
        // Operation type "1" implies a unidirectional mapping.
        // Case 1: Neither key is present in the store.
        if (!mappingStore.hasOwnProperty(firstKey) && !mappingStore.hasOwnProperty(secondKey)) {
            mappingStore[firstKey] = secondKey;
        }
        // Case 2: Only the first key is present.
        else if (mappingStore.hasOwnProperty(firstKey) && !mappingStore.hasOwnProperty(secondKey)) {
            mappingStore[firstKey] = secondKey;
        }
        // Case 3: Only the second key is present.
        else if (!mappingStore.hasOwnProperty(firstKey) && mappingStore.hasOwnProperty(secondKey)) {
            mappingStore[firstKey] = mappingStore[secondKey];
        }
        // Case 4: Both keys are present.
        else {
            mappingStore[firstKey] = mappingStore[secondKey];
        }
    }
}

// Retrieve the final key from the remaining input lines.
let finalKey = linesOfData.shift();

// If the final key has a mapping, update it to its mapped value.
if (mappingStore.hasOwnProperty(finalKey)) {
    finalKey = mappingStore[finalKey];
}

// Convert the final key to a numerical type for calculation.
finalKey = Number(finalKey);

// Calculate the value using the arithmetic progression formula: a + (n-1) * d.
// The result is then printed to the console.
console.log(firstTerm + ((finalKey - 1) * commonDifference));
