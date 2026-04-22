/*
 * This file contains JavaScript code for a competitive programming setup.
 * It includes utilities for reading input, parsing data, and basic output.
 * The primary logic is encapsulated within the 'Main' function.
 */

// --- SECTION: Input Reading Initialization ---
// This part sets up the readline interface to handle standard input.
var read = require('readline').createInterface(
                                                 {
                                                   input  :  process.stdin, /* Standard input stream */
                                                   output :  process.stdout /* Standard output stream (not strictly used for input, but required by createInterface) */
                                                 }
                                               );


var obj;        // Declared to store the initialized input object later.
var inLine = [ ]; // An array to accumulate all input lines from stdin.


// Event listener for each line of input received.
read.on(
  'line',
  function ( input ) {
    inLine.push(input); // Add the current line to our buffer.
  }
);


// Event listener for when the input stream has ended (all lines read).
read.on(
  'close',
  function ( ) {
    obj = init(inLine); // Initialize the input processing object with all collected lines.

    // A debug message printed to standard error, indicating program flow.
    console.error('\n↑入力 ↓出力');

    Main(); // Invoke the main function to start the problem's logic.
  }
);


/*
 * Helper function: makeClone
 * Creates a deep clone of an object. If the object is a Set, it handles
 * the cloning specifically for Set instances; otherwise, it uses
 * JSON serialization/deserialization for a generic deep copy.
 */
function makeClone( obj ) {
  return ( obj instanceof Set )
           ? new Set(Array.from(obj)) // Clone a Set
           : JSON.parse(JSON.stringify(obj)); // Generic deep clone for other objects
}


// --- SECTION: Input Parsing Helper Functions ---
// These functions provide convenient ways to retrieve and parse input values.

// Reads the next input token and parses it as an integer.
function nextInt( ) {
  return myconv(next(), 1);
}

// Reads the next input token and splits it into an array of strings based on spaces.
function nextStrArray( ) {
  return myconv(next(), 2);
}

// Reads the next input token, splits it by spaces, and converts each part to a number.
function nextIntArray( ) {
  return myconv(next(), 4);
}

// Reads the next input token and splits it into an array of individual characters.
function nextCharArray( ) {
  return myconv(next(), 6);
}


// Retrieves the next available token (line) from the input buffer.
function next( ) {
  return obj.next();
}

// Checks if there are more input tokens (lines) available to read.
function hasNext( ) {
  return obj.hasNext();
}


/*
 * Function: init
 * Initializes and returns an object responsible for managing input lines.
 * It provides methods to check for available input and retrieve the next line.
 */
function init( input ) {
  return {
           list  :  input,          // The array containing all input lines.
           index :  0,              // Current position (index) in the input array.
           max   :  input.length,   // Total number of input lines.

           // Method to determine if there are more lines to read.
           hasNext : function ( ) {
             return ( this.index < this.max );
           },

           // Method to retrieve the next input line and advance the index.
           next : function ( ) {
             if ( this.hasNext() ) {
               return this.list[this.index++]; // Return current line and increment index.
             } else {
               // If no more input, throw an error.
               throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
             }
           }
         };
}


// --- SECTION: Output and Debugging Functions ---

// Prints the given value 's' to the standard output.
function myout( s ) {
  console.log(s);
}

// Prints a debug message to standard error, inspecting the given object 's'.
function myerr( s ) {
  console.error(
    'debug:' + require('util').inspect(s, false, null)
  );
}


/*
 * Function: myconv
 * A versatile conversion utility. It performs various parsing or joining
 * operations on the input 'i' based on the 'no' parameter.
 *
 * Parameter 'no' definitions:
 *   1: Converts 'i' to an integer using parseInt.
 *   2: Splits 'i' by spaces into an array of strings.
 *   4: Splits 'i' by spaces and maps each part to a Number (array of integers).
 *   6: Splits 'i' into an array of individual characters.
 *   7: Splits 'i' into characters and maps each to a Number (array of single-digit integers).
 *   8: Joins elements of array 'i' with spaces.
 *   9: Joins elements of array 'i' with newlines.
 *   0: Joins elements of array 'i' without any separator.
 *   Default/Outlier: Returns 'i' as is if 'no' doesn't match a defined case.
 */
function myconv( i, no ) {
  try {
    switch ( no ) {
      case 1:
        return parseInt(i);
      case 2:
        return i.split(' ');
      case 4:
        return i.split(' ').map(Number);
      case 6:
        return i.split('');
      case 7:
        return i.split('').map(Number);
      case 8:
        return i.join(' ');
      case 9:
        return i.join('\n');
      case 0:
        return i.join('');
      default:
        return i; // If 'no' is an unrecognized value, return the original input.
    }
  }
  catch ( e ) {
    // In case any conversion operation throws an error, gracefully return the original input.
    return i;
  }
}

// Don't have to see. end------------------------------------------

/*
 * Function: Main
 * This is the core logic function of the program.
 * It reads two integers, N and K, from the input,
 * and then calculates and prints the length of the base-K representation of N.
 */
function Main( ) {
  // Read the first line of input, which is expected to contain two integers.
  var one = nextIntArray();

  // Extract the first integer and assign it to variable N.
  var N = one[0];

  // Extract the second integer and assign it to variable K.
  var K = one[1];

  // Convert N to its string representation in base K, then get the length of that string.
  // Print the resulting length to standard output.
  myout(N.toString(K).length);
}