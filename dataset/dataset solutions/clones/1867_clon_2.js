function primaryProcessor
(
  incomingText
)
{
  // This function processes the incoming textual data.

  // Divide the complete text by newline characters into an array of lines.
  var linesArray = incomingText . split ( "\n" ) ;

  // Extract the very first line as our primary sequence.
  var firstString = linesArray[0] ;

  // Retrieve the second line, which will be used for comparison.
  var secondString = linesArray [ 1 ] ;

  // Determine the character length of the primary sequence.
  var charCount = firstString . length ;

  // Obtain a segment from the second string, starting from the beginning,
  // with a length equal to the primary sequence's character count.
  var comparisonSegment = secondString . substr ( 0 , charCount ) ;

  // Evaluate if the primary sequence is identical to the obtained segment.
  if ( firstString == comparisonSegment )
  {
    // If they match, output an affirmative response.
    console . log ( "Yes" ) ;
  }
  else
  {
    // Otherwise, indicate a negative outcome.
    console . log ( "No" ) ;
  } // End of conditional check.
} // End of primary processing function.


// Invoke the main processor by reading content from standard input.
primaryProcessor ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;