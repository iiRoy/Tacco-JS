( function( sourceText ) {
  // This self-executing function processes incoming textual information from standard input.
  // It removes any trailing newline character and then splits the entire text
  // into distinct blocks, each separated by two newline characters.
  var dataSections = sourceText . replace( /\n$/, '' ) . split( '\n\n' );

  // Iterate through each of the extracted data sections.
  for ( var sectionIndex = 0; sectionIndex < dataSections.length; sectionIndex++ ) {
    // Split the current data section into an array of individual lines.
    var currentLines = dataSections[ sectionIndex ] . split( '\n' );
    // Initialize an empty two-dimensional array (grid) to store numerical values.
    var numberGrid = [ ];
    // Loop through each line to populate the grid structure.
    for ( var lineNum = 0; lineNum < currentLines.length; lineNum++ ) {
      // For each character in the current line, convert it to a number
      // and add the resulting array of numbers as a new row to the grid.
      numberGrid . push( currentLines[ lineNum ] . split( '' ) . map( Number ) );
    }
    // Call the primary pattern detection function with the populated number grid
    // and print its returned value to the console.
    console . log( detectShape( numberGrid ) );
    // A previously used debug output for the grid, now commented out.
    // console.log(numberGrid);
  }
} ) ( require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' ) ); // Read the entire content of standard input as a UTF-8 string.

/*
 * This function initiates the search for a specific shape within an 8x8 numerical matrix.
 * It scans the matrix cell by cell to find the first occurrence of the value '1'.
 * Upon finding a '1', it delegates the task of identifying the actual shape
 * to a helper function.
 * @param {Array<Array<number>>} currentMatrix - The 2D array representing the grid of numbers.
 * @returns {string|undefined} Returns a character ('A' through 'G') representing the identified shape,
 *                             or undefined if no '1' is found or no shape matches.
 */
function detectShape( currentMatrix ) {
  // Iterate through each possible row coordinate, from 0 to 7.
  for ( var rowCoord = 0; rowCoord < 8; rowCoord++ ) {
    // Iterate through each possible column coordinate, from 0 to 7.
    for ( var colCoord = 0; colCoord < 8; colCoord++ ) {
      // If the value at the current grid position is exactly '1'.
      if ( currentMatrix[ rowCoord ][ colCoord ] === 1 ) {
        // Pass the matrix and the coordinates of the found '1' to the shape identification helper.
        return identifyFigure( currentMatrix, colCoord, rowCoord );
      }
    }
  }
  // If the loop completes without finding any '1', nothing is explicitly returned (implicitly undefined).
}

/*
 * This helper function attempts to identify a specific geometric figure
 * starting from a given (startX, startY) coordinate within the provided grid.
 * It checks for several predefined patterns (labeled 'A' through 'G').
 * @param {Array<Array<number>>} gridMap - The 2D array containing the numerical data.
 * @param {number} startX - The column index (x-coordinate) where the shape potentially begins.
 * @param {number} startY - The row index (y-coordinate) where the shape potentially begins.
 * @returns {string|undefined} A single character ('A'-'G') if a pattern is matched, otherwise undefined.
 */
function identifyFigure( gridMap, startX, startY ) {
  // Check for Pattern Alpha (a 2x2 block with the top-left corner as the starting point, if others exist)
  if (
    checkCoordinateValidity( gridMap, startX + 1, startY ) &&
    checkCoordinateValidity( gridMap, startX, startY + 1 ) &&
    checkCoordinateValidity( gridMap, startX + 1, startY + 1 )
  ) {
    return 'A';
  }
  // Check for Pattern Bravo (a vertical line of four segments)
  if (
    checkCoordinateValidity( gridMap, startX, startY + 1 ) &&
    checkCoordinateValidity( gridMap, startX, startY + 2 ) &&
    checkCoordinateValidity( gridMap, startX, startY + 3 )
  ) {
    return 'B';
  }
  // Check for Pattern Charlie (a horizontal line of four segments)
  if (
    checkCoordinateValidity( gridMap, startX + 1, startY ) &&
    checkCoordinateValidity( gridMap, startX + 2, startY ) &&
    checkCoordinateValidity( gridMap, startX + 3, startY )
  ) {
    return 'C';
  }
  // Check for Pattern Delta (a Z-shape, leaning towards the left)
  if (
    checkCoordinateValidity( gridMap, startX, startY + 1 ) &&
    checkCoordinateValidity( gridMap, startX - 1, startY + 1 ) &&
    checkCoordinateValidity( gridMap, startX - 1, startY + 2 )
  ) {
    return 'D';
  }
  // Check for Pattern Echo (a Z-shape, leaning towards the right)
  if (
    checkCoordinateValidity( gridMap, startX + 1, startY ) &&
    checkCoordinateValidity( gridMap, startX + 1, startY + 1 ) &&
    checkCoordinateValidity( gridMap, startX + 2, startY + 1 )
  ) {
    return 'E';
  }
  // Check for Pattern Foxtrot (an L-shape, oriented top-right)
  if (
    checkCoordinateValidity( gridMap, startX, startY + 1 ) &&
    checkCoordinateValidity( gridMap, startX + 1, startY + 1 ) &&
    checkCoordinateValidity( gridMap, startX + 1, startY + 2 )
  ) {
    return 'F';
  }
  // Check for Pattern Golf (a T-shape)
  if (
    checkCoordinateValidity( gridMap, startX + 1, startY ) &&
    checkCoordinateValidity( gridMap, startX, startY + 1 ) &&
    checkCoordinateValidity( gridMap, startX - 1, startY + 1 )
  ) {
    return 'G';
  }
  // If none of the above patterns are matched, the function implicitly returns undefined.
}

/*
 * This auxiliary function determines if a given set of coordinates (currentX, currentY)
 * falls within the acceptable boundaries of the 8x8 processing area.
 * Note: The '_grid' parameter is included for signature consistency but is not used
 * in the active logic of this function, mimicking the original behavior.
 * @param {Array<Array<number>>} _grid - The grid (not actively used for boundary check, but present).
 * @param {number} currentX - The X-coordinate (column index) to be validated.
 * @param {number} currentY - The Y-coordinate (row index) to be validated.
 * @returns {boolean} True if both coordinates are within the range [0, 8] inclusive, otherwise false.
 */
function checkCoordinateValidity( _grid, currentX, currentY ) {
  // Check if either the X or Y coordinate is outside the valid range [0, 8].
  // The original problem statement implies a grid where indices 0 through 8 are considered.
  if ( currentX < 0 || currentX > 8 || currentY < 0 || currentY > 8 ) {
    return false; // The coordinates are out of the defined bounds.
  }
  // The original implementation included a commented-out check for the cell's value (m[y][x] == 1).
  // Following the active logic of the original, if coordinates are within bounds, we return true.
  // if ( _grid[ currentY ][ currentX ] === 1 ) {
  return true; // The coordinates are within the acceptable limits.
  // }
}