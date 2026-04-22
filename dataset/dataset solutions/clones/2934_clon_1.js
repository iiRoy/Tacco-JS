// This file processes input to find the intersection of multiple intervals.
"use strict";

// The main function that encapsulates the core logic of the program.
function main ( input )
{

  // Split the entire input string by newline characters to get an array of lines.
  const args = input . split ( "\n" ) ;

  // The first line of input (index 0) contains N and M, space-separated.
  const one = args [ 0 ] . split ( " " ) ;

  // The second line of input (index 1) contains the initial min and max values, also space-separated.
  const second = args [ 1 ] . split ( " " ) ;


  // Parse N from the first part of the first line. (N is not explicitly used in the logic, but parsed).
  const N = parseInt ( one [ 0 ] ) ;
  // Parse M from the second part of the first line. M determines how many intervals to process.
  const M = parseInt ( one [ 1 ] ) ;


  // Declare temporary variables to hold parsed values for each interval during iteration.
  let temp ;    // A temporary array to store the split parts of the current line.
  let front ;   // Represents the starting point of the current interval being processed.
  let end ;     // Represents the ending point of the current interval being processed.

  // Initialize the overall minimum (min) and maximum (max) values
  // using the first interval provided on the second line of input.
  let min = parseInt ( second [ 0 ] ) ;
  let max = parseInt ( second [ 1 ] ) ;


  // Begin a loop starting from the third line (index 2) up to M.
  // Each iteration processes one interval to update the overall intersection.
  for ( let i = 2 ; i <= M ; i ++ )
  {
    // Split the current line (args[i]) by spaces to get the interval's front and end.
    temp = args [ i ] . split ( " " ) ;

    // Parse the first part of the current line as the 'front' (start) of the interval.
    front = parseInt ( temp [ 0 ] ) ;
    // Parse the second part of the current line as the 'end' of the interval.
    end = parseInt ( temp [ 1 ] ) ;


    // Check for conditions where there is no overlap between the current interval
    // and the accumulated intersection (represented by 'min' and 'max').
    // If the current 'max' is less than the current interval's 'front', or
    // if the current interval's 'end' is less than the current 'min',
    // it means the intervals do not intersect.
    if ( max < front || end < min )
    {
      // If no intersection, set 'min' to 0 and 'max' to -1.
      // This state indicates an empty intersection.
      min = 0 ;
      max = -1 ;
      // Since no further intersection is possible, break out of the loop.
      break ;
    }

    // If there is an overlap, update 'min' and 'max' to reflect the new intersection.
    // If the current 'min' is smaller than the current interval's 'front',
    // update 'min' to 'front' because the intersection must start at or after 'front'.
    if ( min < front )
    {
      min = front ;
    }

    // If the current interval's 'end' is smaller than the current 'max',
    // update 'max' to 'end' because the intersection must end at or before 'end'.
    if ( end < max )
    {
      max = end ;
    }
  } // End of the for loop iterating through intervals.

  // After processing all intervals, calculate the length of the final intersection.
  // If 'max' is -1 (indicating an empty intersection), the result will be 0,
  // which is correct for an empty set. Otherwise, it's (max - min + 1).
  console . log ( max - min + 1 ) ;

} // End of the main function.


// This line reads input from standard input using Node.js's 'fs' module
// and passes the content as a UTF-8 string to the 'main' function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;