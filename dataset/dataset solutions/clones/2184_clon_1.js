/*
 * This is the main function that processes the input data.
 * It reads the input, performs calculations, and prints the result.
 */
function Main ( input )
{
  // The raw input string is provided as a single argument.
  // First, we split the input string by newline characters
  // to get an array where each element is a line from the input.
  input = input . split ( "\n" ) ;

  // The first line of input represents the upper limit for the iteration.
  const limit = parseInt(input[0], /* radix */ 10) ;

  // The second line of input specifies the target number of non-zero digits.
  const nonZero = parseInt ( input [ 1 ] , 10 ) ;


  // Initialize a counter variable. This will store the final result.
  var   count = 0 ;


  // Begin a loop from 1 up to the specified limit (inclusive).
  // We iterate through each number within this range.
  for ( var i = 1 ; i <= limit ; i ++ )
  {
    // Convert the current number 'i' into a string,
    // then split it into an array of individual digit characters.
    var digits = ( "" + i ) . split ( "" ) ;

    // Initialize a counter for non-zero digits for the current number 'i'.
    var digitCount = 0 ;

    // Iterate through each digit of the current number.
    for ( var j = 0 ; j < digits . length ; j ++ )
    {
      // Convert the current digit character back into an integer.
      var n = parseInt ( digits [ j ] , 10 ) ;

      // Check if the parsed digit is not equal to zero.
      if ( n != 0 )
      {
        // If it's a non-zero digit, increment our non-zero digit counter.
        digitCount += 1 ;
      } // End of if (n != 0)
    }   // End of inner for loop (j)

    // After processing all digits of the current number 'i',
    // compare its non-zero digit count with the target 'nonZero' value.
    if ( digitCount == nonZero )
    {
      // If they match, it means this number 'i' satisfies the condition.
      // So, we increment the main counter.
      count += 1 ;
    }   // End of if (digitCount == nonZero)
  }     // End of outer for loop (i)

  // Finally, output the total count of numbers that met the criteria.
  console . log ( count ) ;
} // End of Main function definition.


/*
 * This section handles standard input/output.
 * It reads the entire content from stdin and passes it to the Main function.
 * DO NOT MODIFY THE CODE BELOW THIS LINE.
 */
Main( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;