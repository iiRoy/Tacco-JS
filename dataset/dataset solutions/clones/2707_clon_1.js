/*
 * This file contains a solution to a programming problem.
 * The utility functions are provided for input/output handling and basic operations.
 * Please disregard the initial and final comments as they are for internal use.
 */
var read = require('readline') .createInterface(
  {
    input:  process.stdin,
    output: process.stdout
  }
);

// Declare global variables to be used throughout the script.
var obj;         // Holds the input object for `next()` and `hasNext()` functions.
var inLine = []; // An array to store all lines read from standard input.

// Event listener for each line of input received.
read .on( 'line', function (input) {
  inLine .push( input );
} );

// Event listener for when the input stream is closed.
read .on( 'close', function () {
  obj = init( inLine ); // Initialize the input object with all collected lines.

  console .error( "\n" ); // Print a newline to stderr for visual separation.

  var start = Date .now(); // Record the starting time for performance measurement.

  Main(); // Execute the main logic of the program.

  var end = Date .now() - start; // Calculate the elapsed time.

  // Report execution time and memory usage to stderr.
  myerr( "time : " + (end) + "ms" );
  myerr( "memory : " + Math .round( process .memoryUsage() .heapTotal / 1024 ) + "KB" );
} );


/*
 * Creates a deep copy of an object using JSON serialization and deserialization.
 * This method works for objects that are serializable to JSON (no functions, undefined, etc.).
 * @param {object} obj - The object to clone.
 * @returns {object} A new object that is a deep clone of the input object.
 */
function makeClone( obj )
{
  return JSON .parse( JSON .stringify( obj ) );
}


/**
 * Retrieves the next input token and converts it to an integer.
 * @returns {number} The next input token as an integer.
 */
function nextInt()
{
  return myconv( next(), 1 );
}


/**
 * Retrieves the next input token and splits it into a string array by spaces.
 * @returns {string[]} The next input token as an array of strings.
 */
function nextStrArray()
{
  return myconv( next(), 2 );
}


/**
 * Retrieves the next input token, splits it by spaces, and converts to a number array.
 * @returns {number[]} The next input token as an array of numbers.
 */
function nextIntArray()
{
  return myconv( next(), 4 );
}


/**
 * Retrieves the next input token and splits it into a character array.
 * @returns {string[]} The next input token as an array of characters.
 */
function nextCharArray()
{
  return myconv( next(), 6 );
}


/**
 * Retrieves the next input token from the global input object.
 * @returns {string} The next input line/token.
 */
function next()
{
  return obj .next();
}


/**
 * Checks if there are more input tokens available.
 * @returns {boolean} True if more tokens are available, false otherwise.
 */
function hasNext()
{
  return obj .hasNext();
}


/**
 * Initializes the input object with the provided array of input lines.
 * This object provides methods to check for next input and retrieve it.
 * @param {string[]} input - An array of strings, each representing a line of input.
 * @returns {object} An object with `list`, `index`, `max`, `hasNext`, and `next` properties.
 */
function init( input )
{
  var returnObj = {
    list : input,
    index : 0,
    max : input .length,

    // Checks if there are more lines to read.
    hasNext : function () {
      return ( this .index < this .max );
    },

    // Retrieves the next line from the input list.
    next : function () {
      if ( !this .hasNext() ) {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ"; // Error if no more input.
      } else {
        var returnInput = this .list[ this .index ]; // Get current line.
        this .index++;                               // Advance index.
        return returnInput;                          // Return the line.
      }
    }
  };

  return returnObj;
}


/**
 * Prints a string to the standard output, followed by a newline.
 * @param {any} s - The value to print.
 */
function myout( s )
{
  console .log( s );
}


/**
 * Prints debug information to the standard error stream.
 * Uses `util.inspect` for detailed object inspection.
 * @param {any} s - The value to inspect and print.
 */
function myerr( s )
{
  console .error( "debug:" + require("util") .inspect( s, false, null ) );
}


/*
 * Utility function for converting and manipulating input values based on `no` parameter.
 *
 * `no` parameter explanation:
 *   - Default/Unknown value/Error: Returns the input `i` as is.
 *   - 1: Converts `i` to an integer.
 *   - 2: Splits `i` by half-width spaces into a string array.
 *   - 4: Splits `i` by half-width spaces and converts each part to a number array.
 *   - 6: Splits `i` into a character array.
 *   - 7: Splits `i` into a character array and converts each character to a number.
 *   - 8: Joins array `i` with half-width spaces.
 *   - 9: Joins array `i` with newlines.
 *   - 0: Joins array `i` without any separator.
 */
function myconv( i, no )
{
  try
  {
    switch ( no )
    {
      case 1:
        return parseInt( i );
      case 2:
        return i .split( " " );
      case 4:
        return i .split( " " ) .map( Number );
      case 6:
        return i .split( "" );
      case 7:
        return i .split( "" ) .map( Number );
      case 8:
        return i .join( " " );
      case 9:
        return i .join( "\n" );
      case 0:
        return i .join( "" );
      default:
        return i;
    }
  }
  catch ( e )
  {
    return i;
  }
}

/*
 * End of utility functions section.
 * The core logic of the program starts below.
 */

function Main()
{
	var s = next(); /* Read the input string. */

	var len = s.length; /* Get the length of the input string. */

	var max = 100005; /* Define a maximum size for the DP array. */

	var dp = new Array( max ); /* Initialize the DP table. */

	/* Fill the DP table with arrays, each initialized to zeros. */
	for ( var i = 0; i < max; i++ )
	{
		dp[ i ] = new Array( 13 ) .fill( 0 );
	}

	/* Base case: an empty prefix has one way to result in a remainder of 0. */
	dp[ 0 ][ 0 ] = 1;

	var mod = 1000000007; /* Define the modulo for calculations. */

	/* Iterate through each character of the input string. */
	for ( var i = 0; i < len; i++ )
	{
		/* Iterate through all possible remainders modulo 13. */
		for ( var j = 0; j < 13; j++ )
		{
			var tmp = s[ i ]; /* Get the current character. */

			/* If the character is a '?'. */
			if ( tmp == "?" )
			{
				/* Try all possible digits (0-9) for '?'. */
				for ( var k = 0; k < 10; k++ )
				{
					/* Update DP table: add ways from previous state with new digit. */
					dp[ i + 1 ][ ( j * 10 + k ) % 13 ] += dp[ i ][ j ];
					/* Apply modulo to prevent overflow. */
					dp[ i + 1 ][ ( j * 10 + k ) % 13 ] %= mod;
				}
			}
			/* If the character is a specific digit. */
			else
			{
				var k = myconv( s[ i ], 1 ); /* Convert the character digit to a number. */
				/* Update DP table: add ways from previous state with the fixed digit. */
				dp[ i + 1 ][ ( j * 10 + k ) % 13 ] += dp[ i ][ j ];
				/* Apply modulo to prevent overflow. */
				dp[ i + 1 ][ ( j * 10 + k ) % 13 ] %= mod;
			}
		}
	}
	/* Output the number of ways for the full string to have a remainder of 5. */
	myout( dp[ len ][ 5 ] );
}