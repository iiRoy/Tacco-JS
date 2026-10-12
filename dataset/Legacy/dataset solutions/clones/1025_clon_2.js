var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input as a UTF-8 string

// Trim any leading/trailing whitespace from the raw input and then split it into an array of lines
var lineArray = (rawData.trim()).split("\n");

// Remove the first line from the array, as it often contains metadata like the number of operations
lineArray.shift();

// Initialize an empty array that will serve as our dynamic data store
var dataStore = [];

// Loop through each remaining line in the processed input array
for (var idx = 0; idx < lineArray.length; idx++) {
    // Split the current line by space to separate the command from its potential argument
    var commandParts = lineArray[idx].split(" ");

    // The first part is the type of operation to perform
    var operationType = commandParts[0];

    // The second part, if present, is the value to operate on; convert it to a number
    var operandValue = commandParts[1] - 0; // A common trick to convert string to number

    // Execute the appropriate action based on the operation type
    if (operationType === "insert") {
        // Add the operand value to the beginning of the data store
        dataStore.unshift(operandValue);
    } else if (operationType === "delete") {
        // Find the first occurrence of the operand value and remove it
        dataStore.splice(dataStore.indexOf(operandValue), 1);
    } else if (operationType === "deleteFirst") {
        // Remove the element at the very beginning of the data store
        dataStore.shift();
    } else if (operationType === "deleteLast") {
        // Remove the element at the very end of the data store
        dataStore.pop();
    }
}

// After processing all commands, print the final contents of the data store,
// with elements joined by a single space.
console.log(dataStore.join(" "));
