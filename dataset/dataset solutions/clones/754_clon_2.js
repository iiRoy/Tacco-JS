var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into individual lines and remove any leading/trailing whitespace.
var lineSegments = rawData.trim().split("\n");

// The first line is 'n', which is not used in the calculation, but consumed.
var initialCount = lineSegments.shift() - 0;

// The next line contains 'a' and 'd', representing the first term and common difference.
var [firstTerm, commonDiff] = lineSegments.shift().split(" ").map(Number);

// Initialize an object to store key-value mappings.
var mappingStore = {};

// The number of operations to perform.
var operationCount = lineSegments.shift() - 0;

// Loop through each operation.
for (var idx = 0; idx < operationCount; idx++) {
    // Parse the current operation line into operation type and two keys.
    var [opType, keyOne, keyTwo] = lineSegments.shift().split(" ");

    // Check the operation type.
    if (opType === "1") {
        // Type 1 operation: Swap or assign based on existence.
        if (mappingStore.hasOwnProperty(keyOne) === false && mappingStore.hasOwnProperty(keyTwo) === false) {
            // Neither key exists, establish a bidirectional mapping.
            mappingStore[keyOne] = keyTwo;
            mappingStore[keyTwo] = keyOne;
        } else if (mappingStore.hasOwnProperty(keyOne) === true && mappingStore.hasOwnProperty(keyTwo) === false) {
            // Only keyOne exists, keyTwo takes keyOne's value, keyOne gets keyTwo.
            mappingStore[keyTwo] = mappingStore[keyOne];
            mappingStore[keyOne] = keyTwo;
        } else if (mappingStore.hasOwnProperty(keyOne) === false && mappingStore.hasOwnProperty(keyTwo) === true) {
            // Only keyTwo exists, keyOne takes keyTwo's value, keyTwo gets keyOne.
            mappingStore[keyOne] = mappingStore[keyTwo];
            mappingStore[keyTwo] = keyOne;
        } else {
            // Both keys exist, swap their mapped values.
            [mappingStore[keyOne], mappingStore[keyTwo]] = [mappingStore[keyTwo], mappingStore[keyOne]];
        }
    } else {
        // Type 2 operation: Assign based on existence.
        if (mappingStore.hasOwnProperty(keyOne) === false && mappingStore.hasOwnProperty(keyTwo) === false) {
            // Neither key exists, assign keyTwo to keyOne.
            mappingStore[keyOne] = keyTwo;
        } else if (mappingStore.hasOwnProperty(keyOne) === true && mappingStore.hasOwnProperty(keyTwo) === false) {
            // Only keyOne exists, assign keyTwo to keyOne.
            mappingStore[keyOne] = keyTwo;
        } else if (mappingStore.hasOwnProperty(keyOne) === false && mappingStore.hasOwnProperty(keyTwo) === true) {
            // Only keyTwo exists, assign keyTwo's value to keyOne.
            mappingStore[keyOne] = mappingStore[keyTwo];
        } else {
            // Both keys exist, assign keyTwo's value to keyOne.
            mappingStore[keyOne] = mappingStore[keyTwo];
        }
    }
}

// Get the final key from the remaining input lines.
var finalKey = lineSegments.shift();

// If the final key exists in the mapping store, update it with its mapped value.
if (mappingStore.hasOwnProperty(finalKey)) {
    finalKey = mappingStore[finalKey];
}

// Convert the final key to a number.
finalKey = finalKey - 0;

// Calculate and print the result using the arithmetic progression formula: a + (k-1)*d.
console.log(firstTerm + ((finalKey - 1) * commonDiff));
