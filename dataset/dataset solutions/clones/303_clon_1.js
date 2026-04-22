/*
 * This script processes year ranges provided via standard input.
 * For each range, it identifies and prints all leap years.
 * If a range contains no leap years, it prints "NA".
 * An empty line separates the output of different ranges.
 * The input terminates when a starting year of 0 is encountered.
 */


x = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim () . split ( /\s/ ) ;


// The main loop iterates through the input array 'x', taking two elements at a time
// to define a start and end year for a range.
for ( i = 0 ; i < x . length ; i += 2 )
{

  count = 0 ; // Initialize a counter to track the number of leap years found in the current range.

  y = x [ i ] ; // 'y' is initialized with the starting year of the current range.

  // Check for the termination condition: if the starting year is 0, exit the program.
  if ( y == 0 )
  {
    break ; // Terminate the loop.
  }

  // This inner loop iterates through every year from the start year 'y'
  // up to and including the end year (x[i+1]) of the current range.
  for ( ; y <= x [ i + 1 ] ; y ++ )
  {

    // Apply the leap year rule:
    // A year is a leap year if it is divisible by 400,
    // OR if it is divisible by 4 AND NOT divisible by 100.
    if ( ( y % 400 == 0 ) || ( ( y % 4 == 0 ) && ( y % 100 != 0 ) ) )
    {
      console . log ( y ) ; // If 'y' is a leap year, print it to standard output.

      count ++ ; // Increment the leap year counter for this range.
    }
  }

  // After processing all years in the range, check if any leap years were found.
  if ( count == 0 )
  {
    console . log ( "NA" ) ; // If 'count' is 0, no leap years were found, so print "NA".
  }

  console . log ( ) ; // Print an empty line to visually separate the output of different ranges.

} // End of the main processing loop.