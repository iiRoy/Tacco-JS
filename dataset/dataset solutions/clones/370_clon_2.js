// Function to identify positions of values that appear more than once within a given list
function FindRepeatedIndices( dataList )
{
   // Initialize an array to count occurrences of numbers 0-9.
   // Assuming values are single digits for Sudoku context.
   let occurrenceCounts = new Array( 10 ).fill( 0 ) ;

   // Iterate through the input list to populate occurrence counts for each number.
   dataList.forEach( function( currentElement ) {
      // Ensure element is treated as a number before using as an index.
      occurrenceCounts[ Number( currentElement ) ]++ ;
   } ) ;

   // Collect indices of numbers that occurred two or more times,
   // indicating a violation of the "one per" rule.
   const problematicValues = [] ;
   occurrenceCounts.forEach( function( countVal, valueIndex ) {
      if ( countVal >= 2 ) {
         problematicValues.push( valueIndex ) ;
      }
   } ) ;

   // Find the original positions (indices) in the input list where these problematic values are located.
   const errorLocations = [] ;
   dataList.forEach( function( currentElement, elementPosition ) {
      // Check if the current element's value is one of the problematic values.
      if ( problematicValues.includes( Number( currentElement ) ) ) {
         errorLocations.push( elementPosition ) ;
      }
   } ) ;

   // Return the list of indices where duplicate values were found.
   return errorLocations ;
}


// Load raw input data from standard input using Node.js 'fs' module.
const rawInputContent = require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' ) ;

// Process the raw input into an array of lines, removing leading/trailing whitespace.
let parsedLines = rawInputContent . trim() . split( '\n' ) ;

// Buffer to accumulate the final output string for all test cases.
let finalOutputBuffer = "" ;

// Determine the number of test cases from the first line of input.
const totalTestCases = parseInt( parsedLines.shift(), 10 ) ;


// Loop through each individual test case (Sudoku board).
for ( let currentCaseIndex = 0 ; currentCaseIndex < totalTestCases ; currentCaseIndex++ )
{
   // Initialize two 9x9 grids for the current Sudoku board:
   // 1. `boardValues`: Stores the actual number values.
   // 2. `violationMarkers`: Marks positions that have rule violations (duplicates).
   let boardValues = [] ; // Stores the actual number values for the Sudoku grid.
   let violationMarkers = [] ; // Marks positions with rule violations (e.g., duplicates).

   // Populate the `boardValues` grid with 9 rows and initialize `violationMarkers` for each row.
   for ( let rowIdx = 0 ; rowIdx < 9 ; rowIdx++ )
   {
      // Read a line, split by space, and convert each part to a number.
      const currentRowData = parsedLines.shift().split( " " ).map( Number ) ;
      boardValues.push( currentRowData ) ;
      // Initialize a 9-element array with zeros for tracking violations in this row.
      violationMarkers.push( new Array( 9 ).fill( 0 ) ) ;
   }

   // Perform checks for duplicate numbers across rows, columns, and 3x3 subgrids.
   for ( let checkIndex = 0 ; checkIndex < 9 ; checkIndex++ )
   {
      // --- Check Current Row for Duplicates ---
      const badRowPositions = FindRepeatedIndices( boardValues[ checkIndex ] ) ;
      badRowPositions.forEach( function( elementPosition ) {
         violationMarkers[ checkIndex ][ elementPosition ]++ ;
      } ) ;

      // --- Construct and Check Current Column for Duplicates ---
      const columnData = [] ;
      for ( let colIdx = 0 ; colIdx < 9 ; colIdx++ ) {
         columnData.push( boardValues[ colIdx ][ checkIndex ] ) ;
      }
      const badColPositions = FindRepeatedIndices( columnData ) ;
      badColPositions.forEach( function( elementPosition ) {
         violationMarkers[ elementPosition ][ checkIndex ]++ ;
      } ) ;

      // --- Determine and Check Current 3x3 Subgrid for Duplicates ---
      // Calculate the major row and column offset for the 3x3 block.
      const blockRowOffset = Math.floor( checkIndex / 3 ) ;
      const blockColOffset = checkIndex % 3 ;

      // Define the absolute coordinates for all cells within the current 3x3 block.
      const subgridAbsoluteCoords =
      [
         [ 0 + blockRowOffset * 3, 0 + blockColOffset * 3 ], [ 0 + blockRowOffset * 3, 1 + blockColOffset * 3 ], [ 0 + blockRowOffset * 3, 2 + blockColOffset * 3 ],
         [ 1 + blockRowOffset * 3, 0 + blockColOffset * 3 ], [ 1 + blockRowOffset * 3, 1 + blockColOffset * 3 ], [ 1 + blockRowOffset * 3, 2 + blockColOffset * 3 ],
         [ 2 + blockRowOffset * 3, 0 + blockColOffset * 3 ], [ 2 + blockRowOffset * 3, 1 + blockColOffset * 3 ], [ 2 + blockRowOffset * 3, 2 + blockColOffset * 3 ]
      ] ;

      // Extract the actual values from the cells of the current 3x3 subgrid.
      const subgridElements = [] ;
      subgridAbsoluteCoords.forEach( function( coordPair ) {
         subgridElements.push( boardValues[ coordPair[0] ][ coordPair[1] ] ) ;
      } ) ;

      // Check the extracted subgrid elements for duplicates.
      const badBlockPositions = FindRepeatedIndices( subgridElements ) ;
      badBlockPositions.forEach( function( relativePosition ) {
         // Map the relative position within the 3x3 block back to absolute grid coordinates.
         const absoluteRow = subgridAbsoluteCoords[ relativePosition ][ 0 ] ;
         const absoluteCol = subgridAbsoluteCoords[ relativePosition ][ 1 ] ;
         violationMarkers[ absoluteRow ][ absoluteCol ]++ ;
      } ) ;
   }

   // --- Format the Board Values Based on Violation Markers ---
   // Iterate through the grid to apply formatting (add '*' or ' ') based on violations.
   for ( let r = 0 ; r < 9 ; r++ )
   {
      for ( let c = 0 ; c < 9 ; c++ )
      {
         boardValues[ r ][ c ] = ( violationMarkers[ r ][ c ] >= 1 ) ? "*" + boardValues[ r ][ c ] : " " + boardValues[ r ][ c ] ;
      }
   }

   // Append the formatted board to the output buffer.
   // Each row is joined without commas, then rows are joined by newlines, followed by two newlines for separation.
   finalOutputBuffer += boardValues.map( row => row.join("") ).join( "\n" ) + "\n\n" ;
}

// Print the final accumulated output to the console, removing any trailing whitespace.
console.log( finalOutputBuffer.trim() ) ;