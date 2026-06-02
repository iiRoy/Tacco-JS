(function(sourceData) {
    // The initial input string is split into an array of individual lines.
    sourceData = sourceData.split("\n");

    // Declare arrays to hold processed command data and the operational stack.
    let parsedLines = [];
    let valueStore = [];

    // Initialize a pointer for the current command being processed.
    let currentPosition = 0;

    // Iterate through each line of the raw input to parse commands and their arguments.
    for (let lineCounter = 0; lineCounter < sourceData.length; lineCounter++) {
        parsedLines[lineCounter] = sourceData[lineCounter].split(" ");
    }

    // Process commands sequentially until a "quit" instruction is encountered.
    while (parsedLines[currentPosition][0] !== "quit") {
        // Determine the action based on the first element of the current line.
        switch (parsedLines[currentPosition][0]) {
            case "push":
                // If the command is "push", add the second element (value) to the stack.
                valueStore.push(parsedLines[currentPosition][1]);
                currentPosition++; // Advance to the next command.
                break;
            case "pop":
                // If the command is "pop", remove and retrieve the top element from the stack.
                const poppedValue = valueStore.pop();
                console.log(poppedValue); // Output the retrieved value.
                currentPosition++; // Advance to the next command.
                break;
        }
    }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
