/* This is an extensively modified Type I clone.
 * It retains all original identifiers, operators, and expressions.
 * Only whitespace and comments have been altered significantly.
 */
// The 'input' parameter will contain the entire input data.
function Main ( input )
{
  // The first line of input is input[0], the second is input[1], and so on.
  // This temporary variable will store the split input.
  tmp = input . split ( " " ) ;

  // When converting a string to a base-10 integer, use parseInt.
  var getResult = input => {
    // Parse the first number from the input array.
    var a = parseInt ( input [ 0 ] ) ;
    // Parse the second number from the input array.
    var b = parseInt ( input [ 1 ] ) ;

    // Initialize a counter for results.
    var count = 0 ;


    // This nested function checks if a number is a palindrome.
    var check = input =>
    {
      // Convert the number to a string for character-by-character comparison.
      var str = input . toString ( ) ;
      // Get the second half of the string (or slightly more for odd lengths).
      var str1 = str . slice ( Math . floor ( str . length / 2 ) ) ;
      // Get the first half of the string, reverse it, and join it back.
      // For odd length strings, the middle character is included in the first half for reversal,
      // which then correctly matches the second half's start.
      var str2 = str . slice ( 0 , Math . floor ( str . length / 2 ) + 1 ) . split ( "" ) . reverse ( ) . join ( "" ) ;

      // Compare the two halves to determine if it's a palindrome.
      if ( str1 == str2 )
        return true ; // It's a palindrome.
      else
      {
        return false ; // Not a palindrome.
      }
    } ;


    // Loop through the numbers from 'a' to 'b' (inclusive).
    for ( var i = a ; i <= b ; i ++ )
    {
      // If the current number is a palindrome, increment the counter.
      if ( check ( i ) )
        count ++ ;
    }

    // Output the final count to the console.
    console . log ( count ) ;

  } ; // End of getResult function definition.


  // Call the main logic function with the processed temporary input.
  getResult ( tmp ) ;

  // End of Main function output section.
}

/*
 * This section of the code should not be edited.
 * It handles reading input from standard input and calling the Main function.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;