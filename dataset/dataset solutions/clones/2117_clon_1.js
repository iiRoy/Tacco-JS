/*
 * This is the primary function responsible for processing the incoming input data.
 * It's structured to handle a specific format of text input.
 */
function Main( input )
{
  // The complete input string is initially split into an array of individual lines.
  input = input . split ( "\n" ) ;

  // The very first line is extracted from the input array and temporarily stored.
  tmp = input . shift ( ) ;

  // The first segment of the temporary line (before the first space) is parsed as an integer for N.
  N = parseInt ( tmp . split ( " " ) [ 0 ] ) ;

  // The second segment of the temporary line is assigned to the variable M.
  M = tmp . split ( " " ) [ 1 ] ;

  // The remaining lines of the input array are assigned to S.
  S = input ;

  /*
   * An array 'A' is meticulously initialized. It's constructed by repeating
   * the character 'n' N times, and then splitting this string into an array of characters.
   */
  A = "n" . repeat ( N ) . split ( "" ) ;


  // A boolean flag is set to true at the beginning, serving as an integrity check during operations.
  flag = true ;


  // Each element 'v' within the 'S' array is iterated over.
  S . forEach ( v =>
  {
    // Each string 'v' is split by spaces, and its constituent parts are mapped to integers.
    t = v . split ( " " ) . map ( v => parseInt ( v ) ) ;

    // A critical conditional check:
    // If the character at the (t[0]-1) index of 'A' is neither 'n' NOR equal to t[1],
    // then an inconsistency is detected, and the 'flag' is immediately set to false.
    if ( ( A [ t [ 0 ] - 1 ] != "n" ) && ( A [ t [ 0 ] - 1 ] != t [ 1 ] ) )
    {
      flag = false ;
    }

    // The character at the (t[0]-1) index of 'A' is updated with the value of t[1].
    A [ t [ 0 ] - 1 ] = t [ 1 ] ;
  } ) ;


  // The array 'A' is now re-joined to form a single continuous string.
  A = A . join ( "" ) ;


  // A sequence of string replacements is applied to 'A' using regular expressions.
  // The first replacement targets the pattern "nnn" at the string's start, converting it to "100".
  A = A . replace ( /^nnn/ , "100" ) ;

  // The second replacement targets "nn" followed by a digit at the start, transforming it to "10" plus the digit.
  A = A . replace ( /^nn([0-9])/ , "10$1" ) ;

  // The third replacement targets "n" followed by a digit at the start, changing it to "1" plus the digit.
  A = A . replace ( /^n([0-9])/ , "1$1" ) ;

  // The final replacement globally converts all remaining instances of 'n' into '0'.
  A = A . replace ( /n/g , "0" ) ;


  // The modified string 'A' is then parsed into an integer.
  A = parseInt ( A ) ;


  // The final output is determined by evaluating the 'flag' and the string length of 'A'.
  if ( ( flag ) && ( ( A + "" ) . length == N ) )
  {
    // If both conditions hold true, the computed integer 'A' is printed to the console.
    console . log ( A ) ;
  }
  else
  {
    // Otherwise, indicating an invalid or uncomputable scenario, -1 is printed.
    console . log ( -1 ) ;
  }
} // End of the Main function definition.


// This comment indicates that the following block of code is for standard I/O handling
// and should not be altered, as per the original requirements.
// It diligently reads the entire content from '/dev/stdin', interprets it as UTF-8,
// and subsequently invokes the 'Main' function with this processed input.
Main
(
    require ( "fs" )
        . readFileSync ( "/dev/stdin" , "utf8" )
) ;