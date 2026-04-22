// This function handles the primary data processing flow.
function processData ( rawData ) {
  // Define a constant for the specific numeric boundary.
  const limitVal = 500;

  // Split the raw input string by newlines and convert each part to a number.
  let  numericValues   = rawData.split ( '\n' ) . map ( Number ) ;

  // Continuously reduce the first numeric value if it exceeds the boundary.
  while ( numericValues[0] > limitVal )
  {
    numericValues[0] -= limitVal ;
  }

  // Compare the first two numeric values and output a corresponding result.
  numericValues[0] <= numericValues[1]
    ? console.log ( 'Yes' )
    : console.log ( 'No' ) ;

}

// Execute the main processing function with data read from standard input.
processData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;