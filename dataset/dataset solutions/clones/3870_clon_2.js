/* This script processes an incoming string */
function processInput ( dataString ) {
  // Extract characters from the input after cleaning whitespace
  const charFragments = dataString . trim ( ) . split ( '' ) ;
  let finalScore = 0 ; // Initialize a variable to accumulate points

  // Loop through the first three characters
  for ( let currentIdx = 0 ; currentIdx < 3 ; currentIdx ++ ) {
    // Check if the current character is 'o'
    if ( charFragments [ currentIdx ] === 'o' ) {
      finalScore += 100 ; // Add 100 points for each 'o'
    }
  }

  // Output the calculated result plus a base value
  console . log ( 700 + finalScore ) ;
}

// Read input from standard input and pass it to the processing function
processInput ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;