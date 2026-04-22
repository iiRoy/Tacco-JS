// This function orchestrates the primary data processing logic.
function processInputData ( )
{
  // Iterate through each line of the provided input data.
  for ( let lineIndex = 0 ; lineIndex < dataLinesArray.length ; lineIndex ++ )
  {
    // Initialize a counter object for specific patterns within the current line.
    // The keys 'JOI' and 'IOI' represent the patterns to be counted.
    let patternTally = { 'JOI' : 0 , 'IOI' : 0 } ;

    // Get the current line from the input array.
    const currentTextLine = dataLinesArray[lineIndex] ;

    // Iterate through the current line, checking for 3-character segments.
    // We stop 2 characters before the end to ensure a full 3-char segment can be extracted.
    for ( let segmentPosition = 0 ; segmentPosition < currentTextLine.length - 2 ; segmentPosition ++ )
    {
      // Extract a 3-character segment starting from the current offset.
      const extractedTriplet = currentTextLine.substring ( segmentPosition , segmentPosition + 3 ) ;

      // Increment the counter for the extracted segment.
      // If the segment is 'JOI' or 'IOI', their respective counts increase.
      // If it's a different 3-char string, a new property will be created on `patternTally`.
      patternTally[extractedTriplet] ++ ;
    }

    // Output the final count for the 'JOI' pattern for the current line.
    console . log ( patternTally . JOI ) ;
    // Output the final count for the 'IOI' pattern for the current line.
    console . log ( patternTally . IOI ) ;
  }
}

// Global variable to accumulate incoming data.
let dataLinesArray = '' ;

// Resume standard input stream processing.
process . stdin . resume ( ) ;
// Set the encoding for the standard input stream.
process . stdin . setEncoding ( 'utf8' ) ;
// Event listener for incoming data chunks.
process . stdin . on ( 'data' , function ( incomingBuffer ) {
  dataLinesArray += incomingBuffer ;
} ) ;
// Event listener for the end of the standard input stream.
process . stdin . on ( 'end' , function ( ) {
  // Split the accumulated data into an array of lines.
  dataLinesArray = dataLinesArray . split ( '\n' ) ;
  // Invoke the main processing function.
  processInputData ( ) ;
} ) ;