// This module provides file system utilities to read input.
var fileSystemUtility = require('fs');

// The raw content read from the standard input stream.
var rawInputData = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

// All input lines are extracted from the raw data.
var inputLinesArray = rawInputData.split('\n');

// The initial line typically contains metadata (like the number of operations)
// which is not directly processed as a command. We skip it by slicing the array.
const operationalCommands = inputLinesArray.slice(1);

// This array serves as our primary data structure, modeling a dynamic collection
// where elements can be inserted, deleted, and accessed from both ends.
let managedDataCollection = [];

// A utility function to prepare the final state of the collection for display.
function formatCollectionForDisplay(collectionToFormat) {
    // If the collection is empty, a specific message is returned instead of just an empty string.
    if (collectionToFormat.length === 0) {
        return "The collection is currently empty.";
    }
    // Elements are joined by a single space to form the output string.
    return collectionToFormat.join(' ');
}


// Iterate through each command instruction provided in the input.
operationalCommands.forEach(function(currentOperationInstruction) {

    // Safeguard: Ignore any empty or whitespace-only lines to prevent parsing errors.
    if (!currentOperationInstruction.trim()) {
        return;
    }

    // Break down the command string into its constituent parts.
    const commandParts = currentOperationInstruction.split(' ');

    // Identify the specific type of operation to be performed.
    const operationType = commandParts[0];

    // Extract the associated value for the operation, if one is provided.
    const operationValue = (commandParts.length > 1) ? commandParts[1] : null;

    // A flag to quickly check if a value argument was supplied with the command.
    const hasOperationValue = operationValue !== null;


    // Conditional logic to execute the appropriate operation.
    if (operationType === 'insert') {
        // Pre-check: Ensure a value is present for insertion.
        if (!hasOperationValue) {
            return; // Skip if no value to insert.
        }
        // Inserts the new value at the beginning of the collection using spread syntax.
        managedDataCollection = [operationValue, ...managedDataCollection];

    } else if (operationType === 'delete') {
        // Pre-check: Ensure a value is present for deletion.
        if (!hasOperationValue) {
            return; // Skip if no value to delete.
        }
        // Finds the first occurrence of the value and removes it.
        const indexToDelete = managedDataCollection.indexOf(operationValue);
        if (indexToDelete !== -1) {
            managedDataCollection.splice(indexToDelete, 1);
        }

    } else if (operationType === 'deleteFirst') {
        // Guard: Only attempt to remove if the collection is not empty.
        if (managedDataCollection.length > 0) {
            managedDataCollection.shift(); // Removes the element from the front.
        }

    } else if (operationType === 'deleteLast') {
        // Guard: Only attempt to remove if the collection is not empty.
        if (managedDataCollection.length > 0) {
            managedDataCollection.pop(); // Removes the element from the end.
        }
    }
    // Unrecognized commands are implicitly ignored, maintaining original behavior.
});


// Display the final state of the collection after all operations are processed.
console.log(formatCollectionForDisplay(managedDataCollection));