/*
 * This file contains a JavaScript program designed for competitive programming contexts.
 * It includes boilerplate for reading input, processing it, and a main function
 * to solve a specific problem.
 *
 * The initial section handles input/output and provides utility functions.
 * It's structured to be easily reusable across different problems.
 */

// Don't have to see. start------------------------------------------
// Initialize the readline interface for standard input/output.
var read = require( 'readline' ) . createInterface( {
  input : process.stdin,
  output : process.stdout
} );

// Declare variables for input handling.
var obj ; // Will hold the processed input object.
var inLine = [ ] ; // Array to store each line read from stdin.

// Event listener for each line of input received.
read.on( 'line' , function ( input ) {
  inLine.push( input ) ; // Add the received line to the inLine array.
} ) ;

// Event listener for when the input stream closes.
read.on( 'close' , function ( ) {
  obj = init( inLine ) ; // Initialize the input object with all collected lines.
  console.error( "\n" ) ; // Output a newline to stderr for visual separation.

  var start = Date.now( ) ; // Record the starting time for performance measurement.
  Main( ) ; // Execute the main problem-solving logic.

  var end = Date.now( ) - start ; // Calculate the elapsed time.
  myerr( "time : " + ( end ) + "ms" ) ; // Log the execution time to stderr.
  myerr( "memory : " + Math.round( process.memoryUsage( ) . heapTotal / 1024 ) + "KB" ) ; // Log memory usage.
} ) ;

/**
 * Creates a deep clone of an object using JSON serialization/deserialization.
 * This method is simple but has limitations (e.g., does not handle functions, Date objects, etc.).
 * @param {object} obj - The object to be cloned.
 * @returns {object} A new object that is a deep copy of the original.
 */
function makeClone( obj ) {
  return JSON.parse( JSON.stringify( obj ) ) ;
}

// Utility functions to read and convert the next input token.
function nextInt( ) { return myconv( next( ) , 1 ) ; } // Reads next token and converts to integer.
function nextStrArray( ) { return myconv( next( ) , 2 ) ; } // Reads next token and splits into string array.
function nextIntArray( ) { return myconv( next( ) , 4 ) ; } // Reads next token, splits, and converts to integer array.
function nextCharArray( ) { return myconv( next( ) , 6 ) ; } // Reads next token and splits into character array.

// Functions to interact with the global input object 'obj'.
function next( ) { return obj.next( ) ; } // Gets the next input token.
function hasNext( ) { return obj.hasNext( ) ; } // Checks if there are more input tokens.

/**
 * Initializes an input handler object that provides methods to consume lines from an array.
 * This allows sequential access to input lines.
 * @param {string[]} input - An array of strings, where each string is a line of input.
 * @returns {object} An object with `hasNext()` and `next()` methods.
 */
function init( input ) {
  return {
    list : input , // The array of input lines.
    index : 0 , // Current index in the input array.
    max : input.length , // Total number of input lines.

    /**
     * Checks if there are more input lines available.
     * @returns {boolean} True if more input lines exist, false otherwise.
     */
    hasNext : function ( ) {
      return ( this.index < this.max ) ;
    } ,

    /**
     * Retrieves the next input line and advances the index.
     * Throws an error if no more input lines are available.
     * @returns {string} The next input line.
     * @throws {string} "ArrayIndexOutOfBoundsException ‚There is no more input" if no more input.
     */
    next : function ( ) {
      if ( this.hasNext( ) ) {
        return this.list [ this.index++ ] ;
      } else {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input" ;
      }
    }
  } ;
}

/**
 * Outputs a string to the standard output (console.log).
 * @param {string} s - The string to be output.
 */
function myout( s ) { console.log( s ) ; }

/**
 * Outputs debug information to the standard error (console.error).
 * Uses Node.js's `util.inspect` for detailed object inspection.
 * @param {*} s - The value to be inspected and output as debug info.
 */
function myerr( s ) {
  console.error( "debug:" + require( "util" ) . inspect( s , false , null ) ) ;
}

/**
 * Performs various conversions on the input `i` based on the `no` parameter.
 * This function acts as a versatile parser/formatter for input data.
 *
 * @param {*} i - The input value to be converted. Can be a string or an array.
 * @param {number} no - A numeric code indicating the desired conversion type:
 *   - 1: `parseInt(i)` (converts a string to an integer).
 *   - 2: `i.split(" ")` (splits a string by spaces into a string array).
 *   - 4: `i.split(" ").map(Number)` (splits by spaces and converts parts to numbers).
 *   - 6: `i.split("")` (splits a string into a character array).
 *   - 7: `i.split("").map(Number)` (splits into characters and converts to numbers).
 *   - 8: `i.join(" ")` (joins array elements with spaces).
 *   - 9: `i.join("\n")` (joins array elements with newlines).
 *   - 0: `i.join("")` (joins array elements without any separator).
 *   - Default/Other: Returns `i` unchanged.
 * @returns {*} The converted value, or the original `i` if conversion fails or `no` is unknown.
 */
function myconv( i , no ) {
  try {
    switch ( no ) {
      case 1 :
        return parseInt( i ) ;
      case 2 :
        return i.split( " " ) ;
      case 4 :
        return i.split( " " ) . map( Number ) ;
      case 6 :
        return i.split( "" ) ;
      case 7 :
        return i.split( "" ) . map( Number ) ;
      case 8 :
        return i.join( " " ) ;
      case 9 :
        return i.join( "\n" ) ;
      case 0 :
        return i.join( "" ) ;
      default :
        return i ;
    }
  } catch ( e ) {
    return i ; // In case of an error during conversion, return the original input.
  }
}

// Don't have to see. end------------------------------------------

/**
 * The main function contains the core logic to solve the problem.
 * This problem appears to involve finding the minimum difference in area
 * when dividing a rectangle into three pieces.
 */
function Main( ) {
  // Read the initial dimensions (Height and Width) from the input.
  var one = nextIntArray( ) ;
  var H = one [ 0 ] ; // Height of the rectangle.
  var W = one [ 1 ] ; // Width of the rectangle.

  // Initialize 'output' with a very large number to find the minimum difference.
  var output = 100000000000 ;

  /*
   * First set of calculations: Iterate through possible cuts along the 'H' dimension.
   * This loop considers splitting the rectangle into three pieces where one piece has height 'i',
   * and the remaining (H-i) height is split into two further pieces.
   * The loop runs for i from 1 up to H-2, ensuring each piece has at least height 1.
   */
  for ( var i = 1 ; i <= H - 2 ; i++ ) {

    // Scenario 1: Divide the remaining (H-i) height into two pieces,
    // both spanning the full width 'W'.
    // This creates three horizontal strips.
    var tate1 = i ;                                       // Height of the first piece.
    var tate2 = Math.floor( ( H - i ) / 2 ) ;             // Height of the second piece.
    var tate3 = Math.ceil( ( H - i ) / 2 ) ;              // Height of the third piece.

    // Calculate the maximum and minimum heights among these three pieces.
    var tatemax = Math.max.apply( null , [ tate1 , tate2 , tate3 ] ) ;
    var tatemin = Math.min.apply( null , [ tate1 , tate2 , tate3 ] ) ;

    // Update the minimum output with the area difference for this configuration.
    // The difference in area is (max_height - min_height) * W.
    output = Math.min( output , ( tatemax - tatemin ) * W ) ;

    // Scenario 2: One piece has height 'i' and full width 'W'.
    // The remaining (H-i) height is split into two pieces,
    // each spanning half of the width 'W'.
    // This creates one horizontal strip and two vertical strips.
    var yoko1 = Math.floor( W / 2 ) ;                     // Width for one of the two remaining pieces.
    var yoko2 = Math.ceil( W / 2 ) ;                      // Width for the other remaining piece.

    var s1 = i * W ;                                      // Area of the first piece.
    var s2 = ( H - i ) * yoko1 ;                          // Area of the second piece.
    var s3 = ( H - i ) * yoko2 ;                          // Area of the third piece.

    // Calculate the maximum and minimum areas among these three pieces.
    var yokomax = Math.max.apply( null , [ s1 , s2 , s3 ] ) ;
    var yokomin = Math.min.apply( null , [ s1 , s2 , s3 ] ) ;

    // Update the minimum output with the area difference for this configuration.
    output = Math.min( output , yokomax - yokomin ) ;
  }

  /*
   * Swap H and W to consider the case where the initial cut is along the 'W' dimension.
   * By swapping, we can reuse the same logic from the previous loop to cover both orientations.
   */
  var tmp = H ; // Store original H.
  H = W ;       // H now becomes original W.
  W = tmp ;     // W now becomes original H.

  /*
   * Second set of calculations: Repeat the same logic with the swapped H and W.
   * This effectively checks configurations where the "first cut" is vertical instead of horizontal.
   */
  for ( var i = 1 ; i <= H - 2 ; i++ ) {

    // Scenario 1 (after swap): Three "horizontal" strips.
    // In original terms: one vertical strip of width 'i',
    // and remaining (W-i) width split into two vertical strips.
    var tate1 = i ;
    var tate2 = Math.floor( ( H - i ) / 2 ) ;
    var tate3 = Math.ceil( ( H - i ) / 2 ) ;

    var tatemax = Math.max.apply( null , [ tate1 , tate2 , tate3 ] ) ;
    var tatemin = Math.min.apply( null , [ tate1 , tate2 , tate3 ] ) ;

    output = Math.min( output , ( tatemax - tatemin ) * W ) ;

    // Scenario 2 (after swap): One "horizontal" strip and two "vertical" strips.
    // In original terms: one vertical strip of width 'i' and height 'H',
    // and remaining (W-i) width split into two horizontal strips.
    var yoko1 = Math.floor( W / 2 ) ;
    var yoko2 = Math.ceil( W / 2 ) ;

    var s1 = i * W ;
    var s2 = ( H - i ) * yoko1 ;
    var s3 = ( H - i ) * yoko2 ;

    var yokomax = Math.max.apply( null , [ s1 , s2 , s3 ] ) ;
    var yokomin = Math.min.apply( null , [ s1 , s2 , s3 ] ) ;

    output = Math.min( output , yokomax - yokomin ) ;
  }

  // Output the final minimum difference found.
  myout( output ) ;
}