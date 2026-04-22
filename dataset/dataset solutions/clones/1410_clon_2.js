function obtainExternalData () {
  /*
   * This function is responsible for reading input from the standard input
   * device, typically a file or console stream, and processing it.
   */
  const fileSystemModule = require("fs"); /* Access the Node.js file system module */
  const rawFileData = fileSystemModule.readFileSync("/dev/stdin", "utf8"); // Read the entire content as UTF-8
  return rawFileData.split( /[\r\n]+/ ); /* Split the content into an array of lines, handling various line endings */
}

// Process each line obtained from the input source
obtainExternalData().every( function ( currentRecord ) {
  // Parse the current line to extract dimensions
  const segmentCollection = currentRecord.split( ' ' );
  const gridHeight = Number( segmentCollection[0] ); // Convert first segment to a number for height
  const gridWidth = Number( segmentCollection[1] ); // Convert second segment to a number for width

  // Initialize a two-dimensional array (matrix) for the output pattern
  const resultantMatrix = new Array( gridHeight );

  /*
   * Iterate through each row of the matrix to generate the checkered pattern.
   * The pattern alternates between '#.' and '.#' based on the row index.
   */
  for ( let rowIterator = 0; rowIterator < resultantMatrix.length; rowIterator++ ) {
    const patternSegment = ( rowIterator % 2 === 0 ) ? '#.' : '.#'; // Determine pattern for current row
    // Create a long string of the pattern and then slice it to the required width
    resultantMatrix[rowIterator] = new Array( gridWidth + 1 ).join( patternSegment ).substring( 0, gridWidth );
  }

  // Check for termination condition: if both dimensions are zero, stop processing
  if ( !gridHeight && !gridWidth ) {
    return false;
  } else {
    // Output the generated matrix to the console, joining rows with newlines
    console.log( resultantMatrix.join( "\n" ) + '\n' );
    return true; // Continue processing subsequent lines
  }
} );