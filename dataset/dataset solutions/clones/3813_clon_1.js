/*
 * This section contains utility functions for input/output and data manipulation.
 * It is generally not part of the core problem logic.
 * --------------------------------------------------------------------------------
 */

var read = require('readline').createInterface(
  {
    input  :  process.stdin,
    output :  process.stdout
  }
);


// Declare variables to store parsed input and a buffer for incoming lines.
var obj ;

var inLine = [ ] ;


// Event listener for each line of input received.
read.on('line', function ( input ) {
  inLine.push( input ) ;
});


// Event listener for when the input stream closes.
read.on('close', function ( ) {

  // Initialize the input object from the collected lines.
  obj = init( inLine ) ;

  // Output a newline to stderr for visual separation in debug output.
  console.error( '\n' ) ;

  // Record the starting time for performance measurement.
  var start = Date.now( ) ;

  // Execute the main logic of the program.
  Main( ) ;

  // Calculate the elapsed time.
  var end = Date.now( ) - start ;

  // Log the execution time to stderr.
  myerr( 'time : ' + end + 'ms' ) ;

  // Log the memory usage to stderr.
  myerr( 'memory : ' + Math.round( process.memoryUsage( ).heapTotal / 1024 ) + 'KB' ) ;

});


/**
 * Creates a deep clone of an object. Handles Sets specifically,
 * otherwise uses JSON serialization/deserialization.
 * @param {any} obj - The object to clone.
 * @returns {any} A deep clone of the object.
 */
function makeClone ( obj )
{
  return ( obj instanceof Set )
           ? new Set ( Array.from ( obj ) )
           : JSON.parse ( JSON.stringify ( obj ) ) ;
}


/**
 * Reads the next input token and converts it to an integer.
 * @returns {number} The next integer from input.
 */
function nextInt ( ) {
  return myconv ( next ( ) , 1 ) ;
}

/**
 * Reads the next input token and splits it into a string array by space.
 * @returns {string[]} An array of strings.
 */
function nextStrArray ( ) {
  return myconv ( next ( ) , 2 ) ;
}

/**
 * Reads the next input token, splits it by space, and converts elements to numbers.
 * @returns {number[]} An array of numbers.
 */
function nextIntArray ( ) {
  return myconv ( next ( ) , 4 ) ;
}

/**
 * Reads the next input token and splits it into a character array.
 * @returns {string[]} An array of characters.
 */
function nextCharArray ( ) {
  return myconv ( next ( ) , 6 ) ;
}


/**
 * Retrieves the next token from the input stream.
 * @returns {string} The next input token.
 */
function next ( ) {
  return obj.next ( ) ;
}

/**
 * Checks if there are more tokens available in the input stream.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasNext ( ) {
  return obj.hasNext ( ) ;
}


/**
 * Initializes an object to manage the input lines.
 * @param {string[]} input - An array of input lines.
 * @returns {object} An object with methods to navigate the input.
 */
function init ( input )
{
  return {
    list  :  input ,
    index :  0     ,
    max   :  input.length ,

    /**
     * Checks if there are more lines to read.
     * @returns {boolean} True if there are more lines, false otherwise.
     */
    hasNext : function ( ) {
      return ( this.index < this.max ) ;
    } ,

    /**
     * Retrieves the next line from the input.
     * Throws an error if no more input is available.
     * @returns {string} The next line of input.
     * @throws {string} 'ArrayIndexOutOfBoundsException' if no more input.
     */
    next : function ( ) {
      if ( this.hasNext ( ) ) {
        return this.list [ this.index++ ] ;
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input' ;
      }
    }
  } ;
}


/**
 * Prints a value to standard output, followed by a newline.
 * @param {any} s - The value to print.
 */
function myout ( s ) {
  console.log ( s ) ;
}

/**
 * Prints a debug message to standard error.
 * Uses `util.inspect` for detailed object output.
 * @param {any} s - The value to print as a debug message.
 */
function myerr ( s ) {
  console.error ( 'debug:' + require ( 'util' ).inspect ( s , false , null ) ) ;
}


/*
 * The 'no' parameter specifies the conversion type for the input 'i'.
 *
 * - Default / Unknown / Outlier: Returns 'i' as is.
 * - 1: Parses 'i' as an integer (parseInt).
 * - 2: Splits 'i' by space into a string array.
 * - 4: Splits 'i' by space and maps elements to numbers.
 * - 6: Splits 'i' into a character array.
 * - 7: Splits 'i' into a character array and maps elements to numbers.
 * - 8: Joins elements of 'i' with a space.
 * - 9: Joins elements of 'i' with a newline.
 * - 0: Joins elements of 'i' with no character (concatenates).
 */
function myconv ( i , no )
{
  try
  {
    switch ( no )
    {
      case 1 :
        return parseInt ( i ) ;

      case 2 :
        return i.split ( ' ' ) ;

      case 4 :
        return i.split ( ' ' ).map ( Number ) ;

      case 6 :
        return i.split ( '' ) ;

      case 7 :
        return i.split ( '' ).map ( Number ) ;

      case 8 :
        return i.join ( ' ' ) ;

      case 9 :
        return i.join ( '\n' ) ;

      case 0 :
        return i.join ( '' ) ;

      default :
        return i ;
    }
  }
  catch ( e )
  {
    return i ;
  }
}

/*
 * End of utility functions.
 * --------------------------------------------------------------------------------
 */

/**
 * The main function containing the problem's logic.
 * This function reads input, performs calculations, and outputs the result.
 */
function Main ( )
{
  // Read an integer N, which represents the number of elements or operations.
  var N = nextInt ( ) ;

  // Initialize an array 'alist' of size N+1 with all elements set to 0.
  // This array will store counts or lengths of sequences.
  var alist = new Array ( N + 1 ).fill ( 0 ) ;

  // Initialize 'output' variable to store the maximum value found.
  var output = 0 ;

  // Loop N times to process N input elements.
  for ( var i = 0 ; i < N ; i++ )
  {
    // Read the next integer 'a' from input.
    var a = nextInt ( ) ;

    // Update 'alist[a]' based on the value at 'alist[a-1]'.
    // This typically signifies finding a sequence of 'a-1' followed by 'a'.
    alist [ a ] = alist [ a - 1 ] + 1 ;

    // Update 'output' to be the maximum of its current value and 'alist[a]'.
    // This tracks the longest sequence found so far.
    output = Math.max ( output , alist [ a ] ) ;
  }

  // Calculate the final result (N minus the maximum sequence length)
  // and print it to standard output.
  myout ( N - output ) ;
}