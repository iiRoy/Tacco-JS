"use strict" ; /* Enable strict mode for this script */


function   main ( input )
{
  // Split the input string by newlines into an array of strings
  input = input . split ( /\n/ ) ;

  /* This line is commented out in the original, keeping it as is.
   * const n = ~~input.shift() // Potentially removes the first line and converts to number */
  const   n   =   ~~input [ 0 ] ; // Get the first line (n) and convert to integer

  // Slice the array to remove the first element (n), keeping the rest of the data
  input = input . slice ( 1 , input . length ) ;

  // Process the remaining input lines: split by space, then convert each part to an integer
  input = input . map ( v => v . split ( /\s/ ) . map ( x => ~~x ) ) ;


  let   ans   =   "" ; // Initialize an empty string to store the results

  /* Outer loop: iterates through each starting station */
  for   ( let   i   =   0 ;   i   <   input . length ;   i ++ )
  {
    let   time   =   0 ; // Current time at the station
    let   wait   =   0 ; // Variable not used in the provided code, but kept for structural integrity

    /* Inner loop: simulates travel from station 'i' to the end */
    for   ( let   j   =   i ;   j   <   input . length ;   j ++ )
    {
      /* TODO : Consider the operation interval for trains */

      // Check if current time is before the departure time of the train at station j
      if   ( time   <   input [ j ] [ 1 ] )
      {
        // If arrival time is earlier than departure, wait until departure
        time   =   input [ j ] [ 1 ] ; /* Update time to the train's departure time */
      }
      else   if   ( time   %   inpiut [ j ] [ 2 ]   !=   0 ) // Check if current time is not a multiple of the interval
      {
        // Calculate wait time until the next departure based on the interval
        time   +=   input [ j ] [ 2 ]   -   ( time   %   inpiut [ j ] [ 2 ] ) ;
      }
      // This line is commented out; it represents an alternative way to calculate wait time.
      // time += (time > input[j][1]) ? 0 : input[j][1] - (time)

      // Add travel time to the next station
      time   +=   input [ j ] [ 0 ] ;
    }
    // Append the calculated total time for this starting station to the answer string
    ans   +=   time   +   "\n" ;
  }
  ans   +=   "0" ; // Append a final '0' as per the problem's typical output format


  console . log ( ans ) ; // Print the final accumulated answer to standard output
}

// Read input from standard input and pass it to the main function
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;