(function(rawInstructionStream) {
  // This section prepares the incoming instruction stream for processing.
  let instructionLines = rawInstructionStream.split("\n");

  // An array to hold individual commands after parsing each line.
  let parsedCommands = [];

  // A stack-like data structure to manage data during operations.
  let valueStore = [];

  // A pointer indicating the current command being executed.
  let commandPointer = 0;

  // Iterate through each line of the input to break it down into command components.
  for (let lineCounter = 0; lineCounter < instructionLines.length; lineCounter++) {
    // Each line is split by space to separate the command verb from its arguments.
    parsedCommands[lineCounter] = instructionLines[lineCounter].split(" ");
  }

  // The main execution loop, continues until a "quit" command is encountered.
  while (parsedCommands[commandPointer][0] !== "quit") {
    // A conditional block to handle different command types.
    switch (parsedCommands[commandPointer][0]) {

      case "push":
        // For a 'push' operation, the associated value is added to the value store.
        valueStore.push(parsedCommands[commandPointer][1]);
        commandPointer++; // Advance the command pointer to the next instruction.
        break; // Exit the switch block.

      case "pop":
        // For a 'pop' operation, the top-most value is removed from the store.
        let extractedValue = valueStore.pop();
        // The retrieved value is then displayed.
        console.log(extractedValue);
        commandPointer++; // Advance the command pointer.
        break; // Exit the switch block.
    }
  }
})(require("fs").readFileSync("/dev/stdin", "utf8"));