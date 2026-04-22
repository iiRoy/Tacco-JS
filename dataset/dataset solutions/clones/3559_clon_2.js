function processGrid(rawData)
{
  // Extract grid dimensions from the initial input line
  var gridHeight = parseInt(rawData[0].split(" ")[0], 10);
  var gridWidth = parseInt(rawData[0].split(" ")[1], 10);

  /*
   * This array will hold the [row, column] coordinates
   * of all odd-valued cells in the grid.
   */
  var oddCoordinates = [];
  for (
       var rowIndex = 1;
       rowIndex <= gridHeight;
       rowIndex++
      ) {
    oddCoordinates = oddCoordinates.concat(
      rawData[rowIndex].split(" ").map(
        (currentValue, colIndex) => {
          // If the current cell's value is odd, store its coordinates
          if (currentValue % 2 === 1) {
            return [rowIndex, colIndex + 1]; // Adjust column to be 1-indexed
          }
          else {
            return null; // Otherwise, it's an even number, so we don't care
          }
        }
      )
    ).filter(
      coord => coord // Remove all the 'null' entries
    );
  }

  // This list will accumulate all the required movement operations
  var movementInstructions = [];

  // Iterate through pairs of odd coordinates to generate paths
  for (
       var pairIndex = 0;
       pairIndex < Math.floor(oddCoordinates.length / 2);
       pairIndex++
      )
  {
    var sourceCoord = oddCoordinates[pairIndex * 2];
    var targetCoord = oddCoordinates[pairIndex * 2 + 1];

    if (targetCoord == null) {
      break; // Should not happen if length is floor(N/2), but good check
    }

    // Convert target coordinates to a string for comparison in the loop
    var targetCoordStr = targetCoord.toString();

    // While the current source coordinate is not the target coordinate
    while (sourceCoord.toString() !== targetCoordStr) {
      if (sourceCoord[1] < targetCoord[1]) {
        // Move right: same row, increment column
        movementInstructions.push([
                                   sourceCoord[0],
                                   sourceCoord[1],
                                   sourceCoord[0],
                                   ++sourceCoord[1]
                                  ]);
      } else {
        // Move down: increment row, same column
        movementInstructions.push([
                                   sourceCoord[0],
                                   sourceCoord[1],
                                   ++sourceCoord[0],
                                   sourceCoord[1]
                                  ]);
      }
    }
  }

  // Output the total count of movements
  console.log(movementInstructions.length);
  // Output each movement instruction on a new line
  console.log(movementInstructions.join("\n"));
}


processGrid(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))