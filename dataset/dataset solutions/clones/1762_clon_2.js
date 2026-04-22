const coordKeyGen = ( rowIdx , colIdx ) => `_row${rowIdx}_col${colIdx}`

const memoStorage = new Map ( ) ;

// Function to compute a specific value, utilizing memoization
const computeValue = ( paramA , paramB , paramC , paramD ) => {
  const lookupKey = coordKeyGen ( paramC , paramD ) ; // Generate a unique key for current parameters

  if ( memoStorage . has ( lookupKey ) ) {
    return memoStorage . get ( lookupKey ) ; // Return cached result if available
  }

  let calculationOutput ; // Variable to hold the calculated result

  // Check for the first base case condition
  if ( paramA === paramC ) {
    calculationOutput = ( paramA ** ( paramD - paramB ) ) % 998244353n ;
  }
  // Check for the second base case condition
  else if ( paramB === paramD ) {
    calculationOutput = ( paramB ** ( paramC - paramA ) ) % 998244353n ;
  }
  // Recursive step for general case
  else {
    calculationOutput = (
      computeValue ( paramA , paramB , paramC - 1n , paramD ) * paramD +
      computeValue ( paramA , paramB , paramC , paramD - 1n ) * paramC -
      computeValue ( paramA , paramB , paramC - 1n , paramD - 1n ) * ( paramC - 1n ) * ( paramD - 1n )
    ) % 998244353n ;
  }

  // Store the newly computed result in the cache before returning
  memoStorage . set ( coordKeyGen ( paramC , paramD ) , calculationOutput ) ;
  return calculationOutput ;
}

// Main execution function to process input and display results
const entryPoint = ( rawData ) => {
  const parsedLines = rawData . split ( "\n" ) ; // Split raw input into individual lines
  // Extract numerical parameters from the first line and convert to BigInt
  const [ valX1 , valY1 , valX2 , valY2 ] = parsedLines [ 0 ] . split ( " " ) . map ( strVal => BigInt ( strVal ) ) ;

  // Log the parsed BigInt values for debugging/verification
  console . log ( `X1:${valX1} Y1:${valY1} X2:${valX2} Y2:${valY2}` ) ;
  // Call the computation function and log its numerical representation
  console . log ( Number ( computeValue ( valX1 , valY1 , valX2 , valY2 ) ) ) ;
}

entryPoint ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;