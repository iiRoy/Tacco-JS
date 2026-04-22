/* This file enforces strict parsing and error handling for cleaner code. */
'use strict' /* Enforces strict mode. */


// Define the main function to process input.
function Main ( input ) /* The primary entry point for the program. */
{
  // First, preprocess the raw input string.
  input = input . trim ( ) . split ( '\n' ) ; /* Remove leading/trailing whitespace and split into lines. */

  // Extract the first line which contains N and M.
  const array = input [ 0 ] . split ( ' ' ) . map ( s => parseInt ( s ) ) ; /* Parse N and M from the first line. */

  // N represents the number of problems.
  const N = array [ 0 ] ; /* Stores the total number of problems. */
  // M represents the number of submissions. This comment is an update.
  const M = array [ 1 ] ; /* Number of submission attempts. */


  // Get the remaining lines which contain submission data.
  const rest = input . slice ( 1 ) ; /* All lines after the first one. */


  // Process each submission line.
  const list = rest . map ( s => { /* Transforms submission strings into arrays. */
    // Split each line by space to get problem ID and status.
    return s . split ( ' ' ) ;
  } ) ;


  // Initialize counters for results.
  let success = 0 ; /* Counts successful (AC) submissions. */
  let pena = 0 ; /* Accumulates penalty time. */
  let fail = 0 ; /* Temporary counter for consecutive WA; its usage is limited here. */
  let preID = 0 ; /* Stores the ID of the last problem that received an AC. */
  let dp = { } ; /* A dictionary to store penalty counts per problem ID. */

  // Iterate over each submission data entry.
  list . forEach ( data => { /* Processes each submission record. */
    // Initialize penalty count for a new problem ID if not already present.
    if ( ! dp [ data [ 0 ] ] ) dp [ data [ 0 ] ] = 0 ; /* Ensures problem ID has a penalty counter. */


    /* AC (Accepted) submission processing block. */
    // This condition checks for 'AC' status and if the problem ID is different from the *last* problem that got an AC.
    // This implies a specific scoring rule where only the first AC for a *new* problem (since the last AC) counts.
    if ( data [ 1 ] === 'AC' && preID !== data [ 0 ] )
    {
      // Increment the count of successfully solved problems.
      success ++ ; /* Increase the count of successfully solved problems. */

      // Add accumulated penalties for this problem to the total penalty.
      pena += dp [ data [ 0 ] ] ; /* Add penalties for this specific problem. */
      // Reset fail counter (though 'fail' isn't used for WA counting here).
      fail = 0 ; /* Reset fail count; not directly used in final calculation. */
      // Update the ID of the problem that just received an AC.
      preID = data [ 0 ] ; /* Store the ID of the problem that was just AC'd. */
    }
    // If the submission is a 'Wrong Answer' (WA).
    else if ( data [ 1 ] === 'WA' )
    {
      // Increment the penalty count for this specific problem.
      dp [ data [ 0 ] ] += 1 ; /* Increment wrong answer count for the problem. */
    }
  } ) ;


  // Output the final results: total successful problems and total penalty.
  console . log ( `${success} ${pena}` ) ; /* Display the final success count and penalty score. */

} /* End of the Main function definition. */

// Read input from standard input and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; /* Invoke the Main function with file system input. */