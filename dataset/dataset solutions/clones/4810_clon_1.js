/*
 * This JavaScript file processes input data according to specific rules.
 * It contains a main function 'Main' and a 'debug' helper.
 * The primary goal is to compute a value 'c' based on input array manipulation.
 */
function Main ( input ) {

  // First, split the entire input string by newline characters.
  // This converts a multi-line string into an array of strings, one per line.
  input = input.split( "\n" );

  // Next, access the second line of the input (index 1) and
  // split it by spaces to get an array of string tokens.
  tmp = input[1] .split( " " );

  // Initialize two control variables for the processing logic.
  var c = 1; // 'c' is often used as a flag or a counter, initialized to 1 here.
  var d = 0; // 'd' is another counter, reset within the loop, initialized to 0.

  // This is the outer loop. It iterates backwards from the end of the 'tmp' array.
  // The loop variable 'j' starts at tmp.length - 1 and goes down to 0.
  for ( j = tmp.length - 1 ; j >= 0 ; j-- ) {

    // This is the inner loop. It iterates forwards from the beginning of the 'tmp' array.
    // The loop variable 'i' starts at 0 and goes up to tmp.length - 1.
    for ( i = 0 ; i < tmp.length ; i++ ) {
      // Inside the inner loop, check if the element at tmp[i] is equal to the current 'j' value.
      if ( tmp[i] == j ) {
        d++; // If they match, increment the counter 'd'.
      }
    }

    // After the inner loop completes, evaluate conditions based on 'd' and 'j'.
    // If 'd' is not equal to 2 AND 'j' is greater than 0, then set 'c' to 0 and exit the loop.
    if ( d != 2 && j > 0 ) {
      c = 0; // Set the flag 'c' to 0, indicating a specific condition was met.
      break; // Terminate the outer loop immediately.
    }

    // If 'd' is not equal to 1 AND 'j' is exactly 0, then set 'c' to 0 and exit the loop.
    if ( d != 1 && j == 0 ) {
      c = 0; // Another condition leading to 'c' being 0.
      break; // Terminate the outer loop.
    }

    // Reset 'd' to 0 for the next iteration of the outer loop.
    d = 0;

    // IMPORTANT: This line causes 'j' to decrement an additional time.
    // The 'for' loop's `j--` already decrements 'j', so 'j' will be decremented twice per outer iteration.
    j--;
  }

  // After all loops, compute the final value of 'c'.
  // It involves:
  //   1. Dividing tmp.length by 2.
  //   2. Converting the result to an integer using parseInt.
  //   3. Raising this integer to the power of 2.
  //   4. Taking the modulo of this result with (10^9 + 7).
  c = Math.pow( parseInt( tmp.length / 2 ) , 2 ) % ( Math.pow( 10 , 9 ) + 7 );

  // Output the computed value of 'c' to the console.
  console.log( '%s' , c );

} // End of the Main function definition.


/*
 * This is a debug function, typically used in a browser environment.
 * It retrieves input from an HTML element and passes it to the Main function.
 */
function debug () {
  // Get the value of the HTML element with the ID "input".
  var input = document.getElementById( "input" ).value;

  // Call the Main function with the retrieved input.
  Main( input );
} // End of the debug function definition.


// This is the entry point for execution when run in a Node.js environment.
// It reads the entire content of standard input ("/dev/stdin") as UTF-8,
// and then passes this content to the Main function for processing.
Main( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) );