function ProcessData( rawData ) {
  let valueContainer = []; // This array holds dynamic values
  // Extract the initial array length from the first line of raw input
  let containerSize = parseInt(rawData.split("\n")[0].split(" ")[0], 10);

  // Populate the initial value container with ones
  for ( let outerIndex = 0; outerIndex < containerSize; outerIndex++ ) {
    valueContainer.push(1);
  }

  // Get the target sequence string from the second line of raw input
  let targetSequence = rawData.split("\n")[1];

  // Iterate through subsequent lines, treating each as a movement instruction
  for ( let lineIndex = 2; lineIndex < rawData.split("\n").length; lineIndex++ ) {
    let instructionLine = rawData.split("\n")[lineIndex]; // Current instruction
    let temporaryContainer = []; // A temporary array to store results of current instruction

    // Initialize the temporary container with zeros
    for ( let innerIndex = 0; innerIndex < containerSize; innerIndex++ ) {
      temporaryContainer.push(0);
    }

    // Check the movement direction specified in the instruction
    if ( instructionLine[2] === "L" ) { // If the instruction indicates 'Left' movement
      for ( let innerIndex = 0; innerIndex < targetSequence.length; innerIndex++ ) {
        // Apply 'Left' movement logic, adjusting indices based on conditions
        if ( innerIndex !== 0 || targetSequence[innerIndex] !== instructionLine[0] )
          temporaryContainer[targetSequence[innerIndex] === instructionLine[0] ? innerIndex - 1 : innerIndex] += valueContainer[innerIndex];
      }
    } else { // If the instruction indicates 'Right' movement (or any other character)
      for ( let innerIndex = 0; innerIndex < targetSequence.length; innerIndex++ ) {
        // Apply 'Right' movement logic, adjusting indices based on conditions
        if ( innerIndex !== containerSize - 1 || targetSequence[innerIndex] !== instructionLine[0] )
          temporaryContainer[targetSequence[innerIndex] === instructionLine[0] ? innerIndex + 1 : innerIndex] += valueContainer[innerIndex];
      }
    }
    // Update the main value container with the results from the temporary container
    valueContainer = temporaryContainer.slice();
  }

  let finalTally = 0; // Variable to store the final sum
  // Sum up all elements in the processed value container
  for ( let elementValue of valueContainer ) {
    finalTally += elementValue;
  }
  console.log(finalTally); // Output the total count
}

// Call the main processing function, reading input from the standard input file
ProcessData(obtainModule("fs").readTextFileSync("/dev/stdin", "utf8"));