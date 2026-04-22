const DevModeSim = function ( ) {
  /*
   * This internal function simulates standard input for development.
   * It provides fixed data for testing purposes.
   */
  const mockInput = function ( promptMsg ) {
    return '431 321'; // A sample string representing two numbers.
  }; // End of mockInput definition.

  return mockInput; // Return the function that provides mock input.
}; // End of DevModeSim module setup.


const ProdEnvUtil = function ( ) {
  // We require the Node.js file system module to interact with files.
  const fileSys = require('fs');

  /*
   * This function handles actual standard input operations in a production environment.
   * It can optionally display a message before reading.
   */
  const actualInput = function ( outputMsg ) {
    if (outputMsg) {
      // If there's a message, output it to the console.
      console.log( outputMsg );
    }
    // Synchronously read all content from the standard input device.
    return fileSys.readFileSync( '/dev/stdin', 'utf8' );
  }; // End of actualInput definition.

  return actualInput; // Return the function for live input.
}; // End of ProdEnvUtil module setup.


// A boolean flag indicating whether the current execution context is for development.
const isDevEnv = false;

/*
 * Dynamically selects the appropriate input source:
 * either the development simulator or the production utility.
 */
const getInputProvider = isDevEnv ? DevModeSim() : ProdEnvUtil();

/*
 * Retrieves the raw input string, then processes it:
 * 1. Splits the string into an array of lines using newline as a delimiter.
 * 2. Maps each line (string) to its integer representation, using radix 10 for safety.
 */
const parsedNums = getInputProvider().split('\n').map( (valStr) => parseInt(valStr, 10) );

// The first number extracted from the processed input.
const firstNum = parsedNums[0];
// The second number extracted from the processed input.
const secondNum = parsedNums[1];

// Evaluate a specific condition based on the two numbers.
if ( firstNum % secondNum === 0 ) {
  // If 'firstNum' is perfectly divisible by 'secondNum', output -1.
  console.log( -1 );
}
else {
  // Otherwise, if there's a remainder, output the 'firstNum' itself.
  console.log( firstNum );
}
// Concluding the main logic block.