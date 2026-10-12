(function(rawInput) {
    // The initial input string is split into an array of individual lines.
    rawInput = rawInput.split("\n");

    // This array will hold each line of input, further split into command tokens.
    var parsedCommands = [];
    // This array serves as a collection of distinct data storage units,
    // where each unit is itself an array (acting as a stack).
    var storageUnits = [];
    // A numerical pointer to keep track of the current command being processed.
    var commandPointer = 0;

    // Loop through each line of the raw input to parse it into command tokens.
    for (var lineCounter = 0; lineCounter < rawInput.length; lineCounter++) {
        // Each line is split by spaces to separate the command from its arguments.
        parsedCommands[lineCounter] = rawInput[lineCounter].split(" ");
    }

    // Increment the command pointer to move past any initial setup or header line.
    commandPointer++;

    // The main execution loop continues as long as the current command is not "quit".
    while (parsedCommands[commandPointer][0] != "quit") {
        // A switch statement is used to handle different command types.
        switch (parsedCommands[commandPointer][0]) {
            case "push":
                // Before pushing, ensure the target storage unit (identified by parsedCommands[commandPointer][1])
                // exists and is an array. If not, initialize it as an empty array.
                if (!(storageUnits[parsedCommands[commandPointer][1]] instanceof Array)) {
                    storageUnits[parsedCommands[commandPointer][1]] = [];
                }
                // Push the specified value (parsedCommands[commandPointer][2]) onto the target storage unit.
                storageUnits[parsedCommands[commandPointer][1]].push(parsedCommands[commandPointer][2]);
                // Advance to the next command in the sequence.
                commandPointer++;
                break;

            case "pop":
                // Retrieve and remove the top element from the specified storage unit.
                var poppedValue = storageUnits[parsedCommands[commandPointer][1]].pop();
                // Output the retrieved value to the standard console.
                console.log(poppedValue);
                // Advance to the next command.
                commandPointer++;
                break;

            case "move":
                // Similar to "push", ensure the destination storage unit (parsedCommands[commandPointer][2])
                // is properly initialized as an array if it doesn't exist.
                if (!(storageUnits[parsedCommands[commandPointer][2]] instanceof Array)) {
                    storageUnits[parsedCommands[commandPointer][2]] = [];
                }
                // Pop an item from the source storage unit (parsedCommands[commandPointer][1]).
                var movedItem = storageUnits[parsedCommands[commandPointer][1]].pop();
                // Push the popped item onto the destination storage unit.
                storageUnits[parsedCommands[commandPointer][2]].push(movedItem);
                // Advance to the next command.
                commandPointer++;
                break;
        }
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
