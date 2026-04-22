// --- Initial Setup and Core Utilities (Internal Use Only) ---
// This section prepares the environment for competitive programming.
// It includes input/output handling, timing, and memory usage tracking.

var   read  =  require( 'readline' ) . createInterface( {
  input   :  process.stdin,
  output  :  process.stdout
} ) ; // Initialize readline interface for standard I/O.

var obj ; // Object to manage input stream.
var inLine = [ ] ; // Buffer for all incoming lines from standard input.

// Event listener for each line of input received.
read . on( 'line' , function( input ) {
  inLine . push( input ) ; // Store the input line in the buffer.
} ) ;

// Event listener for the 'close' event, triggered when input ends.
read . on( 'close' , function( ) {
  obj = init( inLine ) ; // Initialize the custom input object with buffered lines.

  console . error( '\n' ) ; // Output a blank line to stderr for cleaner debug output.

  var start = Date . now( ) ; // Record the starting timestamp for execution time calculation.

  Main( ) ; // Execute the primary logic of the program.

  var end = Date . now( ) - start ; // Calculate the total execution duration.

  myerr( 'time : ' + end + 'ms' ) ; // Report the execution time.
  myerr( 'memory : ' + Math . round( process . memoryUsage( ) . heapTotal / 1024 ) + 'KB' ) ; // Report memory consumption.
} ) ;


/**
 *  Performs a deep clone of an object.
 *  Handles Set objects specifically; otherwise, uses JSON serialization/deserialization.
 *  @param {any} obj The object to be cloned.
 *  @returns {any} A new, deeply cloned object.
 */
function makeClone( obj ) {
  return  ( obj  instanceof  Set )
    ?  new Set( Array . from( obj ) )
    :  JSON . parse( JSON . stringify( obj ) ) ;
}


/* --- Input Parsing Helper Functions --- */

/**
 *  Reads the next input line and parses it as an integer.
 *  @returns {number} The parsed integer.
 */
function nextInt( ) { return myconv( next( ) , 1 ) ; }

/**
 *  Reads the next input line and splits it into an array of strings by spaces.
 *  @returns {string[]} An array of strings.
 */
function nextStrArray( ) { return myconv( next( ) , 2 ) ; }

/**
 *  Reads the next input line, splits it by spaces, and converts elements to numbers.
 *  @returns {number[]} An array of numbers.
 */
function nextIntArray( ) { return myconv( next( ) , 4 ) ; }

/**
 *  Reads the next input line and splits it into an array of characters.
 *  @returns {string[]} An array of characters.
 */
function nextCharArray( ) { return myconv( next( ) , 6 ) ; }


/**
 *  Retrieves the next available item from the custom input stream.
 *  @returns {string} The next input line as a string.
 */
function next( ) { return obj . next( ) ; }

/**
 *  Checks if there are more items remaining in the input stream.
 *  @returns {boolean} True if more input is available, false otherwise.
 */
function hasNext( ) { return obj . hasNext( ) ; }


/**
 *  Initializes the custom input stream object.
 *  Provides methods to check for available input and retrieve the next line.
 *  @param {string[]} input An array of strings, where each string is a line of input.
 *  @returns {object} An object with `hasNext` and `next` methods.
 */
function init( input ) {
  return {
    list  :  input,           // The array holding all input lines.
    index :  0,               // The current position/index in the `list`.
    max   :  input . length,  // The total number of input lines.

    /**
     *  Checks if there are more lines to read.
     *  @returns {boolean} True if `index` is less than `max`, false otherwise.
     */
    hasNext :  function( ) {
      return  ( this . index  <  this . max ) ;
    },

    /**
     *  Retrieves the next line from the input list and advances the index.
     *  Throws an error if no more input is available.
     *  @returns {string} The next line of input.
     *  @throws {string} 'ArrayIndexOutOfBoundsException' if attempting to read beyond input end.
     */
    next :  function( ) {
      if  ( this . hasNext( ) ) {
        return  this . list[ this . index++ ] ;
      } else {
        throw  'ArrayIndexOutOfBoundsException ‚There is no more input' ;
      }
    }
  } ;
}


/**
 *  Outputs a given string to the console (standard output), followed by a newline.
 *  @param {string} s The string to be printed.
 */
function myout( s ) {
  console . log( s ) ;
}


/**
 *  Outputs debug information to standard error.
 *  Uses Node.js's `util.inspect` for detailed representation of objects.
 *  @param {any} s The data to be inspected and logged as debug information.
 */
function myerr( s ) {
  console . error( 'debug:'  +  require( 'util' ) . inspect( s , false , null ) ) ;
}


/*
 *  The 'myconv' function is a versatile converter for input strings or arrays.
 *  It handles various parsing and joining operations based on the 'no' parameter.
 *
 *  Parameter 'no' definitions:
 *  -  Any value not explicitly listed (unknown or outlier): Returns the input 'i' as is.
 *  -  1: Parses 'i' as an integer using `parseInt()`.
 *  -  2: Splits 'i' into an array of strings, using a space (' ') as the delimiter.
 *  -  4: Splits 'i' by spaces and then converts each resulting string to a number.
 *  -  6: Splits 'i' into an array of individual characters.
 *  -  7: Splits 'i' into an array of characters, then converts each character to a number.
 *  -  8: Joins the elements of 'i' (which is expected to be an array) into a single string,
 *         using a space (' ') as the separator.
 *  -  9: Joins the elements of 'i' into a single string, using a newline ('\n') as the separator.
 *  -  0: Joins the elements of 'i' into a single string, with no separator.
 */
function myconv( i , no ) {
  try {
    switch ( no ) {
      case  1  :  return  parseInt( i ) ;
      case  2  :  return  i . split( ' ' ) ;
      case  4  :  return  i . split( ' ' ) . map( Number ) ;
      case  6  :  return  i . split( '' ) ;
      case  7  :  return  i . split( '' ) . map( Number ) ;
      case  8  :  return  i . join( ' ' ) ;
      case  9  :  return  i . join( '\n' ) ;
      case  0  :  return  i . join( '' ) ;
      default  :  return  i ; // Fallback: return input unmodified.
    }
  }  catch ( e ) {
    // In case of any conversion error, simply return the original input 'i'.
    return  i ;
  }
}

// --- End of Utility and Setup Section ---


/**
 *  The Main function encapsulates the primary algorithm logic.
 *  It solves a specific permutation or arrangement problem.
 */
function Main( ) {

  // Read the integer N, which defines the problem's scale.
  var N  =  nextInt( ) ;

  // Read a list of N integers, representing initial values or positions.
  var list  =  nextIntArray( ) ;

  // Initialize an array of size N*N to store the final output.
  // This array will be populated with values based on the problem's rules.
  var output  =  new Array( N  *  N ) ;

  // First phase: Populate the 'output' array using the initial 'list'.
  // The values from 'list' are 1-indexed, so adjustments are made for 0-indexed array access.
  for ( var i = 0 ; i < N ; i++ ) {
    output[ list[ i ] - 1 ]  =  i + 1 ;
  }

  // Second phase: Iterate from 2 to N to fill remaining slots or validate existing ones.
  // This loop ensures that numbers are placed correctly according to problem constraints.
  for ( var i = 2 ; i <= N ; i++ ) {
    var count  =  i - 1 ; // 'count' tracks the number of slots that must be filled with the current value 'i'.

    // Iterate through the entire 'output' array to find suitable positions.
    for ( var j = 0 ; j < N  *  N ; j++ ) {
      // If a slot is currently empty (null), assign the current number 'i' to it.
      if ( output[ j ]  ==  null ) {
        count-- ; // Decrement the count of 'i's that still need to be placed.
        output[ j ]  =  i ; // Assign 'i' to the empty slot.

        // If all required 'i's have been placed, break from this inner loop.
        if ( count  ==  0 ) {
          break ;
        }
      }
      // If a slot already contains the current number 'i', it indicates an invalid state.
      else if ( output[ j ]  ==  i ) {
        myout( "No" ) ; // Output "No" as a solution is not possible.
        return ; // Terminate the Main function immediately.
      }
    }
  }

  // Third phase: Fill any remaining null slots with a sequential pattern.
  // This part completes the array based on a specific distribution logic.
  var add  =  new Array( N ) ; // 'add' array helps manage the counts for sequential numbers.

  // Initialize the 'add' array with values N-1, N-2, ..., 0.
  for ( var i = 0 ; i < N ; i++ ) {
    add[ i ]  =  N - i - 1 ;
  }

  var no  =  1 ; // 'no' represents the current sequential number to be placed.

  // Iterate through the 'output' array one last time.
  for ( var i = 0 ; i < N  *  N ; i++ ) {
    // If a slot is still empty.
    if ( output[ i ]  ==  null ) {
      output[ i ]  =  no ; // Assign the current sequential number 'no'.
      add[ 0 ]-- ; // Decrement the count for the current 'no'.

      // If the count for the current 'no' reaches zero, move to the next sequential number.
      if ( add[ 0 ]  ==  0 ) {
        add . shift( ) ; // Remove the used count from the 'add' array.
        no++ ; // Increment 'no' to the next sequential number.
      }
    }
  }

  // If the program successfully completes all phases, a valid solution was found.
  myout( "Yes" ) ; // Output "Yes" to indicate success.
  myout( myconv( output , 8 ) ) ; // Output the final 'output' array, with elements joined by spaces.
}