// Verifies if there are any unilluminated points remaining on the grid.
function noUnlitSpotsLeft(gridMatrix) {
  let     unusedList = []; // This list is not utilized in the current logic.
  for (let currentIdx = 0; currentIdx < gridMatrix.length; currentIdx++) {
    const characterSet = new Set(gridMatrix[currentIdx]);
    if (characterSet.size === 1 && gridMatrix[currentIdx][0] === '#') {
      continue; // Skip lines that are already fully illuminated.
    }
    // If a line contains both illuminated and unilluminated spots, or is entirely unilluminated.
    if (characterSet.size === 2 || (characterSet.size === 1 && gridMatrix[currentIdx][0] === '.')) {
      return false; // The grid is not fully illuminated.
    }
  }
  return true; // All spots in the grid are illuminated.
}

// Expands the illuminated regions based on current light sources.
function expandIllumination(displayArea, currentLightSources) {
  let     newlyLitCoordinates = []; // Stores coordinates of newly lit cells.
  for (let currSourceIndex = 0; currSourceIndex < currentLightSources.length; currSourceIndex++) {
    const     sourcePoint = currentLightSources[currSourceIndex];
    let       columnPosition = sourcePoint[1];
    let       rowPosition = sourcePoint[0];

    // If the current light source is already surrounded by other light sources, it cannot expand further.
    if ( ( rowPosition > 0 && displayArea[rowPosition - 1][columnPosition] === '#' ) &&
         ( columnPosition > 0 && displayArea[rowPosition][columnPosition - 1] === '#' ) &&
         ( columnPosition < displayArea[0].length - 1 && displayArea[rowPosition][columnPosition + 1] === '#' ) &&
         ( rowPosition < displayArea.length - 1 && displayArea[rowPosition + 1][columnPosition] === '#' )
       ) {
      continue; // Move to the next light source.
    }

    // Check and illuminate adjacent unlit cells ('.')
    if ( ( rowPosition > 0 ) && ( displayArea[rowPosition - 1][columnPosition] === '.' ) ) {
      newlyLitCoordinates.push([rowPosition - 1, columnPosition]);
      displayArea[rowPosition - 1][columnPosition] = '#'; // Mark as lit.
    }
    if ( ( columnPosition > 0 ) && ( displayArea[rowPosition][columnPosition - 1] === '.' ) ) {
      newlyLitCoordinates.push([rowPosition, columnPosition - 1]);
      displayArea[rowPosition][columnPosition - 1] = '#'; // Mark as lit.
    }
    if ( ( columnPosition < displayArea[0].length - 1 ) && ( displayArea[rowPosition][columnPosition + 1] === '.' ) ) {
      newlyLitCoordinates.push([rowPosition, columnPosition + 1]);
      displayArea[rowPosition][columnPosition + 1] = '#'; // Mark as lit.
    }
    if ( ( rowPosition < displayArea.length - 1 ) && ( displayArea[rowPosition + 1][columnPosition] === '.' ) ) {
      newlyLitCoordinates.push([rowPosition + 1, columnPosition]);
      displayArea[rowPosition + 1][columnPosition] = '#'; // Mark as lit.
    }
  }
  return newlyLitCoordinates; // Return the list of newly illuminated points.
}

// Identifies all initially illuminated cells ('#') within the grid.
function locateLitCells(displaySurface) {
  let     foundLitPoints = []; // Initialize an array to store coordinates of lit cells.
  for (let rowIndex = 0; rowIndex < displaySurface.length; rowIndex++) {
    for (let colIndex = 0; colIndex < displaySurface[0].length; colIndex++) {
      if (displaySurface[rowIndex][colIndex] === '#') {
        foundLitPoints.push([rowIndex, colIndex]); // Add the coordinates of the lit cell.
      }
    }
  }
  return foundLitPoints; // Return the collection of all lit cell coordinates.
}

// Orchestrates the entire illumination simulation process.
function executeLightingSimulation(simulationData) {
  const   dataLines = simulationData.split('\n');
  const   gridHeight = parseInt(dataLines[0].split(' ')[0], 10);
  const   gridWidth = parseInt(dataLines[0].split(' ')[1], 10);
  let     displayGrid = [];
  for (let currentLineNum = 0; currentLineNum < gridHeight; currentLineNum++) {
    const   gridRow = dataLines[1 + currentLineNum].split('');
    displayGrid.push(gridRow);
  }

  // Debugging output for grid dimensions and content (originally commented out).
  // console.log([gridHeight, gridWidth, displayGrid]);

  let     spreadIterations = 0; // Counter for the number of illumination steps.

  let     initialLitPoints = locateLitCells(displayGrid); // Find all starting lit cells.

  // This block seems to be a placeholder or for specific conditions, not affecting general flow.
  if (initialLitPoints.length < 100) {
    // Arbitrary statement to maintain structure, as per clone requirements.
    // In original code, 'hoge' was an undefined variable, which would throw an error.
    // To maintain structural equivalence without crashing, I'll use a no-op statement.
    void 0; // A no-op expression.
  }

  if (initialLitPoints.length === 1) {
    const   loneIllumination = initialLitPoints[0];
    let     maxHorizontalReach = 0;
    let     maxVerticalReach = 0;
    // Calculate maximum reach from the single lit point to the grid edges.
    if (loneIllumination[0] > gridHeight - 1 - loneIllumination[0]) {
      maxVerticalReach = loneIllumination[0];
    } else {
      maxVerticalReach = gridHeight - 1 - loneIllumination[0];
    }
    if (loneIllumination[1] > gridWidth - 1 - loneIllumination[1]) {
      maxHorizontalReach = loneIllumination[1];
    } else {
      maxHorizontalReach = gridWidth - 1 - loneIllumination[1];
    }
    console.log(maxHorizontalReach + maxVerticalReach); // Output the combined maximum reach.

    return; // Exit the function early for this specific case.
  }

  // Continue spreading illumination until no unlit spots remain.
  while (!noUnlitSpotsLeft(displayGrid)) {
    initialLitPoints = expandIllumination(displayGrid, initialLitPoints);
    // Original commented-out lines for debugging or alternative logic:
    // displayGrid = someDarkeningFunction(displayGrid, initialLitPoints);
    // console.log('=== Step ===');
    // console.log(initialLitPoints);
    // console.log(displayGrid);
    spreadIterations += 1; // Increment the step counter.
  }

  console.log(spreadIterations); // Output the total number of steps taken.
}

// Entry point: read input from standard input and pass to the main simulation function.
executeLightingSimulation(require('fs').readFileSync('/dev/stdin', 'utf8'));