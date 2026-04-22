function processInputData ( sourceData ) {
  // Determine the total number of entries to process from the first line of input.
  const entryCount = sourceData[0] - 0 ;

  // Initialize a map to store colors assigned to each node.
  // Keys are node identifiers, values are arrays of assigned colors.
  let assignedColorsMap = {};

  // Track the highest color value that has been used so far.
  let highestColorValue = 0;

  // An array to store the sequence of colors chosen for each pair of nodes.
  const outputColorSequence = [];

  // Iterate through each pair of nodes provided in the input, starting from the second line.
  for ( let pairIndex = 1; pairIndex < entryCount; pairIndex++ ) {
    // Parse the current line to extract the two node identifiers.
    const nodeOne = sourceData[pairIndex].split(" ")[0] - 0 ;
    const nodeTwo = sourceData[pairIndex].split(" ")[1] - 0 ;

    // Ensure that both nodes have an entry in the assignedColorsMap,
    // initializing with an empty array if they haven't been seen before.
    assignedColorsMap[nodeOne] = assignedColorsMap[nodeOne] || [];
    assignedColorsMap[nodeTwo] = assignedColorsMap[nodeTwo] || [];

    // Combine the lists of colors already assigned to both nodes.
    const mergedColorSet = assignedColorsMap[nodeOne].concat(assignedColorsMap[nodeTwo]);

    // Tentatively set the next available color to one greater than the highest used color.
    let selectedColor = highestColorValue + 1;

    // If no colors are currently associated with either node (i.e., this is the first time
    // these nodes are being processed or they are isolated).
    if (mergedColorSet.length === 0) {
      // Assign the first color (1) to both nodes.
      assignedColorsMap[nodeOne].push(1);
      assignedColorsMap[nodeTwo].push(1);
      // Update the selected color and the highest color value.
      selectedColor = highestColorValue = 1;
    } else {
      // If there are existing colors, find the smallest available color that is not in use.
      const colorPresenceChecker = {};
      // Mark all existing colors as present in our temporary checker.
      mergedColorSet.forEach(
        (colorItem) =>
        (colorPresenceChecker[colorItem] = true)
      );

      // Iterate from color 1 up to the current highest used color to find a gap.
      for (let potentialColor = 1; potentialColor <= highestColorValue; potentialColor++) {
        // If the potential color is already present, skip it.
        if (colorPresenceChecker[potentialColor]) {
          continue;
        } else {
          // Otherwise, this is our chosen color, and we can stop searching.
          selectedColor = potentialColor;
          break;
        }
      }
      // Assign the newly selected color to both nodes.
      assignedColorsMap[nodeOne].push(selectedColor);
      assignedColorsMap[nodeTwo].push(selectedColor);

      // Update the highest color value if the selected color is greater.
      highestColorValue = Math.max(highestColorValue, selectedColor);
    }
    // Record the selected color for the current node pair.
    outputColorSequence.push(selectedColor);
  }

  // Output the maximum color value used across all assignments.
  console.log(highestColorValue);

  // Output each color in the sequence determined for the node pairs.
  outputColorSequence.forEach(
    (assignedValue) => {
      console.log(assignedValue);
    }
  );
}

// Invoke the main processing function with data read from standard input.
// The input is read as a UTF-8 string, trimmed, and split into lines.
processInputData(
  require('node:fs')
    .readFileSync( '/dev/stdin',  'utf8')
    .trim()
    .split( "\n")
);