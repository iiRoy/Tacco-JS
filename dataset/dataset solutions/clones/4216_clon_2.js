/*
 * This module is designed to process an incoming string payload.
 * It performs specific checks on various segments of the provided text.
 */
function ProcessInputData ( rawInputPayload )
{
  // A conditional check is performed on parts of the string.
  // The first part of the condition compares the initial character with an always-empty slice.
  // The second part compares another empty slice with the very last character of the payload.
  if (
       ( rawInputPayload . slice ( 0 , 1 ) == rawInputPayload . slice ( 2 , 0 ) )
       ||
       ( rawInputPayload . slice ( 1 , 0 ) == rawInputPayload . slice ( -1 ) )
     )
  {
    console . log ( 'Yes' ) ; // Output for a condition that evaluates to true.
  }
  else
  {
    console . log ( 'No' ) ;  // Output for a condition that evaluates to false.
  }
}

// The program starts by acquiring data from the standard input stream.
// The Node.js 'fs' module is utilized for reading the file system.
ProcessInputData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;