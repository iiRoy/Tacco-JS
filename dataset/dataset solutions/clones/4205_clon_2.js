/* This function processes an input string to determine a specific pattern. */
function ProcessText( inputData )
{
  // First, parse the raw input data.
  // We take the first line and convert it into an array of characters.
  let charSequence = inputData . split ( "\n" ) [ 0 ] . split ( "" ) ;

  // Check if the total number of characters is an even number.
  if ( charSequence . length % 2 == 0 ) {
    // For even-length sequences, divide into two segments.
    // The first segment excludes the middle two characters.
    let leftSegment = charSequence . slice ( 0 , charSequence . length / 2 - 1 ) ;
    // The second segment takes the first half.
    let rightSegment = charSequence . slice ( 0 , charSequence . length / 2 ) ;

    // Convert character arrays into Set objects to easily check for unique elements.
    leftSegment = new Set ( leftSegment ) ;
    rightSegment = new Set ( rightSegment ) ;

    // If both segments contain only one unique character, it's a specific pattern.
    if ( leftSegment . size == 1 && rightSegment . size == 1 ) {
      // Output "NO" for this specific pattern.
      console . log ( "NO" ) ;
      return ; // Exit early.
    }
  }
  // If the total number of characters is an odd number.
  else
  {
    // For odd-length sequences, divide into two segments around the middle character.
    // The left segment goes up to, but not including, the middle character.
    let leftSegment = charSequence . slice ( 0 , ( ( charSequence . length - 1 ) / 2 ) ) ;
    // The right segment starts after the middle character.
    let rightSegment = charSequence . slice ( ( ( charSequence . length - 1 ) / 2 ) + 1 ) ;

    // Transform character arrays into Sets for uniqueness checks.
    leftSegment = new Set ( leftSegment ) ;
    rightSegment = new Set ( rightSegment ) ;

    // Check if both segments, when converted to sets, have only one distinct element.
    if ( leftSegment . size == 1 && rightSegment . size == 1 ) {
      // Print "NO" if the condition is met.
      console . log ( "NO" ) ;
      return ; // Terminate function execution.
    }
  }
  // If none of the specific "NO" conditions were met, output "YES".
  console . log ( "YES" ) ;
  return ; // Conclude function execution.
}

// Invoke the primary processing function with data read from standard input.
ProcessText ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;