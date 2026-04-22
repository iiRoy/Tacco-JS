var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Reads the raw data stream.
var textRows = sourceData.split('\n'); // Divides the raw data into separate lines.

var numContainers = +textRows.shift(); // Extracts the first line and converts it to a number, indicating the total number of containers.

var storageUnits = []; // Initializes an array to hold all the storage units.
for (var loopIndex = 0; loopIndex < numContainers; loopIndex++) { // Populates the storageUnits array with empty arrays.
  storageUnits.push([]);
}

var currentInstruction; // Variable to store each processing command.
while ((currentInstruction = textRows.shift()) !== 'quit') { // Continues processing until a 'quit' command is encountered.
  var operationDetails = currentInstruction.split(' '); // Parses the current command string into distinct components.

  if (operationDetails[0] === 'pop') { // Checks if the operation is to 'pop' an element.
    var transferObject = storageUnits[operationDetails[1] - 1].pop(); // Removes and retrieves the top element from the specified container.
    console.log(transferObject); // Prints the retrieved element to the console.
  } else if (operationDetails[0] === 'push') { // Checks if the operation is to 'push' an element.
    storageUnits[operationDetails[1] - 1].push(operationDetails[2]); // Adds a new element to the top of the specified container.
  } else { // Handles any other operation, implicitly a 'move' operation.
    var transferObject = storageUnits[operationDetails[1] - 1].pop(); // Removes an element from the source container.
    storageUnits[operationDetails[2] - 1].push(transferObject); // Adds the removed element to the destination container.
  }
}