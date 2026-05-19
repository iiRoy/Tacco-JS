let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input from the standard input stream
let instructionSet = rawData.split('\n'); // Divide the raw input into individual lines, forming a set of instructions

let dataStore = []; // Initialize an empty array to function as our primary data structure (a stack)
let currentOperation; // Declare a variable to hold the instruction currently being processed

// Process instructions one by one until a termination command is encountered
while ((currentOperation = instructionSet.shift()) !== 'quit') {
    // Check the nature of the current instruction
    if (currentOperation === 'pop') {
        // If the instruction is 'pop', remove the top element from the data store
        let extractedValue = dataStore.pop();
        // Output the removed element to the console
        console.log(extractedValue);
    } else {
        // If the instruction is not 'pop' (implying a 'push' operation),
        // extract the value part of the instruction and add it to the data store
        dataStore.push(currentOperation.split(' ')[1]);
    }
}
