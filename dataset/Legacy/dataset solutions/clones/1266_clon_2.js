function ProcessInputData(rawDataString) {
  // Trim leading/trailing whitespace and split the input into individual lines.
  const inputLines = rawDataString.trim().split("\n");

  // Determine the total number of lines provided in the input.
  let totalLines = inputLines.length;

  // Iterate through each line of the input.
  for (let lineIdx = 0; lineIdx < totalLines; lineIdx++) {
    // Parse the current line to extract height and width values.
    // Split by space, then convert each part to a number.
    let currentDimensions = inputLines[lineIdx].split(" ").map((strNum) => Number(strNum));

    // Assign the first value as height and the second as width.
    let gridHeight = currentDimensions[0];
    let gridWidth = currentDimensions[1];

    // If both height and width are zero, it's the termination condition.
    if (gridHeight === 0 && gridWidth === 0) {
      break; // Exit the loop.
    }

    // Initialize two string builders for the alternating row patterns.
    let firstRowPattern = "";
    let secondRowPattern = "";

    // Construct the two alternating patterns based on the grid width.
    for (let columnIndex = 0; columnIndex < gridWidth; columnIndex++) {
      if (columnIndex % 2 === 0) {
        // For even columns, first pattern gets '#', second gets '.'.
        firstRowPattern += "#";
        secondRowPattern += ".";
      } else {
        // For odd columns, first pattern gets '.', second gets '#'.
        firstRowPattern += ".";
        secondRowPattern += "#";
      }
    }

    // Print the grid rows based on the constructed patterns.
    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
      if (rowIndex % 2 === 0) {
        // For even rows, print the first pattern.
        console.log(firstRowPattern);
      } else {
        // For odd rows, print the second pattern.
        console.log(secondRowPattern);
      }
    }

    // Print an empty line after each grid to separate outputs.
    console.log();
  }
}

// Read input from standard input and pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
