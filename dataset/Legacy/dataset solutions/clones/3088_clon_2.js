function ProcessInput(rawData) {
  // Initialize an array to store counts, let's call it 'countArray'.
  var countArray = [];
  // The first line of input contains the size of the array.
  var arraySize = rawData.split("\n")[0].split(" ")[0];

  // Populate the initial countArray with ones.
  for (var idx = 0; idx < arraySize; idx++) {
    countArray.push(1);
  }

  // The second line of input is a sequence string.
  var sequenceString = rawData.split("\n")[1];

  // Iterate through the remaining lines, each representing a command.
  for (var idx = 2; idx < rawData.split("\n").length; idx++) {
    var commandInstruction = rawData.split("\n")[idx]; // Current command.
    var tempArray = []; // A temporary array for calculations.

    // Initialize the temporary array with zeros.
    for (var k = 0; k < arraySize; k++) {
      tempArray.push(0);
    }

    // Check the direction of the command (L for Left, R for Right).
    if (commandInstruction[2] === "L") {
      // Process 'Left' movement.
      for (var k = 0; k < sequenceString.length; k++) {
        // Apply movement logic based on character match and position.
        if (k !== 0 || sequenceString[k] !== commandInstruction[0]) {
          tempArray[sequenceString[k] === commandInstruction[0] ? k - 1 : k] += countArray[k];
        }
      }
    } else {
      // Process 'Right' movement.
      for (var k = 0; k < sequenceString.length; k++) {
        // Apply movement logic based on character match and position.
        if (k !== arraySize - 1 || sequenceString[k] !== commandInstruction[0]) {
          tempArray[sequenceString[k] === commandInstruction[0] ? k + 1 : k] += countArray[k];
        }
      }
    }
    // Update the main countArray with the results from the temporary array.
    countArray = tempArray.concat();
  }

  // Calculate the total sum of entities in the final array.
  var totalEntities = 0;
  for (var entityCount of countArray) {
    totalEntities += entityCount;
  }
  // Output the final sum.
  console.log(totalEntities);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
