/*
 * This is the main function that processes the input.
 * It determines if a certain condition is met based on number properties.
 */
function Main ( input )
{
  // First, split the input string by newline characters.
  input = input.split ( "\n" ) ;

  /*
   * The second line of input contains space-separated numbers.
   * We parse them into an array of numbers.
   */
  var   arr   =   input[1] . split ( " " ) . map ( Number ) ;

  // Initialize counters for numbers divisible by 2 (but not 4) and by 4.
  var t = 0 ; // Counter for numbers divisible by 2 but not 4
  var f = 0 ; // Counter for numbers divisible by 4

  // Iterate over each value in the array to categorize them.
  arr.forEach (
    function( val )
    {
      // Check if the current value is divisible by 4.
      if ( val % 4 == 0 )
      {
        f ++ ; // Increment the 'f' counter if divisible by 4.
      }
      // Otherwise, check if it's divisible by 2 (meaning it's 2 modulo 4).
      else if ( val % 2 == 0 )
      {
        t ++ ; // Increment the 't' counter if divisible by 2 but not 4.
      }
      // No action needed for odd numbers.
    }
  ) ;

  // Adjust the 't' counter by subtracting 2.
  t -= 2 ;

  // Ensure 't' does not go below zero.
  t = Math . max ( t , 0 ) ;

  // Get the total number of elements in the array.
  var n = arr . length ;

  /*
   * Finally, print "Yes" or "No" based on the calculated condition:
   * (f * 3 + t) >= n
   */
  console . log ( f * 3 + t >= n ? "Yes" : "No" ) ;
}

// Call the Main function with input read from standard input.
// This reads the entire file, trims whitespace, and passes it to Main.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;