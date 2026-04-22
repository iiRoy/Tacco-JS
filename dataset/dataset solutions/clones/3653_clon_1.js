/*
 * This JavaScript program defines a function 'main'
 * which processes input to determine if one string
 * can be rotated to match another string.
 *
 * It adheres to a specific problem-solving pattern
 * involving string manipulation and comparison.
 *
 * Author: Automated Code Clone Generator
 * Version: 1.0
 * Date: October 27, 2023
 */

function main ( input )
{

  // The 'input' parameter is expected to be a multi-line string.
  // We split it by newline characters to get an array of individual lines.
  var array = input . split ( '\n' ) ;

  // The first line of the input represents the first string.
  // We convert it into an array of characters for easier manipulation.
  var string1 = array [ 0 ] . split ( '' ) ;

  // Similarly, the second line is converted into a character array.
  var string2 = array [ 1 ] . split ( '' ) ;

  // A flag variable is initialized to 0.
  // It will be set to 1 if string1 can be transformed into string2.
  var flag = 0 ;


  // First, check if the two strings are already identical.
  // We use toString() on the character arrays to compare their content directly.
  if ( string1 . toString ( ) == string2 . toString ( ) )
  {
    flag = 1 ; // If they are the same, set the flag to 1.
  }
  else
  {
    // If not initially identical, proceed to rotate string1.
    // We iterate 'string1.length - 1' times because after 'length' rotations,
    // the string returns to its original state, and one less rotation is sufficient.
    for ( var i = 0 ; i < string1 . length - 1 ; i++ )
    {
      // Store the last character of string1.
      var last = string1 [ string1 . length - 1 ] ;

      // Remove the last character from string1.
      string1 . pop ( ) ;

      // Add the previously stored 'last' character to the beginning of string1.
      // This effectively performs a right rotation.
      string1 . unshift ( last ) ;

      // After each rotation, compare the modified string1 with string2.
      if ( string1 . toString ( ) == string2 . toString ( ) )
      {
        flag = 1 ; // If a match is found, set the flag.
        break ;    // No need to perform further rotations, so exit the loop.
      }
    }
  }


  // Based on the final value of the 'flag', print the appropriate message.
  if ( flag == 1 )
  {
    console . log ( 'Yes' ) ; // If flag is 1, a match was found.
  }
  else
  {
    console . log ( 'No' ) ;  // If flag is 0, no match was found after all rotations.
  }

} // End of the main function definition.


// This part reads the input from standard input (/dev/stdin)
// using Node.js 'fs' module and then calls the 'main' function
// with the read content. The input is expected to be UTF-8 encoded.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin', 'utf8' ) ) ;