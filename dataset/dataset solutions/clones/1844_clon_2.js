function ProcessGridData(rawData) {
  // Process the incoming raw text data string
  rawData = rawData.trim().split("\n");

  var gridDimension = parseInt(rawData[0], 10);
  var selectionOrder = rawData[1] . split(" ") . map((numStr) => parseInt(numStr, 10));

  // Initialize the grid structure and a counter for undesirable placements
  var gridState = new Array(gridDimension);
  var dislikedTotal = 0;

  for (var loopVarX = 0; loopVarX < gridDimension; loopVarX++)
  {
    gridState[loopVarX] = new Array(gridDimension);
  }

  var positionMap = {}; // Maps seat ID to its 1-based (row, col) coordinates

  // Populate the grid with unique cell IDs and store their 1-based coordinates in the map
  for (var rowIterator = 1; rowIterator <= gridDimension; rowIterator++) {
    for (var colIterator = 1; colIterator <= gridDimension; colIterator++) {
      var currentCellId = (rowIterator - 1) * gridDimension + 1 + (colIterator - 1);
      gridState[rowIterator - 1][colIterator - 1] = currentCellId;
      positionMap[currentCellId] = [rowIterator, colIterator];
    }
  }

  // Iterate through the grid to simulate seat selections and calculate the total disliked count
  for (var rowIterator = 1; rowIterator <= gridDimension; rowIterator++)
  {
    for (var colIterator = 1; colIterator <= gridDimension; colIterator++)
    {
      // Determine the 0-indexed position in the selection order array
      var sequenceIndex = (rowIterator - 1) * gridDimension + (colIterator - 1);
      var selectedId = selectionOrder[sequenceIndex]; // Retrieve the specific seat ID for this turn

      // Fetch the 1-based row and column coordinates of the selected seat
      var selectedRow = positionMap[selectedId][0];
      var selectedCol = positionMap[selectedId][1];

      // Mark the selected seat as occupied (represented by 0)
      gridState[selectedRow - 1][selectedCol - 1] = 0;

      // Skip calculations for seats located on the grid boundaries
      if ( (selectedRow == 1) || (selectedCol == 1) || (selectedRow == gridDimension) || (selectedCol == gridDimension) ) {
        continue;
      }
      else
      {
        // Initialize counters for available seats in four conceptual directions
        var countDirectionA = 0; // Corresponds to vertical scan upwards (decreasing row index)
        var countDirectionB = 0; // Corresponds to vertical scan downwards (increasing row index)
        var countDirectionC = 0; // Corresponds to horizontal scan leftwards (decreasing column index, using row var for iteration)
        var countDirectionD = 0; // Corresponds to horizontal scan rightwards (increasing column index, using row var for iteration)

        // Scan along the column upwards from the current position
        for (var scanVarA = selectedRow; scanVarA > 0; scanVarA--) {
          if (gridState[scanVarA - 1][selectedCol - 1] != 0) countDirectionA++;
        }

        // Scan along the column downwards from the current position
        for (var scanVarB = selectedRow; scanVarB <= gridDimension; scanVarB++) {
          if (gridState[scanVarB - 1][selectedCol - 1] != 0) countDirectionB++;
        }

        // Scan along the row leftwards from the current position (original logic uses selectedRow for iterator)
        for (var scanVarC = selectedRow; scanVarC > 0; scanVarC--) {
          if (gridState[selectedRow - 1][scanVarC - 1] != 0) countDirectionC++;
        }

        // Scan along the row rightwards from the current position (original logic uses selectedRow for iterator)
        for (var scanVarD = selectedRow; scanVarD <= gridDimension; scanVarD++) {
          if (gridState[selectedRow - 1][scanVarD - 1] != 0) countDirectionD++;
        }
      }
      // Add the minimum count from the four directions to the running total
      dislikedTotal += Math.min(countDirectionA, countDirectionB, countDirectionC, countDirectionD);
    }
  }

  // Output the final computed disliked count to the console
  console.log(dislikedTotal);
}

// Entry point: Read input from standard input and pass it to the processing function
ProcessGridData(require("fs").readFileSync("/dev/stdin", "utf8"));