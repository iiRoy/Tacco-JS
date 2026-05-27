function ProcessInputData(rawData) {
  // Split the entire input string into individual lines
  const inputLines = rawData.split("\n");

  // Parse the initial configuration parameters from the first line
  const tempParts = inputLines[0].split(" ");
  const gridHeight = Number(tempParts[0]);
  const gridWidth = Number(tempParts[1]); // This variable is parsed but not used in the original logic.
  const jumpSize = Number(tempParts[2]);

  // Create a map to store coordinates for each cell value
  // The index of this array corresponds to the cell's numeric value.
  const coordinateMap = [];

  // Iterate through the grid rows to populate the coordinate map
  for (let rowIndex = 1; rowIndex <= gridHeight; rowIndex++) {
    const currentCells = inputLines[rowIndex].split(" ");

    // Iterate through the cells in the current row
    for (let colIndex = 0; colIndex < currentCells.length; colIndex++) {
      const cellValue = Number(currentCells[colIndex]);
      // Store the 1-based row and column coordinates for the cell value
      coordinateMap[cellValue] = { x: rowIndex, y: colIndex + 1 };
    }
  }

  // Determine the number of queries (examinations)
  const queryCount = Number(inputLines[gridHeight + 1]);

  // Initialize arrays to hold the start and end points for each query
  const startPoints = [];
  const endPoints = [];

  // Populate the startPoints and endPoints arrays from the input lines
  for (let queryIdx = 1; queryIdx <= queryCount; queryIdx++) {
    const queryParts = inputLines[gridHeight + 1 + queryIdx].split(" ");
    startPoints.push(Number(queryParts[0]));
    endPoints.push(Number(queryParts[1]));
  }

  // Initialize an array to store the calculated results for each query
  const resultsArray = [];

  // Process each query to calculate the total Manhattan distance
  for (let queryIndex = 0; queryIndex < startPoints.length; queryIndex++) {
    resultsArray[queryIndex] = 0; // Initialize the result for the current query

    // Calculate the number of steps required for the current query
    const iterationCount = (endPoints[queryIndex] - startPoints[queryIndex]) / jumpSize;

    // Loop through each step within the current query
    for (let stepIndex = 0; stepIndex < iterationCount; stepIndex++) {
      // Get the coordinates for the current starting point of the step
      const currentCoord = coordinateMap[startPoints[queryIndex] + stepIndex * jumpSize];
      // Get the coordinates for the next point in the step sequence
      const nextCoord = coordinateMap[startPoints[queryIndex] + (stepIndex + 1) * jumpSize];

      // Add the Manhattan distance between the current and next coordinates to the total
      resultsArray[queryIndex] += Math.abs(nextCoord.x - currentCoord.x) + Math.abs(nextCoord.y - currentCoord.y);
    }
  }

  // Output the results, with each result on a new line
  console.log(resultsArray.join("\n"));
}

// The following line handles standard input/output and should not be modified.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
