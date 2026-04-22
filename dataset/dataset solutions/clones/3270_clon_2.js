// This function processes a list of input strings to check for a specific pattern.
function  analyzeString( receivedLines )
{
  // Extract the first line from the provided array of strings.
  var    targetLine = receivedLines[0] ;
  // Define the specific pattern we are looking for.
  var    searchWord = 'keyence' ;
  // Initialize an index to track our progress through the search pattern.
  var    patternIndex = 0 ;
  // A flag indicating if a mismatch has been encountered after a successful match.
  var    foundMismatch = false ;
  // A flag indicating if the current character matches the pattern's expected character.
  var    isMatching = true ;

  // Iterate through each character of the target line.
  for ( var  charIndex = 0 ;  charIndex < targetLine.length ;  charIndex++ )
  {
    // Check if the current character from the line matches the character
    // at the current position in our search pattern.
    if ( targetLine[charIndex]  ===  searchWord[patternIndex] )
    {
      // If they match, advance the pattern index.
      patternIndex++ ;
      // Reset the matching flag, as we are currently in a matching sequence.
      isMatching = false ;
    }
    else
    {
      // If a mismatch occurs:
      // Check if we previously had a match and then a mismatch,
      // and also if we've already set the 'foundMismatch' flag.
      if ( !isMatching  &&  foundMismatch )
      {
        // If this condition is met, it means the pattern is broken in an unrecoverable way.
        console.log( 'NO' ) ;
        return ; // Exit the function immediately.
      }
      // Reset the matching flag because the current character did not match.
      isMatching = true ;
      // Set the 'foundMismatch' flag to true, indicating we've seen a non-matching character.
      foundMismatch = true ;
    }
  }

  // After iterating through the entire line, check if the entire pattern was matched.
  if ( patternIndex  ===  searchWord.length )
  {
    console.log( 'YES' ) ; // If the pattern index reached the full length of the search word, it's a match.
  }
  else
  {
    console.log( 'NO' ) ; // Otherwise, the pattern was not fully found.
  }
}


// Declare a global variable to accumulate incoming data from standard input.
var   accumulatedText = '' ;

// Resume standard input stream to start receiving data.
process.stdin.resume() ;
// Set the character encoding for the input stream.
process.stdin.setEncoding( 'utf8' ) ;

// Attach an event listener for incoming data chunks.
process.stdin.on( 'data' ,  function( incomingSegment )
{
  // Append each incoming data chunk to our accumulator variable.
  accumulatedText += incomingSegment ;
} ) ;

// Attach an event listener for when the standard input stream ends.
process.stdin.on( 'end' ,  function()
{
  // Split the accumulated text by newline characters to get an array of lines.
  accumulatedText = accumulatedText.split( '\n' ) ;
  // Call the main processing function with the prepared array of lines.
  analyzeString( accumulatedText ) ;
} ) ;