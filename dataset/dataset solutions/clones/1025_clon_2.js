// This program processes a sequence of commands to manipulate a list of numbers.

let rawContent = require('fs').readFileSync('/dev/stdin', 'utf8'); // Acquire raw input data from the standard input stream.

// Trim whitespace from the input and divide it into an array of individual lines.
const processedLines = (rawContent.trim()).split("\n");

// The first line is typically a count or header, so it's removed as per problem specification.
processedLines.shift();

let elementCollection = []; // Initialize a dynamic array to hold numeric elements.

// Iterate through each remaining line, interpreting it as a command.
for (let currentIdx = 0; currentIdx < processedLines.length; currentIdx++) {

  // Split the current command line into its constituent parts (command type and value).
  const commandParts = processedLines[currentIdx].split(" ");

  let operationType = commandParts[0]; // The first part is the string identifying the operation.
  let targetValue = Number(commandParts[1]); // The second part is the numeric value, explicitly converted.

  // --- Conditional logic to execute different list manipulation operations ---

  // If the command is to insert an element at the beginning.
  if (operationType === "addFront") {
    elementCollection.unshift(targetValue);
  }
  // If the command is to remove a specific element by its value.
  else if (operationType === "removeSpecific") {
    let itemPosition = elementCollection.indexOf(targetValue); // Find the zero-based index of the value.
    if (itemPosition !== -1) { // Only proceed if the item is found in the collection.
      elementCollection.splice(itemPosition, 1); // Remove one element at the found position.
    }
  }
  // If the command is to remove the very first element.
  else if (operationType === "deleteLeading") {
    elementCollection.shift(); // Remove and return the first element.
  }
  // If the command is to remove the very last element.
  else if (operationType === "deleteTrailing") {
    elementCollection.pop(); // Remove and return the last element.
  }
} // End of main command processing loop

// After processing all commands, output the final state of the collection.
// Elements are joined by a single space character.
console.log(elementCollection.join(" "));