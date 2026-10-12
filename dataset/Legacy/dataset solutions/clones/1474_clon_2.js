(function(rawData) {
    // Split the entire input string by newline characters to get individual lines.
    var lines = rawData.split('\n');

    // The very first line specifies the total number of stacks to be managed.
    var stackCount = Number(lines.shift());

    // Initialize an array where each element will represent a distinct stack.
    var stackCollection = [];
    for (var idx = 0; idx < stackCount; idx++) {
        stackCollection[idx] = []; // Each stack is initially an empty array.
    }

    // Enter an infinite loop to process commands until a 'quit' command is received.
    while (true) {
        // Retrieve the next command line, remove it from the 'lines' array, and split it by spaces.
        var cmdParts = lines.shift().split(' ');
        var opType = cmdParts[0]; // The first part is the operation type (e.g., 'push', 'pop', 'quit').
        var paramA = cmdParts[1]; // The second part is the first argument, typically a stack index.
        var paramB = cmdParts[2]; // The third part is the second argument, e.g., an item to push or a target stack index.

        // Check if the current operation is the termination command.
        if (opType === 'quit') {
            return; // Exit the immediately invoked function expression.
        }

        // Handle the 'push' operation: add an item to a specified stack.
        if (opType === 'push') {
            // Convert the stack index (paramA) to a number and adjust for 0-based indexing.
            stackCollection[Number(paramA) - 1].push(paramB);
        }
        // Handle the 'pop' operation: remove and print an item from a specified stack.
        else if (opType === 'pop') {
            // Convert the stack index (paramA) to a number and adjust for 0-based indexing.
            // Pop the top item and print it to the console.
            console.log(stackCollection[Number(paramA) - 1].pop());
        }
        // Handle the 'move' operation (implied if not 'push' or 'pop'): move an item between stacks.
        else {
            // Convert the source stack index (paramA) to a number and adjust for 0-based indexing.
            // Pop an item from the source stack.
            var movedItem = stackCollection[Number(paramA) - 1].pop();
            // Convert the destination stack index (paramB) to a number and adjust for 0-based indexing.
            // Push the popped item onto the destination stack.
            stackCollection[Number(paramB) - 1].push(movedItem);
        }
    }
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read all input from standard input as a UTF-8 string.
