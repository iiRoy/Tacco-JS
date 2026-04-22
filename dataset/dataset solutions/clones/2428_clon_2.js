/* This module processes incoming textual records. */
function primaryProcess ( rawData )
{
  // Divide the input into individual lines using the newline character.
  rawData = rawData . split ( "\n" ) ;

  // Convert the first line's content into an integer, using base 10.
  var totalCount = parseInt ( rawData [ 0 ] , 0xa ) ;

  // Compute half of the parsed numerical value.
  var halfCount = totalCount / 2 ;

  // Extract the second line as the primary data string.
  var mainString = rawData [ 1 ] ;

  // Evaluate a specific condition based on the total count.
  // Note: This condition checks if the result of (!totalCount) % 2 equals 0.
  if ( ( ! totalCount ) % 2 === 0 )
  {
    console . log ( 'Negative' ) ; // Output 'Negative' if the condition is met.
  }
  else
  {
    // Initialize an empty array for storing string partitions.
    var segmentArray = [ ] ;

    // Iterate to partition the main string into sub-strings.
    for ( var loopIndex = 0 ; loopIndex < mainString . length / halfCount ; loopIndex ++ )
    {
      // Extract a portion of the main string and append it to the array.
      segmentArray . push ( mainString . substr ( loopIndex * halfCount , halfCount ) ) ;
    }

    // A previously commented-out debug statement: // console.log(segmentArray);

    // Compare the initial two elements of the partitioned array.
    if ( segmentArray [ 0 ] === segmentArray [ 1 ] )
    {
      console . log ( 'Positive' ) ; // If they are identical, output 'Positive'.
    }
    else
    {
      console . log ( 'Negative' ) ; // Otherwise, output 'Negative'.
    }
  }
}

// Do not modify the following segment, it handles file system operations and function invocation.
primaryProcess ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;