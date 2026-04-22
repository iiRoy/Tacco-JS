// This module defines a primary function to process a text-based input.
function Processor( inputStr ) {
  // Initially, the input is a single string; we parse it into an array of lines.
  inputStr = inputStr.split( '\n' );

  // The very first line of the input is interpreted as a numeric value,
  // indicating the total number of entries or dimensions.
  let countVal = +inputStr[0];

  // An array is prepared to hold the processed textual components.
  var dataMatrix = [];

  // A loop to populate the data structure. Each input line (after the first)
  // is duplicated and stored at two distinct positions within the array.
  for ( var idxA = 0; idxA < countVal; idxA++ ) {
    // The concatenation operation effectively doubles the string content.
    dataMatrix[ idxA + countVal ] = dataMatrix[ idxA ] = inputStr[ idxA + 1 ] + inputStr[ idxA + 1 ];
  }

  // A variable is set up to accumulate the aggregate outcome of subsequent calculations.
  let finalResult = 0;

  // These nested loops iterate through all possible combinations of row and column displacements.
  for ( idxA = 0; idxA < countVal; idxA++ )
    for ( let colIdx = 0; colIdx < countVal; colIdx++ ) {
      // For each displacement pair, a sub-routine is invoked, and its returned value
      // is added to the running total.
      finalResult += checkSymmetry( idxA, colIdx );
    }

  // The computed final result is then displayed to the standard output.
  console.log( finalResult );

  // This internal helper function assesses a specific symmetry property
  // within the `dataMatrix` based on the provided coordinate offsets.
  function checkSymmetry( offsetX, offsetY ) {

    // These inner loops traverse through pairs of indices in a triangular fashion,
    // ensuring each pair is checked exactly once for a given offset.
    for ( let innerRow = 0; innerRow < countVal; innerRow++ )
      for ( let innerCol = innerRow + 1; innerCol < countVal; innerCol++ ) {
        // A condition checks if the element at a transformed coordinate
        // is not identical to its symmetrically opposite counterpart.
        if ( dataMatrix[ innerRow + offsetX ][ innerCol + offsetY ] !== dataMatrix[ innerCol + offsetY ][ innerRow + offsetX ] )
          // If any asymmetry is detected, the function immediately signals failure.
          return 0;
      }
    // Should all checks pass without finding asymmetry, the function indicates success.
    return 1;
  }
}

// The main processing logic is initiated by reading content from standard input,
// interpreted as a UTF-8 encoded string.
Processor( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );