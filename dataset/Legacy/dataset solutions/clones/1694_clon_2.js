function ProcessGrid(rawData) {
  // Split the raw input into individual lines for processing.
  rawData = rawData.split('\n');

  // Parse grid dimensions and target count from the first line.
  let gridDimensions = rawData[0].split(' ');
  let gridHeight = parseInt(gridDimensions[0]);
  let gridWidth = parseInt(gridDimensions[1]);
  let targetCount = parseInt(gridDimensions[2]);

  // Remove the first line as it's already processed.
  rawData.shift();

  // Convert remaining lines into a 2D character grid.
  let charGrid = rawData.map(lineStr => lineStr.split(''));

  // Initialize the counter for valid combinations.
  let finalResult = 0;

  // Ensure the character grid has exactly 'gridHeight' rows.
  // This handles cases where input might have extra blank lines.
  charGrid.splice(gridHeight, charGrid.length);

  // Generate all possible row selection patterns.
  // Each pattern is a binary array where 0 means "keep" and 1 means "remove".
  let rowSelections = [[0], [1]]; // Base cases for a single row

  // Iterate to build patterns for all 'gridHeight' rows.
  for (let rowIter = 0; rowIter < gridHeight - 1; rowIter++) {
    let tempSelections = [];
    for (let selIdx = 0; selIdx < rowSelections.length; selIdx++) {
      // Create two new patterns from the current one: one keeping the next row, one removing it.
      let keepOption = [...rowSelections[selIdx]];
      let removeOption = [...rowSelections[selIdx]];

      keepOption.push(0); // Append 'keep' for the next row
      removeOption.push(1); // Append 'remove' for the next row

      tempSelections.push(keepOption);
      tempSelections.push(removeOption);
    }
    rowSelections = tempSelections; // Update the list of row patterns
  }

  // Generate all possible column selection patterns, similar to rows.
  let colSelections = [[0], [1]]; // Base cases for a single column

  // Iterate to build patterns for all 'gridWidth' columns.
  for (let colIter = 0; colIter < gridWidth - 1; colIter++) {
    let tempSelections = [];
    for (let selIdx = 0; selIdx < colSelections.length; selIdx++) {
      // Create two new patterns from the current one.
      let keepOption = [...colSelections[selIdx]];
      let removeOption = [...colSelections[selIdx]];

      keepOption.push(0); // Append 'keep' for the next column
      removeOption.push(1); // Append 'remove' for the next column

      tempSelections.push(keepOption);
      tempSelections.push(removeOption);
    }
    colSelections = tempSelections; // Update the list of column patterns
  }

  // Iterate through all combinations of row and column selections.
  let currentBlackCount = 0;
  for (let rSelIdx = 0; rSelIdx < rowSelections.length; rSelIdx++) {
    for (let cSelIdx = 0; cSelIdx < colSelections.length; cSelIdx++) {
      // For each combination, count the '#' characters in the "kept" cells.
      for (let rowCoord = 0; rowCoord < gridHeight; rowCoord++) {
        for (let colCoord = 0; colCoord < gridWidth; colCoord++) {
          // A cell is "kept" if both its row and column selection values are 0.
          if (rowSelections[rSelIdx][rowCoord] === 0 && colSelections[cSelIdx][colCoord] === 0 && charGrid[rowCoord][colCoord] === '#') {
            currentBlackCount++;
          }
        }
      }

      // If the count of '#' matches the target, increment the overall result.
      if (currentBlackCount === targetCount) {
        finalResult++;
      }
      // Reset the count for the next combination.
      currentBlackCount = 0;
    }
  }

  // Output the final count of valid combinations.
  console.log('%s', finalResult);
  return finalResult;
}

// This function is for debugging in a browser environment, not used in Node.js execution.
function testSolution(testCaseNum) {
  let testInput = document.getElementById("input" + testCaseNum).value;
  let computedAnswer = ProcessGrid(testInput);
  let testOutcome = "WA"; // Default to Wrong Answer

  // Compare computed answer with expected output from DOM.
  if (computedAnswer == document.getElementById("output" + testCaseNum).value.split('\n')[0]) {
    testOutcome = "AC"; // Set to Accepted if they match
  }
  // Display the test outcome in the DOM.
  document.getElementById("result" + testCaseNum).innerHTML = testOutcome;
}

// Execute the main processing function by reading input from stdin.
ProcessGrid(require("fs").readFileSync("/dev/stdin", "utf8"));
