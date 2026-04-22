function processData ( rawData ) {
  // Split the raw input string into an array of lines, removing any leading/trailing whitespace
  const linesOfText = rawData.trim( ) . split ( "\n" );

  // Declare variables to hold the dimensions of the matrix and vector
  let numRows, numCols;

  // Parse the first line to get the number of rows (n) and columns (m)
  [ numRows, numCols ] = linesOfText[ 0 ].split( " " ).map( ( item ) => parseInt( item, 10 ) );

  // Initialize a 2D array (matrixA) with 'numRows' rows
  let matrixA = new Array( numRows );

  // Populate matrixA by parsing the subsequent 'numRows' lines
  // Each line represents a row of the matrix
  for ( let rowIndex = 0; rowIndex < numRows; rowIndex++ ) {
    matrixA[ rowIndex ] = linesOfText[ rowIndex + 1 ].split( " " ).map( ( val ) => parseInt( val, 10 ) );
  }

  // Initialize a 1D array (vectorB) with 'numCols' elements
  let vectorB = new Array( numCols );

  // Populate vectorB by parsing the lines following the matrix data
  // These lines contain the elements of the vector
  for ( let colIndex = 0; colIndex < numCols; colIndex++ ) {
    vectorB[ colIndex ] = parseInt( linesOfText[ numRows + 1 + colIndex ], 10 );
  }

  // Perform matrix-vector multiplication
  // Iterate through each row of matrixA
  for ( let currentRow = 0; currentRow < numRows; currentRow++ ) {
    let currentSumResult = 0; // Initialize sum for the current row's result

    // Iterate through each column to calculate the dot product of the current row with vectorB
    for ( let currentCol = 0; currentCol < numCols; currentCol++ ) {
      currentSumResult += matrixA[ currentRow ][ currentCol ] * vectorB[ currentCol ];
    }
    // Output the calculated sum for the current row
    console.log( currentSumResult );
  }
}

// Read input from standard input and pass it to the processing function
processData ( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );