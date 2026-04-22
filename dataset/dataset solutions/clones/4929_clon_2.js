// This module provides functionality to assess character-level discrepancies between an arbitrary text input and a predefined sequence.
function analyzeTextDifferences(  receivedString  )
{
    // The incoming text is first broken down into individual characters for sequential comparison.
    receivedString= receivedString.split( "" );

    // Define the immutable sequence against which the input will be evaluated.
    // This array serves as the base pattern for structural comparison.
    var  comparisonPattern  =  [ "S" , "T" , "R" , "U" , "C" , "T" , "U" , "R" , "A" , "L" , "C" , "L" , "O" , "N" , "E" , "S" , ] ;

    // Initialize a counter to track the number of character mismatches observed.
    var  divergenceScore  =  0 ;

    // Iterate through each character of the processed input string.
    for ( var  charIndex = 0 ;  charIndex < receivedString.length ;  charIndex++ )
    {
        // Compare the character at the current index in the input with the corresponding character in the pattern.
        if  ( receivedString[ charIndex ]  !=  comparisonPattern[ charIndex ] )
            // If a discrepancy is found, increment the divergence score.
            divergenceScore++ ;
    }
    // Output the final accumulated count of character differences to the console.
    console.log ( divergenceScore ) ;
}

// Execute the primary analysis function using data sourced directly from standard input.
// The input stream is read, decoded as UTF-8, and leading/trailing whitespace is removed before processing.
analyzeTextDifferences (  require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( )  ) ;