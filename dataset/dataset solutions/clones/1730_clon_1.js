/*
 * This is a utility file for competitive programming.
 * It handles input/output and provides helper functions.
 * The core logic is in the Main function.
 */
// Don't modify the section below this line unless you know what you're doing.
// -------------------------------------------------------------------------

// Initialize readline interface for standard input and output.
var read = require( 'readline' ).createInterface(
  {
    input  :  process.stdin, /* Standard input stream */
    output :  process.stdout /* Standard output stream */
  }
);


// Declare global variables for input processing.
var obj;
var inLine = [ ]; /* Array to store each line of input */


// Event listener for each line of input received.
read.on( 'line' ,  function( input ) {
  inLine.push( input ); // Add the current line to the inLine array.
} );


// Event listener for when the input stream closes.
read.on( 'close' ,  function( ) {
  // Initialize the input object from the collected lines.
  obj = init( inLine );

  // Print a blank line to stderr, useful for separating debug output.
  console.error( '\n' );

  // Record the start time for performance measurement.
  var start = Date.now();

  // Execute the main logic of the program.
  Main();

  // Calculate the elapsed time.
  var end = Date.now() - start;

  // Output execution time to stderr.
  myerr( 'time : ' + end + 'ms' );

  // Output memory usage to stderr.
  myerr( 'memory : ' + Math.round( process.memoryUsage().heapTotal / 1024 ) + 'KB' );
} );


/**
 * Creates a deep clone of an object. Handles Set objects specifically.
 * @param {any} obj - The object to clone.
 * @returns {any} A deep clone of the input object.
 */
function makeClone ( obj ) {
  return ( obj instanceof Set )
           ? new Set( Array.from( obj ) ) // If it's a Set, create a new Set from its elements.
           : JSON.parse( JSON.stringify( obj ) ); // Otherwise, use JSON serialization for deep cloning.
}


// Helper function to get the next integer from input.
function nextInt ( ) {
  return myconv( next() , 1 );
}

// Helper function to get the next string array (split by space).
function nextStrArray ( ) {
  return myconv( next() , 2 );
}

// Helper function to get the next integer array (split by space and parsed).
function nextIntArray ( ) {
  return myconv( next() , 4 );
}

// Helper function to get the next character array (split by character).
function nextCharArray ( ) {
  return myconv( next() , 6 );
}


// Retrieves the next token/line from the input object.
function next ( ) {
  return obj.next();
}

// Checks if there are more tokens/lines available in the input.
function hasNext ( ) {
  return obj.hasNext();
}


/**
 * Initializes an input object with methods for sequential access.
 * @param {string[]} input - An array of input lines.
 * @returns {object} An object with list, index, max, hasNext, and next properties.
 */
function init ( input ) {
  return {
    list  :  input,           /* The array of input lines */
    index :  0,               /* Current position in the input array */
    max   :  input.length,    /* Total number of input lines */

    // Method to check if there's more input available.
    hasNext :  function ( ) {
      return ( this.index < this.max );
    },

    // Method to get the next input line and advance the index.
    next :  function ( ) {
      if ( this.hasNext() ) {
        return this.list[ this.index++ ];
      }
      else {
        // Throw an error if no more input is available.
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}


// Outputs a string to standard output, followed by a newline.
function myout ( s ) {
  console.log( s );
}


// Outputs a string to standard error for debugging purposes.
function myerr ( s ) {
  console.error( 'debug:' + require( 'util' ).inspect( s , false , null ) );
}


/*
 * This function `myconv` handles various input conversion scenarios.
 * The 'no' parameter determines the conversion type:
 *
 *   - default / unknown: Returns the input `i` as is.
 *   - 1: Parses `i` as an integer using `parseInt()`.
 *   - 2: Splits `i` by spaces into a string array.
 *   - 4: Splits `i` by spaces and converts each part to a number (integer array).
 *   - 6: Splits `i` into a character array.
 *   - 7: Splits `i` into a character array and converts each character to a number.
 *   - 8: Joins elements of `i` with spaces.
 *   - 9: Joins elements of `i` with newlines.
 *   - 0: Joins elements of `i` with no separator.
 *
 *   In case of any conversion error, the original input `i` is returned.
 */
function myconv ( i , no ) {
  try {
    switch ( no ) {
      case 1:
        return parseInt( i );
      case 2:
        return i.split( ' ' );
      case 4:
        return i.split( ' ' ).map( Number );
      case 6:
        return i.split( '' );
      case 7:
        return i.split( '' ).map( Number );
      case 8:
        return i.join( ' ' );
      case 9:
        return i.join( '\n' );
      case 0:
        return i.join( '' );
      default:
        return i; // Default case: return input as is.
    }
  }
  catch ( e ) {
    return i; // Return original input on error.
  }
}

// -------------------------------------------------------------------------
// End of utility functions. The main program logic starts here.

/**
 * The main function where the problem's logic is implemented.
 * It calculates a specific sum based on an input integer N.
 */
function Main ( ) {
  // Read the integer N from input.
  var N = nextInt();

  // Initialize the output accumulator.
  var output = 0;

  // Loop from 1 up to N (inclusive).
  for ( var i = 1 ; i <= N ; i++ ) {
    // Calculate how many times 'i' divides N.
    var count = Math.floor( N / i );

    // Add to output using the sum of an arithmetic series formula: count * (count + 1) / 2
    // This is equivalent to summing numbers from 1 to 'count'.
    output += i * ( count * ( count + 1 ) / 2 );
  }

  // Output the final calculated result.
  myout( output );
}