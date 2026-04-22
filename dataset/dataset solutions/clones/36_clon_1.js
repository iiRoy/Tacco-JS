/*
 * This JavaScript code reads input from standard input,
 * processes each line as a number, and then calculates
 * how many combinations of four single-digit numbers
 * (0-8) sum up to the given number.
 *
 * It's a demonstration of nested loops and basic input/output.
 */
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;
var lines = input . split ( '\n' ) ;


// Declare the 'line' variable outside the loop scope.
var line ;

// Loop through each line read from the input.
// The loop continues as long as lines.shift() returns a non-null/undefined value.
while ( line = lines . shift ( ) )
{
  // Initialize a counter for valid combinations.
  var cnt = 0 ;

  // Convert the current line string to a number.
  // The unary plus operator is a concise way to do this.
  var num = + line ;

  // Output the original line string.
  console . log ( line ) ;

  // Output the numeric value derived from the line.
  console . log ( num ) ;

  // Start of the first nested loop (for i1).
  for ( var i1 = 0 ; i1 < 9 ; i1 ++ )
  {
    // Start of the second nested loop (for i2).
    for ( var i2 = 0 ; i2 < 9 ; i2 ++ )
    {
      // Start of the third nested loop (for i3).
      for ( var i3 = 0 ; i3 < 9 ; i3 ++ )
      {
        // Start of the fourth and innermost nested loop (for i4).
        for ( var i4 = 0 ; i4 < 9 ; i4 ++ )
        {
          // Check if the sum of the four loop variables equals the target number.
          if ( i1 + i2 + i3 + i4 == num )
          {
              // If the condition is true, increment the counter.
              cnt ++ ;
          }
        } // End of the i4 loop.
      } // End of the i3 loop.
    } // End of the i2 loop.
  } // End of the i1 loop.

  // After all combinations have been checked for the current 'num',
  // print the total count of valid combinations.
  console . log ( cnt ) ;

} // End of the main while loop.

/*
 * End of the program.
 * All input lines have been processed.
 */