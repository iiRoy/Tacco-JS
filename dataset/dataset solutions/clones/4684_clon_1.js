/*
 * This file contains a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged from the original source.
 *
 * The only modifications are to whitespace (indentation, spacing, blank lines)
 * and comments (addition, removal, or modification of existing ones).
 * These changes are applied extensively throughout the file
 * to visually differentiate it from the original, while maintaining
 * identical logical and structural behavior.
 */

function Main ( input )
{
  // Convert the incoming string input into an integer for numerical operations.
  input = parseInt ( input ) ;

  // Initialize two integer variables to zero for subsequent calculations.
  var s  =  0 ;
  var s2 = 0 ;

  // Begin a 'for' loop. The loop continues as long as 's' is less than the parsed 'input'.
  // 'i' serves as the loop counter, starting from 0 and incrementing in each iteration.
  for ( var i = 0 ; s < input ; i ++ )
  {
    // Accumulate the current value of 'i' into 's'.
    s = s + i ;

    // Update 's2' with the current value of 'i'.
    // 's2' will ultimately hold the last 'i' value just before 's' exceeds 'input'.
    s2 = i ;

  } // End of the main calculation loop block.

  // Output the final computed value of 's2' to the console.
  console.log ( '%s' , s2 ) ;

} // End of the Main function definition.


// This auxiliary function is designed for local debugging purposes.
// It simulates input by fetching a value from an HTML element.
function debug ()
{
  // Retrieve the string value from an HTML input element with the ID "input".
  var input = document.getElementById ( "input" ) . value ;

  // Pass the retrieved string value to the primary 'Main' function for processing.
  Main ( input ) ;
} // End of the debug utility function.


// This is the entry point for execution in a typical competitive programming environment.
// It reads input from the standard input stream ('/dev/stdin') and passes it to 'Main'.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;