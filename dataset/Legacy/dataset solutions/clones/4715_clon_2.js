function ProcessInput(rawData) {
  // The raw input string is first split into an array of lines.
  rawData = rawData.split("\n");

  // The first line contains two space-separated integers: N (main grid size) and M (pattern size).
  var gridDimensions = rawData[0].split(" ");
  var mainGridSize = parseInt(gridDimensions[0]); // N: Represents the side length of the larger grid.
  var subgridSize = parseInt(gridDimensions[1]); // M: Represents the side length of the pattern to find.

  // An array to hold the characters of the pattern (template grid).
  var templateGrid = [];

  // Populate the template grid from the input.
  // The pattern data starts after the main grid data.
  // The main grid has 'mainGridSize' rows, so pattern data begins from rawData[mainGridSize + 1].
  for (var templateRowIndex = 0; templateRowIndex < subgridSize; templateRowIndex++) {
    var currentTemplateRow = []; // Temporary array for the current row of the pattern.
    for (var templateColIndex = 0; templateColIndex < subgridSize; templateColIndex++) {
      // Each character of the pattern is pushed into the current row.
      // The index calculation `templateRowIndex + 1 + mainGridSize` correctly points to the pattern's rows.
      currentTemplateRow.push(rawData[templateRowIndex + 1 + mainGridSize][templateColIndex]);
    }
    // Add the completed row to the template grid.
    templateGrid.push(currentTemplateRow);
  }

  // A boolean flag to track if the pattern has been successfully located.
  var isPatternFound = false;

  // Begin the search for the pattern within the main grid.
  // These loops iterate through all possible top-left corner positions (gridRowOffset, gridColOffset)
  // where the 'subgridSize' x 'subgridSize' pattern could potentially fit.
  mainGridScan: for (var gridRowOffset = 0; gridRowOffset < mainGridSize - subgridSize + 1; gridRowOffset++) {
    for (var gridColOffset = 0; gridColOffset < mainGridSize - subgridSize + 1; gridColOffset++) {
      // Now, compare the subgrid starting at (gridRowOffset, gridColOffset) with the template grid.
      templateComparison: for (var templateMatchRow = 0; templateMatchRow < subgridSize; templateMatchRow++) {
        for (var templateMatchCol = 0; templateMatchCol < subgridSize; templateMatchCol++) {
          // Access character from the main grid (remembering grid data starts from rawData[1])
          // and compare it with the corresponding character in the template grid.
          if (rawData[gridRowOffset + 1 + templateMatchRow][gridColOffset + templateMatchCol] !== templateGrid[templateMatchRow][templateMatchCol]) {
            // If a mismatch is found, this specific subgrid position does not match the pattern.
            // Break out of the inner comparison loops (`templateMatchRow` and `templateMatchCol`)
            // and try the next subgrid position in the main grid.
            break templateComparison;
          }
        }
        // IMPORTANT BEHAVIOR PRESERVATION:
        // If the inner 'templateMatchCol' loop completes without a 'break templateComparison',
        // it means the *entire current row* (templateMatchRow) of the pattern matched.
        // The original code's logic then immediately declares a full match and exits all loops.
        // This implies that finding just one matching row of the pattern (at the current offset)
        // is sufficient for a "Yes" result. This specific behavior is preserved.
        isPatternFound = true;
        break mainGridScan; // Exit all outer loops as a match is confirmed.
      }
    }
  }

  // Output the final result based on the 'isPatternFound' flag.
  if (isPatternFound) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

// Read the entire content of standard input synchronously and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
