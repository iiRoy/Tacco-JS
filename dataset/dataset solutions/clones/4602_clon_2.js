// This module handles processing of incoming text data.
const processInputData = (  sourceText  )  =>  {
  // First, normalize the input string by trimming whitespace and splitting into individual lines.
  const linesOfData = sourceText . trim ( ) . split ( '\n' ) ;

  // Parse the initial line to extract three key numeric values.
  const [ firstVal , secondVal , thirdVal ] = linesOfData [ 0 ] . split ( ' ' ) . map ( itemStr => Number ( itemStr ) ) ;

  // Iterate through multiples of the first value, checking a specific condition.
  for (  let currentMultiple = firstVal ; currentMultiple <= 10000 ; currentMultiple += firstVal  )  {
    // If the remainder of the current multiple divided by the second value equals the third value,
    // then the condition is met.
    if (  ( currentMultiple % secondVal ) === thirdVal  )  {
      console . log ( 'YES' ) ; // Indicate successful condition.
      return ; // Exit the function early upon finding a match.
    }
  }

  // If no multiple satisfies the condition after checking all possibilities, indicate failure.
  console . log ( 'NO' ) ;
} ;


// Invoke the primary data processing function using data read from the standard input stream.
processInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;