let receivedLines = []; // Global collection for incoming standard input lines

// Configuration parameters
let configParams = {};

// Two-dimensional grid. Elements are -1 (right side of a bar), 0 (empty), 1 (left side of a bar)
let gridMatrix = [];

/**
 * Retrieves a path sequence starting from a given column and row.
 * @param {number} initialColumn - The starting column index.
 * @param {number} [initialRow=0] - The starting row index (defaults to 0 if not provided).
 * @returns {Array<number>} An array representing the sequence of column positions.
 */
const tracePathForward = function(initialColumn, initialRow) {
  if (!initialRow) {
    initialRow = 0;
  }
  let currentPosition = initialColumn;
  const pathSequence = [currentPosition];
  for (let rowIndex = initialRow; rowIndex < gridMatrix.length; rowIndex++) {
    currentPosition += gridMatrix[rowIndex][currentPosition];
    pathSequence.push(currentPosition);
  }
  return pathSequence;
};

/**
 * Obtains a path sequence from a specified final column, traced backward then reversed to be start-to-end.
 * @param {number} finalColumn - The target column index.
 * @returns {Array<number>} An array representing the sequence of column positions from start to end.
 */
const tracePathBackward = function(finalColumn) {
  let currentSpot = finalColumn;
  const reversePath = [currentSpot];
  for (let matrixRow = gridMatrix.length - 1; matrixRow >= 0; matrixRow--) {
    currentSpot += gridMatrix[matrixRow][currentSpot];
    reversePath.push(currentSpot);
  }
  return reversePath.reverse();
};

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(inputBuffer) {
  inputBuffer.trim().split('\n').forEach(function(inputLine) {
    receivedLines.push(inputLine);
  });
});

process.stdin.on('end', function() {
  let finalResult = "";

  // The original code uses $("textarea").val() to get input,
  // effectively ignoring any data received via process.stdin.
  // This behavior is preserved, assuming '$' (jQuery) is available.
  const inputSourceContent = $("textarea").val().split("\n");

  // Constructing the data structures for processing
  configParams = {};
  gridMatrix = [];

  // Using $.each to maintain original library dependency and loop break logic.
  // This assumes jQuery is globally available or polyfilled.
  $.each(inputSourceContent, function(idx, currentElement) {
    // Stop processing further elements if "0" is encountered
    if (currentElement === "0") {
      return false;
    }

    const propertyKeys = ["totalRows", "beginColumn", "finalColumn", "totalSteps"];
    if (idx < propertyKeys.length) {
      // Parse initial configuration values for the simulation
      configParams[propertyKeys[idx]] = parseInt(currentElement, 10);
      return;
    }

    // For elements beyond initial configuration, construct grid rows
    let currentRowData = [];
    for (let currentColumn = 0; currentColumn < configParams.totalRows - 1; currentColumn++) {
      let cellValue = parseInt(currentElement.charAt(currentColumn), 10);
      // Adjust cell value based on previous cell to form horizontal bars
      if (currentColumn > 0 && cellValue === 0 && currentRowData[currentColumn - 1] === 1) {
        cellValue = -1;
      }
      currentRowData.push(cellValue);
    }
    // Append the last cell in the row, determining its value based on the preceding cell
    currentRowData.push((currentRowData[currentRowData.length - 1] === 1) ? -1 : 0);
    gridMatrix.push(currentRowData);
  });

  // Adjusting column indices to be zero-based for internal calculations
  configParams.beginColumn--;
  configParams.finalColumn--;

  const mainPath = tracePathForward(configParams.beginColumn);

  // If the path from the start directly reaches the final column, output "0"
  // Note: The original code prints "0" but continues execution and might print another result.
  if (mainPath[mainPath.length - 1] === configParams.finalColumn) {
    console.log("0");
  }

  const goalPath = tracePathBackward(configParams.finalColumn);

  // Iterate through steps to find a potential swap point between the two paths
  for (let stepIndex = 0; stepIndex < configParams.totalSteps; stepIndex++) {
    // Check if paths are adjacent and the corresponding cells in the grid are empty
    if (Math.abs(mainPath[stepIndex] - goalPath[stepIndex]) === 1 && gridMatrix[stepIndex][mainPath[stepIndex]] === 0 && gridMatrix[stepIndex][goalPath[stepIndex]] === 0) {
      finalResult = (stepIndex + 1) + " " + (Math.min(mainPath[stepIndex], goalPath[stepIndex]) + 1);
      break; // Found the first suitable point, exit loop
    }
  }

  // If no suitable swap point was found, default the result to "1"
  if (finalResult === "") {
    finalResult = "1";
  }

  console.log(finalResult);
});