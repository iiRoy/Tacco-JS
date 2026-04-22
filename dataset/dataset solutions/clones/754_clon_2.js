const getModule = require('fs'); // Obtain the file system module for I/O operations

// Read raw data from standard input, using UTF-8 encoding
let rawContent = getModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace, then split into an array of lines
const lineFragments = rawContent.trim().split("\n");

// The first numerical value on the first line represents the total number of items (unused in this specific logic)
const totalElements = parseInt(lineFragments.shift(), 10);

// The next line contains two space-separated numbers: initial value 'startValue' and common difference 'commonDifference'
const [startValue, commonDifference] = lineFragments.shift().split(" ").map(Number);

// Initialize an empty object to store key-value mappings for transformations
let transformationMap = {};

// The next numerical value indicates the total count of operations to perform
const operationCount = Number(lineFragments.shift());

// Iterate through each operation based on 'operationCount'
for (let opIndex = 0; opIndex < operationCount; opIndex++) {
    // Each operation line contains three space-separated components: command type, first operand, second operand
    const [commandType, operandA, operandB] = lineFragments.shift().split(" ");

    // Check if the current command type is "1" (representing a specific type of mapping operation)
    if (commandType === "1") {
        // Scenario 1: Both operands are new (not yet in the map)
        if (!transformationMap.hasOwnProperty(operandA) && !transformationMap.hasOwnProperty(operandB)) {
            transformationMap[operandA] = operandB; // Map A to B
            transformationMap[operandB] = operandA; // Map B to A (bidirectional link)
        }
        // Scenario 2: Operand A exists, but Operand B is new
        else if (transformationMap.hasOwnProperty(operandA) && !transformationMap.hasOwnProperty(operandB)) {
            transformationMap[operandB] = transformationMap[operandA]; // B gets A's current mapping
            transformationMap[operandA] = operandB; // A now maps to B
        }
        // Scenario 3: Operand A is new, but Operand B exists
        else if (!transformationMap.hasOwnProperty(operandA) && transformationMap.hasOwnProperty(operandB)) {
            transformationMap[operandA] = transformationMap[operandB]; // A gets B's current mapping
            transformationMap[operandB] = operandA; // B now maps to A
        }
        // Scenario 4: Both operands already exist in the map
        else {
            // Swap their mapped values
            let tempVal = transformationMap[operandA];
            transformationMap[operandA] = transformationMap[operandB];
            transformationMap[operandB] = tempVal;
        }
    }
    // If the command type is not "1" (representing another type of mapping operation)
    else {
        // Scenario 1: Both operands are new
        if (!transformationMap.hasOwnProperty(operandA) && !transformationMap.hasOwnProperty(operandB)) {
            transformationMap[operandA] = operandB; // A maps to B
        }
        // Scenario 2: Operand A exists, B is new
        else if (transformationMap.hasOwnProperty(operandA) && !transformationMap.hasOwnProperty(operandB)) {
            transformationMap[operandA] = operandB; // A's mapping is updated to B
        }
        // Scenario 3: Operand A is new, B exists
        else if (!transformationMap.hasOwnProperty(operandA) && transformationMap.hasOwnProperty(operandB)) {
            transformationMap[operandA] = transformationMap[operandB]; // A maps to B's current mapping
        }
        // Scenario 4: Both operands already exist
        else {
            transformationMap[operandA] = transformationMap[operandB]; // A's mapping is updated to B's current mapping
        }
    }
}

// The final line contains a key to look up in the transformation map
let finalKey = lineFragments.shift();

// If the finalKey exists in the transformation map, update it to its mapped value
if (transformationMap.hasOwnProperty(finalKey)) {
    finalKey = transformationMap[finalKey];
}

// Convert the potentially transformed finalKey to a number
const numericFinalKey = Number(finalKey);

// Calculate the arithmetic progression value: initial value + ( (key - 1) * common difference )
let computedResult = startValue + ((numericFinalKey - 1) * commonDifference);

// Output the final calculated result to the console
console.log(computedResult);