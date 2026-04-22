/*
 * This function, named Main, is designed to process
 * a given input string. It performs a specific calculation
 * to convert a numeric input into a base-26 string representation.
 */
function   Main ( input )

{

  // The input string is split into an array of lines.
  const   inputLines = input . split ( "\n" ) ;

  // The first line of the input is extracted.
  const   line0 = inputLines [ 0 ] ;

  // The first line is parsed as an integer, base 10.
  var   n = parseInt ( line0 , 10 ) ;

  // An empty string is initialized to store the calculation result.
  var   result = "" ;


  // This constant appears to be a large number, possibly for a placeholder
  // or a specific domain context, though it's not used in the current logic.
  const   dogs = 1000000000000001 ;


  // This string contains all lowercase English alphabets,
  // used for character mapping during the conversion.
  const   abcs = "abcdefghijklmnopqrstuvwxyz" ;


  // The core logic: a loop that continues as long as 'n' is greater than zero.
  while ( 0 < n )
  {
    // Calculate the remainder when 'n' is divided by 26.
    var   m = n % 26 ;

    // If the remainder is 0, it means the character should be 'z',
    // which corresponds to 26 in a 1-indexed system.
    if ( m === 0 )
    {
      m = 26 ;
    }

    // Append the corresponding character from 'abcs' to the beginning of 'result'.
    // 'm - 1' is used because 'abcs' is 0-indexed.
    result = abcs . substr ( m - 1 , 1 ) + result ;

    // Update 'n' for the next iteration: subtract 'm' and then divide by 26.
    n = ( n - m ) / 26 ;
  }

  // After the loop, the final converted string is printed to the console.
  console . log ( result ) ;

} /* End of Main function definition */


/*
 * The following line is typically used for competitive programming environments
 * to read input from standard input (e.g., /dev/stdin).
 * It has been commented out to allow for direct function call with a test string.
 */
// Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


// This line directly calls the Main function with a hardcoded string
// for testing purposes, simulating an input of "123456789".
Main ( "123456789" ) ;