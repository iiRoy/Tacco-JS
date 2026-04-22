/* This script processes input lines to calculate a sum after a specific marker. */
function ProcessData ( rawData )
{
  // Split the entire raw input string into an array of individual lines.
  let linesArray = rawData.split ( '\n' ) ;

  let totalSum = 0 ; // Initialize accumulator for results
  let searchStarted = false ; // Control flag to track if the relevant section has begun

  // Iterate through the lines, starting from the second line (index 1) up to the line count indicated by the first line.
  for ( let lineIndex = 1 ; lineIndex < Number ( linesArray[0] ) + 1 ; lineIndex ++ )
  {
    if ( ! searchStarted )
    {
      // If the search hasn't started, check if the current line matches the last line (the marker).
      if ( linesArray [ lineIndex ] . match ( linesArray [ linesArray . length - 1 ] ) )
      {
        searchStarted = true ; // Set the flag to true as the marker is found.
        continue ;             // Skip the rest of the current iteration and move to the next line.
      }
    }

    // If the marker has been found (searchStarted is true), then process the line.
    if ( searchStarted )
    {
      // Extract the second part of the line (after a space) and add it to the total sum.
      totalSum += Number ( linesArray [ lineIndex ] . split ( ' ' ) [ 1 ] ) ;
    }
  }

  // Output the final calculated sum.
  console . log ( totalSum ) ;
}

// Read input from standard input and pass it to the processing function.
ProcessData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;