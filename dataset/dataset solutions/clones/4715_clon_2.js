/*
 * This JavaScript module processes a grid-based input.
 * Its primary purpose is to ascertain if a smaller pattern matrix
 * exists within a larger main grid, based on specific matching criteria.
 */
function ProcessInputData(rawDataString) {

  // The raw input string is first segmented into an array of lines.
  const lineSegments = rawDataString.split("\n");

  // The initial line provides the dimensions for the subsequent data structures.
  const dimensionsString = lineSegments[0].split(" ");

  // The first dimension indicates the total number of rows in the main grid.
  const rowsCount = parseInt(dimensionsString[0]);

  // The second dimension specifies the square size of the pattern to locate.
  const patternSize = parseInt(dimensionsString[1]);

  // An empty array is initialized to store the elements of the pattern matrix.
  const targetMatrix = [];

  // This block constructs the target pattern matrix from the input lines.
  // The pattern data begins after the initial dimension line and the main grid lines.
  for (
    let currentLineIdx = 0;
    currentLineIdx < patternSize;
    currentLineIdx++
  ) {
    // A temporary array is used to build each row of the pattern.
    const currentRow = [];

    // Iterate through the characters of the current pattern line.
    for (
      let currentColIdx = 0;
      currentColIdx < patternSize;
      currentColIdx++
    ) {
      // Each character is appended to the current pattern row.
      currentRow.push(
        lineSegments[currentLineIdx + 1 + rowsCount][currentColIdx]
      );
    }
    // Once a row is complete, it's added to the overall target pattern matrix.
    targetMatrix.push(currentRow);
  }

  // A boolean flag, initially set to false, will indicate if a match is found.
  let matchFound = false;

  // This is the main search loop, iterating through possible top-left
  // corner positions within the larger grid for the pattern.
  outerSearchLoop: for (
    let rowIndex = 0;
    rowIndex <= rowsCount - patternSize;
    rowIndex++
  ) {
    for (
      let colIndex = 0;
      colIndex <= rowsCount - patternSize;
      colIndex++
    ) {
      // This nested loop attempts to match the pattern's rows.
      innerPatternCheck: for (
        let patternRowIdx = 0;
        patternRowIdx < patternSize;
        patternRowIdx++
      ) {
        // This innermost loop compares individual characters of the pattern row.
        for (
          let patternColIdx = 0;
          patternColIdx < patternSize;
          patternColIdx++
        ) {
          // Compare a cell from the main grid with the corresponding cell in the pattern.
          // Remember that the main grid data starts from the second line (index 1).
          if (
            lineSegments[rowIndex + 1 + patternRowIdx][colIndex + patternColIdx] !==
            targetMatrix[patternRowIdx][patternColIdx]
          ) {
            // If a mismatch is detected, this current grid position is not a match.
            // The process breaks out of the pattern row comparison and moves to the next
            // potential starting position in the main grid.
            break innerPatternCheck;
          }
        }
        // IMPORTANT LOGIC: If execution reaches this point, it means that the entire
        // 'patternColIdx' loop completed without a 'break'. This indicates that
        // the current 'patternRowIdx'-th row of the pattern has perfectly matched
        // the corresponding segment in the main grid. According to the original logic,
        // finding *any single matching row* of the pattern is sufficient to declare
        // a full match for the entire operation.
        matchFound = true;
        // Upon finding such a match, all further searching is halted.
        break outerSearchLoop;
      }
    }
  }

  // Based on the final state of the 'matchFound' flag, an appropriate message is logged.
  if (matchFound) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

// The program's execution begins by reading all data from standard input.
// The raw data is then passed to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));