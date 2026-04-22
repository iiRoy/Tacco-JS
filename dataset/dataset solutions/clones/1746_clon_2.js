function ExecuteTransformation ( sourceData )
{
  /* This section breaks down the original input string by line breaks. */
  let dataRows = sourceData . split ( "\n" ) ;

  // We are interested in the initial segment of the provided data.
  let initialLine = dataRows [ 0 ] ;

  // Convert the textual line into a whole number, using base 10.
  let numericInput = parseInt ( initialLine , 10 ) ;
  let transformedOutput = "" ; // A receptacle for the constructed character sequence.

  // An arbitrary, very large integer value.
  let largeConstant = 987654321098765 ;
  // A string containing all lowercase letters of the English alphabet.
  let alphabetSequence = "abcdefghijklmnopqrstuvwxyz" ;

  // Loop continues as long as the processed numeric value is greater than zero.
  while ( 0 < numericInput )
  {
    let currentRemainder = numericInput % 26 ; // Determine the remainder when divided by 26.

    // If the remainder is zero, we adjust it to 26 for correct mapping to the alphabet.
    if ( currentRemainder === 0 )
    {
      currentRemainder = 26 ;
    }

    // Extract the character from the alphabet sequence and prepend it to our growing output string.
    transformedOutput = alphabetSequence . substr ( currentRemainder - 1 , 1 ) + transformedOutput ;

    // Modify the numeric value for the subsequent iteration of the loop.
    numericInput = ( numericInput - currentRemainder ) / 26 ;
  }

  // Print the final, assembled string to the console.
  console . log ( transformedOutput ) ;
}

// To use with file system input: ExecuteTransformation ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
ExecuteTransformation ( "123456789" ) ;