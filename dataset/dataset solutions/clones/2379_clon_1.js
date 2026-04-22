/*
 * This section contains utility functions for input/output and
 * general-purpose operations. It's often bundled with competitive programming
 * templates.
 */
// Start of the boilerplate code block - typically not relevant to the problem's core logic.
// This comment is for internal understanding and can be modified or removed.
var read = require('readline').createInterface(
  {
    input: process.stdin,
    output: process.stdout
  }
);
// Declare global variables for storing input and an object for input parsing.
var obj;
var inLine = [ ];

// Event listener for each line of input received.
read.on('line', function (input) {
  // Push the current line into the input array.
  inLine.push(input);
});

// Event listener for when the input stream closes.
read.on('close', function ( ) {
  // Initialize the input object with the collected lines.
  obj = init(inLine);
  // Output an empty line to stderr for visual separation in debug logs.
  console.error( "\n" );

  var start = Date.now( ); // Record the start time for performance measurement.

  Main( ); // Execute the main logic of the program.

  var end = Date.now( ) - start; // Calculate elapsed time.

  // Report execution time.
  myerr( "time : " + ( end ) + "ms" );
  // Report memory usage (heapTotal).
  myerr( "memory : " + Math.round( process.memoryUsage( ).heapTotal / 1024 ) + "KB" );
});

/**
 * Creates a deep clone of a given object using JSON serialization/deserialization.
 * Note: This method has limitations (e.g., cannot clone functions, Dates, regexps, etc.).
 * @param {object} obj - The object to be cloned.
 * @returns {object} A deep clone of the input object.
 */
function makeClone( obj ) {
  return JSON.parse( JSON.stringify( obj ) );
}

/**
 * Retrieves the next input token and attempts to parse it as an integer.
 * @returns {number} The parsed integer.
 */
function nextInt( ) { return myconv( next( ), 1 ); }

/**
 * Retrieves the next input token and splits it into a string array by spaces.
 * @returns {string[]} An array of strings.
 */
function nextStrArray( ) { return myconv( next( ), 2 ); }

/**
 * Retrieves the next input token, splits it by spaces, and maps to numbers.
 * @returns {number[]} An array of numbers.
 */
function nextIntArray( ) { return myconv( next( ), 4 ); }

/**
 * Retrieves the next input token and splits it into a character array.
 * @returns {string[]} An array of single-character strings.
 */
function nextCharArray( ) { return myconv( next( ), 6 ); }

/**
 * Retrieves the next available input token from the initialized input object.
 * @returns {string} The next input token.
 */
function next( ) { return obj.next( ); }

/**
 * Checks if there are more input tokens available.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasNext( ) { return obj.hasNext( ); }

/**
 * Initializes an input object with a list of strings, providing methods
 * to check for and retrieve the next input token.
 * @param {string[]} input - An array of input strings.
 * @returns {object} An object with input parsing capabilities.
 */
function init( input ) {
  return {
    list: input,
    index: 0,
    max: input.length,
    hasNext: function ( ) { return ( this.index < this.max ); },
    next: function ( ) {
      if ( this.hasNext( ) ) {
        return this.list[ this.index++ ];
      } else {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      }
    }
  };
}

/**
 * Outputs a string to the console (standard output).
 * @param {string} s - The string to output.
 */
function myout( s ) { console.log( s ); }

/**
 * Outputs a debug message to the console (standard error),
 * using util.inspect for detailed object representation.
 * @param {*} s - The value to debug output.
 */
function myerr( s ) { console.error( "debug:" + require("util").inspect( s, false, null ) ); }

/*
 * This function is a versatile converter for input processing.
 * The 'no' parameter dictates the conversion type:
 * 1: parseInt (string to integer)
 * 2: split by space (string to array of strings)
 * 4: split by space and map to Number (string to array of numbers)
 * 6: split into characters (string to array of single-character strings)
 * 7: split into characters and map to Number (string to array of numbers from characters)
 * 8: join array elements with space (array to space-separated string)
 * 9: join array elements with newline (array to newline-separated string)
 * 0: join array elements without separator (array to concatenated string)
 * default: return input as is
 */
function myconv( i, no ) {
  try {
    switch ( no ) {
      case 1:
        return parseInt( i );
      case 2:
        return i.split( " " );
      case 4:
        return i.split( " " ).map( Number );
      case 6:
        return i.split( "" );
      case 7:
        return i.split( "" ).map( Number );
      case 8:
        return i.join( " " );
      case 9:
        return i.join( "\n" );
      case 0:
        return i.join( "" );
      default:
        return i;
    }
  } catch ( e ) {
    return i;
  }
}

// End of boilerplate code. The main problem-solving logic follows.
// This part is generally what needs to be optimized or specifically written for a problem.
function Main( ) {
  // Read the integer N, representing the number of elements.
  var N = nextInt( );
  // Read the list of integers.
  var list = nextIntArray( );

  // Initialize counters for 'R', 'B', 'G' as described in the problem.
  var R = 1;
  var B = 0;
  var G = 0;

  // Initialize the output variable, which will store the final result.
  var output = 3;
  // Define the modulo constant for calculations.
  var mod = 1000000007;

  // Check the initial condition for the first element.
  if ( list[ 0 ] != 0 ) {
    // If the first element is not 0, the condition is not met, output 0 and exit.
    myout( 0 );
    return;
  }

  // Iterate through the list starting from the second element.
  for ( var i = 1; i < N; i++ ) {
    var count = 0;     // Counter for how many paths match the current element.
    var added = false; // Flag to ensure only one R, B, or G is incremented per element.

    // Check if the current list element matches 'R'.
    if ( list[ i ] == R ) {
      count++; // Increment count if 'R' matches.
      R++;     // Increment 'R' for the next iteration.
      added = true; // Set flag as R path was taken.
    }

    // Check if the current list element matches 'B'.
    if ( list[ i ] == B ) {
      count++; // Increment count if 'B' matches.
      if ( !added ) { // Only increment B if no other path (R) was taken for this element.
        B++;
        added = true; // Set flag as B path was taken.
      }
    }

    // Check if the current list element matches 'G'.
    if ( list[ i ] == G ) {
      count++; // Increment count if 'G' matches.
      if ( !added ) { // Only increment G if no other path (R or B) was taken for this element.
        G++;
        added = true; // Set flag as G path was taken.
      }
    }

    // Update the output by multiplying with the current count.
    output *= count;
    // Apply modulo operation to keep the output within bounds.
    output %= mod;

    // A commented-out debug line, useful during development but disabled for final submission.
    // myerr(output);
  }

  // Output the final calculated result.
  myout( output );
}