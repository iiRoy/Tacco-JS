var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input from standard input stream
var commandLines = rawData.trim().split("\n"); // Process raw input into an array of command strings
var dataStore = []; // Initialize a dynamic array to act as our primary data structure
var outputBuffer = []; // Initialize another array to accumulate results for final display

// Begin an indefinite processing loop for commands
while (true) {
   // Extract the next command from the beginning of the command list
   var currentCommand = commandLines.shift();

   // Check for the termination command
   if (currentCommand === "quit") {
      break; // Exit the loop if the "quit" command is encountered
   }

   // Evaluate the type of command received
   if (currentCommand === "pop") {
      // If the command is "pop", remove the first element from dataStore and add it to outputBuffer
      outputBuffer.push(dataStore.shift());
   } else {
      // For any other command, assume it's an "add" operation.
      // Split the command string by space and take the second part (the value to add).
      // Then, add this value to the beginning of the dataStore array.
      dataStore.unshift(currentCommand.split(" ")[1]);
   }
}

// After processing all commands, print the accumulated results, each on a new line
console.log(outputBuffer.join("\n"));
