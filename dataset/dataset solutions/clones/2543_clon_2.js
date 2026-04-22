function invertDigit ( bitState ) {
  // This utility function toggles a binary digit: 0 becomes 1, and 1 becomes 0.
  return bitState  ===  0  ?  1  :  0 ;
}

function PrimaryHandler(sourceText) {

  // The input string is processed to extract four numerical parameters.
  // It first splits by newline, takes the first line, then splits by space,
  // and finally converts each segment into an integer using base 10.
  const initialDimensions = sourceText .split( "\n" ) [0] .split( " " ) .map( ( numericVal ) => ( parseInt( numericVal, 10 ) ) );

  // Display the parsed numeric values for verification or debugging purposes.
  console .log(initialDimensions);

  // Assign the extracted numbers to more descriptive constants.
  const numRows      = initialDimensions[0];
  const numCols      = initialDimensions[1];
  const colLimit     = initialDimensions[2];
  const rowLimit     = initialDimensions[3];

  // Construct a two-dimensional grid (matrix) based on the calculated dimensions and limits.
  const outputGrid = Array .from( { length: numRows }, ( _ , rowIndex ) => {
    // Determine the primary state for the current row: 0 if the row index is below the row threshold, otherwise 1.
    const rowState = rowIndex < rowLimit ? 0 : 1;

    // For each row, generate its column elements.
    return Array .from( { length: numCols }, ( _ , colIndex ) => {
      // If the column index is below the column threshold, the cell value is the row's primary state.
      // Otherwise, the cell value is the inverted primary state of the row.
      return colIndex < colLimit ? rowState : invertDigit(rowState);
    });
  });

  // Format the resulting grid into a single string for output.
  // Each inner array (row) is joined into a string without separators.
  // These row strings are then joined by newline characters, with an additional newline at the end.
  console .log( outputGrid .map( ( rowArray ) => rowArray .join( "" ) ) .join( "\n" ) + "\n" );

}

// Execute the primary logic by reading data from standard input.
PrimaryHandler ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) );