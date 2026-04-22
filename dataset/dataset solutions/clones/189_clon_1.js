/*
 * This is a JavaScript file demonstrating basic input processing.
 * It reads data from standard input and manipulates a variable 'a'.
 * Created for Type I clone generation exercise.
 */


// Declare and initialize the main variable 'a'.
// This variable will be updated based on input.
var a = 'A';


// Ensure the standard input stream is open and ready to receive data.
process.stdin.resume();


// Set the character encoding for the standard input stream to UTF-8.
process.stdin.setEncoding( 'utf8' );


// Attach an event listener for the 'data' event on standard input.
// This function will be called whenever new data is available.
process.stdin.on(
  'data',
  function ( chunk )
  {
    // Process the incoming chunk of data.
    // First, remove leading/trailing whitespace, then split by comma.
    input = chunk . trim() . split( ',' );

    // Check if the first element of the input array matches the current value of 'a'.
    if ( input[0] == a )
    {
      // If it matches, update 'a' with the second element of the input.
      a = input[1];
    }
    // Otherwise, check if the second element of the input array matches 'a'.
    else if ( input[1] == a )
    {
      // If it matches, update 'a' with the first element of the input.
      a = input[0];
    }
    // No 'else' block needed as per original logic.
  }
); // End of 'data' event handler.


// Attach an event listener for the 'end' event on standard input.
// This function will be called when the input stream has finished.
process.stdin.on(
  'end',
  function ()
  {
    // Log the final value of variable 'a' to the console.
    console.log( a );
  }
); // End of 'end' event handler.

// The program will now wait for input.