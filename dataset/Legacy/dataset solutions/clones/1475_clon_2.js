var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var inputLines = rawData.split('\n'); // Divide the raw input into separate lines.

var stackCount = +inputLines.shift(); // The first line specifies how many data structures to prepare.

var dataContainers = []; // This array will hold our collection of stacks.
for (var idx = 0; idx < stackCount; idx++) {
    dataContainers.push([]); // Initialize each stack as an empty array.
}

var currentInstruction; // A variable to store the instruction read from the input.

// Loop through the input lines until a 'quit' command is encountered.
while ((currentInstruction = inputLines.shift()) != 'quit') {
    var parsedInstruction = currentInstruction.split(' '); // Break down the instruction into its components.

    // Determine the type of operation based on the first component.
    if (parsedInstruction[0] == 'pop') {
        // If it's a 'pop' command, remove and display the top element from the specified stack.
        var itemValue = dataContainers[parsedInstruction[1] - 1].pop();
        console.log(itemValue);
    }
    else if (parsedInstruction[0] == 'push') {
        // If it's a 'push' command, add a new element to the specified stack.
        dataContainers[parsedInstruction[1] - 1].push(parsedInstruction[2]);
    }
    else {
        // For any other command (implicitly a 'move' operation),
        // pop an element from the first specified stack...
        var itemValue = dataContainers[parsedInstruction[1] - 1].pop();
        // ...and push it onto the second specified stack.
        dataContainers[parsedInstruction[2] - 1].push(itemValue);
    }
}
