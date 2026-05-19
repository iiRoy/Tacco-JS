let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input from standard input as a string
let lineArray = rawData.trim().split("\n"); // Trim whitespace and split the input string into an array of lines

const firstVal = lineArray.shift() - 0; // Extract the first line, convert to number (unused in final calculation)

// Extract and parse the second line for arithmetic progression parameters
let [startTerm, commonDiff] = lineArray.shift().split(" ").map(Number);

const mappingStore = {}; // Initialize an object to store dynamic mappings or swaps

const opCount = lineArray.shift() - 0; // Get the number of operations to perform from the next line

// Loop through each operation specified in the input
for (let idx = 0; idx < opCount; idx++) {
    // Parse the current operation line into its components: operation type, operand A, operand B
    const [opType, operandA, operandB] = lineArray.shift().split(" ");

    // Ensure operandA exists in the mapping store, mapping it to itself if not
    if (!mappingStore.hasOwnProperty(operandA)) {
        mappingStore[operandA] = operandA;
    }

    // Ensure operandB exists in the mapping store, mapping it to itself if not
    if (!mappingStore.hasOwnProperty(operandB)) {
        mappingStore[operandB] = operandB;
    }

    // Perform the operation based on opType
    if (opType === "0") {
        // If opType is "0", swap the mappings of operandA and operandB
        [mappingStore[operandA], mappingStore[operandB]] = [mappingStore[operandB], mappingStore[operandA]];
    } else {
        // Otherwise (opType is not "0"), assign the mapping of operandB to operandA
        mappingStore[operandA] = mappingStore[operandB];
    }
}

let targetIndex = lineArray.shift() - 0; // Get the final target index from the remaining input

// Check if the target index has been remapped in the mappingStore
if (mappingStore.hasOwnProperty(targetIndex + "")) {
    // If remapped, use the remapped value, converting it to a number
    targetIndex = mappingStore[targetIndex] - 0;
}

// Calculate the final term of the arithmetic progression and print it
// Formula: a_n = a_1 + (n - 1) * d
console.log(startTerm + ((targetIndex - 1) * commonDiff));
