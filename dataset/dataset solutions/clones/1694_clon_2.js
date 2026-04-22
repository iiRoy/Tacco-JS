/*
 * This script processes grid data to identify patterns that match a specific criteria.
 * It systematically explores combinations of row and column selections within a grid
 * to count how many such selections result in a predefined number of '#' (black) cells.
 */
function ProcessGridData ( rawDataString )
{
  // Divide the raw input string into an array of individual lines.
  let linesOfData = rawDataString.split ( "\n" );

  // Parse the first line to extract the grid's dimensions (height, width)
  // and the target count of black cells for a valid combination.
  const firstLineElements = linesOfData [ 0 ].split ( " " );
  const gridHeight = parseInt ( firstLineElements [ 0 ], 10 );
  const gridWidth = parseInt ( firstLineElements [ 1 ], 10 );
  const targetCount = parseInt ( firstLineElements [ 2 ], 10 );

  // Remove the header line, as its information has been extracted.
  linesOfData.shift ( );

  // Convert the remaining lines into a 2D array (matrix) of characters.
  // Each inner array represents a row of the grid.
  let charMatrix = linesOfData.map ( ( rowString ) => rowString.split ( "" ) );

  // Initialize a counter to store the total number of combinations that meet the criteria.
  let finalResultCount = 0;

  // Trim the character matrix to ensure it only contains 'gridHeight' rows.
  // This handles cases where input might contain more lines than specified by gridHeight.
  charMatrix.splice ( gridHeight, charMatrix.length );

  // --- Step 1: Generate all possible row selection patterns ---
  // Each pattern is an array of 0s and 1s. '0' typically signifies selection, '1' deselection.
  // Start with base patterns for a single row: select (0) or deselect (1).
  let rowSelectionPatterns = new Array ( [ 0 ], [ 1 ] );

  // Iteratively build patterns for each row up to 'gridHeight'.
  // For 'H' rows, we need 'H-1' additional iterations from the base.
  for ( let currentRowIndex = 0; currentRowIndex < gridHeight - 1; currentRowIndex++ )
  {
    // A temporary array to hold the newly generated patterns for this iteration.
    let intermediatePatterns = new Array ( );

    // For each existing pattern, create two new ones: one appending '0', one appending '1'.
    for ( let prevPatternIndex = 0; prevPatternIndex < rowSelectionPatterns.length; prevPatternIndex++ )
    {
      const currentBasePattern = rowSelectionPatterns [ prevPatternIndex ];

      // Pattern with current row selected (0).
      let patternWithSelectedRow = [ ...currentBasePattern ];
      patternWithSelectedRow.push ( 0 );

      // Pattern with current row deselected (1).
      let patternWithDeselectedRow = [ ...currentBasePattern ];
      patternWithDeselectedRow.push ( 1 );

      intermediatePatterns.push ( patternWithSelectedRow );
      intermediatePatterns.push ( patternWithDeselectedRow );
    }
    // Update the main patterns array for the next iteration.
    rowSelectionPatterns = intermediatePatterns;
  }

  // --- Step 2: Generate all possible column selection patterns ---
  // This process is analogous to generating row patterns, but applies to 'gridWidth' columns.
  let columnSelectionPatterns = new Array ( [ 0 ], [ 1 ] );

  for ( let currentColIndex = 0; currentColIndex < gridWidth - 1; currentColIndex++ )
  {
    let intermediatePatterns = new Array ( );
    for ( let prevPatternIndex = 0; prevPatternIndex < columnSelectionPatterns.length; prevPatternIndex++ )
    {
      const currentBasePattern = columnSelectionPatterns [ prevPatternIndex ];

      let patternWithSelectedCol = [ ...currentBasePattern ];
      patternWithSelectedCol.push ( 0 );

      let patternWithDeselectedCol = [ ...currentBasePattern ];
      patternWithDeselectedCol.push ( 1 );

      intermediatePatterns.push ( patternWithSelectedCol );
      intermediatePatterns.push ( patternWithDeselectedCol );
    }
    columnSelectionPatterns = intermediatePatterns;
  }

  // --- Step 3: Evaluate each combination of row and column patterns ---
  let currentBlackCellCount = 0; // Tracks '#' cells for the current row/column pattern pair.

  // Iterate through every possible row selection pattern.
  for ( let rPatternIter = 0; rPatternIter < rowSelectionPatterns.length; rPatternIter++ )
  {
    // For each row pattern, iterate through every possible column selection pattern.
    for ( let cPatternIter = 0; cPatternIter < columnSelectionPatterns.length; cPatternIter++ )
    {
      // Now, iterate through every cell in the original grid.
      for ( let mRow = 0; mRow < gridHeight; mRow++ )
      {
        for ( let mCol = 0; mCol < gridWidth; mCol++ )
        {
          // A cell is considered "selected" if its corresponding row AND column are selected (value 0).
          // If the cell is selected AND it contains a '#' character, increment the counter.
          if ( rowSelectionPatterns [ rPatternIter ] [ mRow ] === 0 &&
               columnSelectionPatterns [ cPatternIter ] [ mCol ] === 0 &&
               charMatrix [ mRow ] [ mCol ] === "#" )
          {
            currentBlackCellCount++;
          }
        }
      }

      // After examining all cells for the current row/column pattern pair,
      // check if the count of black cells matches the 'targetCount'.
      if ( currentBlackCellCount === targetCount )
      {
        finalResultCount++; // If it matches, increment the overall result count.
      }

      // Reset the black cell counter for the next column pattern combination.
      currentBlackCellCount = 0;
    }
  }

  // Output the final tally of successful combinations to the console.
  console.log ( '%s', finalResultCount );
  return finalResultCount;
}

/*
 * This utility function provides a way to test the 'ProcessGridData' logic
 * within a web browser environment, simulating competitive programming inputs.
 * It retrieves input from HTML elements and displays the test outcome.
 */
function TestRunner ( testCaseNumber )
{
  const inputSourceElement = document.getElementById ( "input" + testCaseNumber );
  const expectedOutputElement = document.getElementById ( "output" + testCaseNumber );

  // Get the test input string from the designated HTML element.
  const testInputString = inputSourceElement.value;
  // Execute the main processing function with the test input.
  const computedAnswer = ProcessGridData ( testInputString );

  let testOutcome = "WA"; // Assume "Wrong Answer" by default.

  // Compare the computed answer (converted to string) with the expected output.
  // The expected output is taken from the first line of the output element's value.
  if ( computedAnswer.toString ( ) === expectedOutputElement.value.split ( "\n" ) [ 0 ] )
  {
    testOutcome = "AC"; // Set to "Accepted" if they match.
  }

  // Display the result ("AC" or "WA") in the designated result HTML element.
  document.getElementById ( "result" + testCaseNumber ).innerHTML = testOutcome;
}

// Entry point for execution in a Node.js environment (e.g., standard competitive programming setup).
// Reads the entire content of standard input and passes it to the primary processing function.
ProcessGridData ( require ( "fs" ).readFileSync ( "/dev/stdin", "utf8" ) );