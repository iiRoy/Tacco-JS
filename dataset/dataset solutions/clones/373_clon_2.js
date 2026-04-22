/*
 * This JavaScript module handles the transformation of a character grid.
 * It reads an 8x8 grid from standard input, rotates it clockwise,
 * and outputs the grid after 90, 180, and 270-degree rotations.
 */
function performRotation (
  inputPanel
) {
  // Initialize a new 2D array to hold the results of the rotation operation.
  let rotatedPanel = [ ] ;
  for ( let rowIndex = 0 ; rowIndex < 8 ; rowIndex ++ ) {
    rotatedPanel [ rowIndex ] = [ ] ; // Ensure each row is an empty array.
  }

  // Iterate over the elements of the source grid to populate the destination grid.
  for ( let rowIndex = 0 ; rowIndex < 8 ; rowIndex ++ ) {
    for ( let colIndex = 0 ; colIndex < 8 ; colIndex ++ ) {
      // The core logic for a 90-degree clockwise rotation:
      // new_panel[r][c] = original_panel[HEIGHT - 1 - c][r]
      rotatedPanel [ rowIndex ] [ colIndex ] = inputPanel [ 7 - colIndex ] [ rowIndex ] ;
    }
  }
  return rotatedPanel ; // Deliver the newly rotated array structure.
}


// --- Program entry point ---

// Retrieve all content from the standard input stream.
const fileData = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Clean up the raw input: trim whitespace and split into an array of lines.
const lineArray = ( fileData . trim ( ) ) . split ( "\n" ) ;

// Prepare a mutable array to store the active character grid.
let activePanel = [ ] ;

// Parse each line into an array of characters, forming the initial 8x8 grid.
for ( let idx = 0 ; idx < 8 ; idx ++ ) {
  activePanel . push ( lineArray [ idx ] . split ( "" ) ) ;
}

// Execute the first 90-degree rotation.
activePanel = performRotation ( activePanel ) ;
// Display the grid state after 90 degrees of rotation.
console . log ( "90\n" + activePanel . join ( "\n" ) ) ;

// Execute the second 90-degree rotation (total 180 degrees).
activePanel = performRotation ( activePanel ) ;
// Display the grid state after 180 degrees of rotation.
console . log ( "180\n" + activePanel . join ( "\n" ) ) ;

// Execute the third 90-degree rotation (total 270 degrees).
activePanel = performRotation ( activePanel ) ;
// Display the grid state after 270 degrees of rotation.
console . log ( "270\n" + activePanel . join ( "\n" ) ) ;

// End of script execution.