"use strict" /* This directive enforces strict parsing and error handling in the script. */

// Define the primary function to handle incoming data.
const ProcessInputData = ( initialString ) => {

  // Split the input string by spaces to get individual components.
  const numericStrings = initialString.split(" ");

  // Parse the first component into an integer.
  const firstValue = parseInt( numericStrings[0], 10 );

  // Parse the second component into an integer.
  const secondValue = parseInt( numericStrings[1], 10 );

  // Parse the third component into an integer.
  const threshold = parseInt( numericStrings[2], 10 );

  // Determine the outcome based on whether the sum of the first two values
  // meets or exceeds the threshold.
  const outcomeMessage = ( firstValue + secondValue ) >= threshold ? "Yes" : "No";

  // Display the determined outcome to the console.
  console.log( outcomeMessage );

}; // End of the main data processing function.


// Invoke the data processing function, reading input from standard input.
ProcessInputData( require('fs').readFileSync( '/dev/stdin', 'utf8' ) );