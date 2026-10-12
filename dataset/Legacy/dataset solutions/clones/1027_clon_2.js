var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input data from the standard input stream
var commandLines = rawData.split('\n'); // Divide the raw data into an array of individual command strings

// Discard the initial line, which often contains metadata like the number of operations.
commandLines.shift();

var dataQueue = []; // Initialize an empty array to serve as our dynamic data structure

// Process each command line sequentially
commandLines.forEach(function(currentOperation) {
    // Parse the current command line into its constituent parts (e.g., command type and argument)
    var operationParts = currentOperation.split(' ');

    // Evaluate the first part of the command to determine the required action
    if (operationParts[0] === 'insert') {
        // If the command is 'insert', prepend the specified value to the data structure.
        // This effectively adds an element to the front of the queue.
        dataQueue = [operationParts[1]].concat(dataQueue);
    } else if (operationParts[0] === 'delete') {
        // If the command is 'delete', locate and remove the first occurrence of the specified value.
        for (var idx = 0; idx < dataQueue.length; idx++) {
            if (dataQueue[idx] === operationParts[1]) {
                dataQueue.splice(idx, 1); // Remove one element at the found index.
                break; // Exit the loop after the first match is deleted.
            }
        }
    } else if (operationParts[0] === 'deleteFirst') {
        // If the command is 'deleteFirst', remove the element at the very beginning of the data structure.
        dataQueue.shift();
    } else if (operationParts[0] === 'deleteLast') {
        // If the command is 'deleteLast', remove the element at the very end of the data structure.
        dataQueue.pop();
    }
});

// After all operations have been executed, output the final state of the data structure.
// The elements are joined by a single space for display.
console.log(dataQueue.join(' '));
