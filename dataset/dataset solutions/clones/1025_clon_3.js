const fileSystem = require('fs');

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const processedLines = rawInputData.trim().split("\n");

processedLines.shift(); // Discard the first line as per original logic

let managedList = []; // Renamed from 'list', using 'let' as it's modified

// Define constants for command types to improve readability (Type III addition)
const COMMAND_INSERT = "insert";
const COMMAND_DELETE = "delete";
const COMMAND_DELETE_FIRST = "deleteFirst";
const COMMAND_DELETE_LAST = "deleteLast";

// Iterate through each command line using a for...of loop (Type III structural change)
for (const currentCommandLine of processedLines) {
    const commandSegments = currentCommandLine.split(" ");

    const operationIdentifier = commandSegments[0];

    let numericOperand;
    // Parse the numeric operand only if it exists (e.g., for 'insert' or 'delete')
    // Using parseInt with radix 10 for explicit number conversion, equivalent to '-0'
    if (commandSegments.length > 1) {
        numericOperand = parseInt(commandSegments[1], 10);
    }

    // Use a switch statement for command handling (Type III structural change)
    switch (operationIdentifier) {
        case COMMAND_INSERT:
            managedList.unshift(numericOperand);
            break;
        case COMMAND_DELETE:
            // Preserve original behavior: if element is not found, indexOf returns -1.
            // splice(-1, 1) removes the last element of the array.
            managedList.splice(managedList.indexOf(numericOperand), 1);
            break;
        case COMMAND_DELETE_FIRST:
            managedList.shift();
            break;
        case COMMAND_DELETE_LAST:
            managedList.pop();
            break;
        // No default case needed as the original code does not handle unknown commands
    }
}

// Output the final state of the list, joined by spaces
console.log(managedList.join(" "));
