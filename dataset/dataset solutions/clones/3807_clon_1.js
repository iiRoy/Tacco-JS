/*
 * This is a Type I clone of an existing JavaScript file.
 * The primary goal is to demonstrate visual difference through
 * extensive changes in whitespace and comments, while maintaining
 * absolute structural and logical equivalence to the original code.
 *
 * All variable names, function names, operators, expressions, and
 * the overall flow of execution remain precisely the same.
 */

// ----------------------------------------------------------------------
// Section: Utility and Setup Code - Not directly related to the core logic
// These parts handle input/output and provide helper functions.
// ----------------------------------------------------------------------

    // Import the 'readline' module to handle standard input.
var read = require( 'readline' ) . createInterface( {
  input  : process . stdin,
  output : process . stdout
} );


var obj;                   // Variable to hold the parsed input object.
var inLine = [ ];          // Array to store lines read from input.

// Event listener for each line of input received.
read . on( 'line' , function ( input ) {
  inLine . push( input ); // Add the current line to the 'inLine' array.
} );


// Event listener for when the input stream closes.
read . on( 'close' , function ( ) {

  // Initialize the input object from the collected lines.
  obj = init( inLine );

  // Output a blank line to the error stream for separation.
  console . error( "\n" );

  var start = Date . now( ); // Record the starting time for performance measurement.

  Main( );                   // Execute the main program logic.

  var end = Date . now( ) - start; // Calculate elapsed time.

  // Log execution time to the error stream.
  myerr( "time : " + ( end ) + "ms" );

  // Log memory usage to the error stream.
  myerr( "memory : " + Math . round( process . memoryUsage( ) . heapTotal / 1024 ) + "KB" );

} );


/**
 * Creates a deep clone of an object using JSON serialization.
 * @param {object} obj - The object to be cloned.
 * @returns {object} A deep copy of the input object.
 */
function makeClone( obj ) {
  return JSON . parse( JSON . stringify( obj ) );
}


// Helper functions to retrieve and parse different types of input.
function nextInt( ) {
  return myconv( next( ) , 1 );
}
function nextStrArray( ) {
  return myconv( next( ) , 2 );
}
function nextIntArray( ) {
  return myconv( next( ) , 4 );
}
function nextCharArray( ) {
  return myconv( next( ) , 6 );
}

function next( ) {
  return obj . next( );
}
function hasNext( ) {
  return obj . hasNext( );
}


/**
 * Initializes an object to manage input lines, providing `hasNext` and `next` methods.
 * @param {string[]} input - An array of strings, where each string is a line of input.
 * @returns {object} An object with methods to iterate through the input.
 */
function init( input ) {

  var returnObj = {

    list  : input,          // The array of input lines.
    index : 0,              // Current index in the input array.
    max   : input . length, // Total number of input lines.

    /**
     * Checks if there are more input lines available.
     * @returns {boolean} True if more input is available, false otherwise.
     */
    hasNext : function ( ) {
      return ( this . index < this . max );
    },

    /**
     * Retrieves the next input line and advances the index.
     * @returns {string} The next line of input.
     * @throws {string} "ArrayIndexOutOfBoundsException" if no more input.
     */
    next : function ( ) {
      if ( ! this . hasNext( ) ) {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      } else {
        var returnInput = this . list[ this . index ++ ]; // Get current line and increment index.
        return returnInput;
      }
    }
  };

  return returnObj; // Return the initialized input management object.

}


/**
 * Outputs a string to the standard console log.
 * @param {string} s - The string to be logged.
 */
function myout( s ) {
  console . log( s );
}


/**
 * Outputs a debug message to the standard error stream.
 * It uses Node.js's `util.inspect` for detailed object inspection.
 * @param {*} s - The value to be inspected and logged as a debug message.
 */
function myerr( s ) {
  console . error( "debug:" + require( "util" ) . inspect( s , false , null ) );
}


/*
 * The 'no' parameter in myconv specifies the conversion type:
 * - default / unknown / outlier : Returns the input 'i' as is.
 * - 1: Parses 'i' as an integer (parseInt).
 * - 2: Splits 'i' by spaces into an array of strings.
 * - 4: Splits 'i' by spaces and converts each part to a number (map(Number)).
 * - 6: Splits 'i' into an array of single characters.
 * - 7: Splits 'i' into characters and converts each to a number.
 * - 8: Joins an array 'i' with spaces.
 * - 9: Joins an array 'i' with newlines.
 * - 0: Joins an array 'i' with no character (concatenates).
 */
function myconv( i , no ) {
  try {
    switch ( no ) {
      case 1 : return parseInt( i );
      case 2 : return i . split( " " );
      case 4 : return i . split( " " ) . map( Number );
      case 6 : return i . split( "" );
      case 7 : return i . split( "" ) . map( Number );
      case 8 : return i . join( " " );
      case 9 : return i . join( "\n" );
      case 0 : return i . join( "" );
      default : return i;
    }
  } catch ( e ) {
    return i; // In case of conversion error, return original input.
  }
}

// ----------------------------------------------------------------------
// Section: End of Utility and Setup Code
// ----------------------------------------------------------------------


/**
 * The main function containing the core logic of the program.
 * This function processes input data to calculate a specific output.
 */
function Main( ) {

  var N      = nextInt( );        // Read the number of elements.
  var list   = nextIntArray( );   // Read the array of integers.
  var output = 0;                 // Initialize the result accumulator.

  var L      = 0;                 // Left pointer for the sliding window.
  var R      = 0;                 // Right pointer for the sliding window.

  // Initialize XOR sum with the first element of the list.
  var xor    = list[ 0 ];


  // Loop continues as long as either pointer is within the bounds of the array.
  while ( L < N || R < N ) {

    // Strategy: Advance R as long as the condition (xor == sum) holds true.
    // The `output` increases by the length of the valid subsegment.
    // If the condition fails, we advance L.
    // This process repeats until all possible subsegments are considered.

    // For debugging purposes, uncomment these lines:
    // myerr("now : " + xor);
    // myerr({L,R});

    // Check if adding the next element to the window maintains the XOR sum property.
    // The condition `A + B == (A ^ B)` implies that A and B have no common set bits.
    if ( xor + list[ R + 1 ] == ( xor ^ list[ R + 1 ] ) ) {

      // Condition holds: Extend the window to the right.
      // myerr("ok"); // Debugging
      // myerr(R - L + 1); // Debugging

      output += R - L + 1; // Add the current valid window length to the total output.
      R++;                 // Move the right pointer one step further.
      xor += list[ R ];    // Update the XOR sum to include the new element.

    } else {

      // Condition fails: The current element breaks the XOR sum property.
      // myerr("ng"); // Debugging

      // We need to shrink the window from the left.
      xor -= list[ L ]; // Remove the leftmost element from the XOR sum.
      L++;              // Move the left pointer one step further.

      // If the right pointer has fallen behind the left pointer,
      // reset R to L and re-initialize the XOR sum.
      if ( R < L ) {
        R   = L;           // R catches up with L.
        xor = list[ R ];   // Re-initialize xor sum with the element at the new R.
      }

    }

    // For debugging purposes, uncomment these lines:
    // myerr("next : " + xor);
    // myerr({L,R});

  }

  // Output the final calculated result, adjusted by N.
  myout( output + N );
}