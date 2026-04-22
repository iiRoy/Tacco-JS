// This is a Type I clone of the original JavaScript code.
// The primary goal is to alter whitespace and add comments extensively
// while preserving the exact logical structure and all identifiers.

function Main( input )
{

  // The input string is typically multiline.
  // We split it into an array of strings, one for each line.
  input = input.split( "\n" );

  /*
   * A common scenario for competitive programming inputs:
   * if the input ends with a newline character, the last element
   * of the split array will be an empty string.
   * This conditional block handles such cases by removing that empty element.
   */
  if ( input[ input.length - 1 ] === '' )
  {
    input.pop(); // Remove the trailing empty line if present.
  }

  // The first line of the input is assigned to the constant N.
  const N = input[ 0 ];

  // Initialize two critical variables, 'up' and 'down', with their starting values.
  // These likely represent states in a dynamic programming approach.
  var up = 1;
  var down = 0;

  // Declare temporary variables 'nup' and 'ndown'.
  // They will hold the newly calculated values for 'up' and 'down' within the loop.
  var nup, ndown;

  // Begin a loop that iterates through each character of the string N.
  // The loop variable 'i' serves as the index.
  for ( var i = 0; i < N.length; i++ )
  {

    // Calculate the new value for 'up' using Math.min.
    // This involves arithmetic operations on the current character N[i],
    // and the current 'up' and 'down' states.
    // Note: N[i] - 0 is a common trick to convert a character digit to a number.
    nup = Math.min( 9 - N[ i ] + up, 1 + down + ( N[ i ] - 0 ) );

    // Calculate the new value for 'down', similarly using Math.min.
    // The specific arithmetic expressions define the state transitions.
    ndown = Math.min( 10 - N[ i ] + up, down + ( N[ i ] - 0 ) );

    // Update the 'up' variable with its newly computed 'nup' value.
    up = nup;

    // Update the 'down' variable with its newly computed 'ndown' value.
    down = ndown;

  } // End of the for loop.

  // After the loop completes, the final result is the value of 'down'.
  // This value is printed to the console.
  console.log( down );

} // End of the Main function.


/*
 * The following section is boilerplate code to handle standard input/output
 * in a typical competitive programming environment.
 * It reads the entire standard input asynchronously and passes it to the Main function.
 * This part should generally remain untouched for submission purposes.
 */
Main( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) );