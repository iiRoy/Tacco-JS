/*
 * This section contains setup code and utility functions.
 * It's generally not the main focus of the algorithm.
 */
var read = require(   'readline' ).createInterface(
  {
    input  : process.stdin,
    output : process.stdout
  }
);

// Global variable to hold the input utility object
  var obj;
  var inLine = [ ]; // Array to store all input lines

read.on( 'line',  function( input )
{
  inLine.push( input ); // Add each line to the inLine array
} );

read.on( 'close', function ( )
{
  obj = init( inLine ); // Initialize the input object from collected lines

  console.error( "\n" ); // Print a blank line to stderr for visual separation

  var start = new Date( ); // Record start time for performance measurement

  Main( ); // Execute the main logic of the program

  var end = new Date( ) - start; // Calculate elapsed time

  myerr( "time : " + ( end ) + "ms" ); // Log execution time to stderr

  myerr( "memory : " + Math.round( process.memoryUsage( ).heapTotal / 1024 ) + "KB" ); // Log memory usage
} );

function makeClone( obj )
{
  // A utility function to create a deep clone of a JSON-serializable object.
  // This method is generally used for simple objects without functions or complex types.
  return JSON.parse( JSON.stringify( obj ) );
}

function nextInt ( )
{
  // Retrieves the next input token and converts it to an integer.
  return myconv( next( ), 1 );
}

function nextStrArray ( )
{
  // Retrieves the next input token and splits it into a string array.
  return myconv( next( ), 2 );
}

function nextIntArray ( )
{
  // Retrieves the next input token, splits it, and converts elements to numbers.
  return myconv( next( ), 4 );
}

function nextCharArray ( )
{
  // Retrieves the next input token and splits it into a character array.
  return myconv( next( ), 6 );
}

function next ( )
{
  // Delegates to the input object's next method to get the next input line.
  return obj.next( );
}

function hasNext ( )
{
  // Delegates to the input object's hasNext method to check for more input.
  return obj.hasNext( );
}

function init ( input )
{
  // Initializes an object for managing input lines.
  var returnObj =
  {
    list  : input,            // The array of all input lines
    index : 0,                // Current index in the input array
    max   : input.length,     // Total number of input lines

    hasNext : function ( )
    {
      // Checks if there are more lines to read.
      return ( this.index < this.max );
    },

    next : function ( )
    {
      // Retrieves the next input line.
      if ( !this.hasNext( ) )
      {
        // If no more input, throw an error.
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      }
      else
      {
        var returnInput = this.list[ this.index ]; // Get the current line
        this.index++;                              // Advance the index
        return returnInput;                        // Return the line
      }
    }
  };
  return returnObj; // Return the initialized input manager object
}

function myout ( s )
{
  // Standard output function. Prints to console.log.
  console.log( s );
}

function myerr ( s )
{
  // Error output function for debugging. Prints to console.error.
  console.error( "debug:" + require( "util" ).inspect( s, false, null ) );
}

/*
 *   myconv function: A versatile utility for type conversion and string manipulation.
 *   Parameter 'i': The input value to be processed (can be string or array).
 *   Parameter 'no': A numeric code specifying the desired operation.
 *
 *   Operation Codes:
 *   - 1: Convert input 'i' to an integer.
 *   - 2: Split input string 'i' by space into an array of strings.
 *   - 4: Split input string 'i' by space and convert each part to a number, returning an array of numbers.
 *   - 6: Split input string 'i' into an array of individual characters.
 *   - 7: Split input string 'i' into individual characters and convert each to a number, returning an array of numbers.
 *   - 8: Join elements of array 'i' with a space.
 *   - 9: Join elements of array 'i' with a newline character.
 *   - 0: Join elements of array 'i' without any separator.
 *   - Default: If 'no' is unrecognized or an error occurs, return 'i' unchanged.
 */
function myconv( i, no )
{
  try
  {
    switch ( no )
    {
      case 1:
        return parseInt( i ); // Convert to integer
      case 2:
        return i.split( " " ); // Split by space
      case 4:
        return i.split( " " ).map( Number ); // Split by space, map to Number
      case 6:
        return i.split( "" ); // Split into characters
      case 7:
        return i.split( "" ).map( Number ); // Split into characters, map to Number
      case 8:
        return i.join( " " ); // Join with space
      case 9:
        return i.join( "\n" ); // Join with newline
      case 0:
        return i.join( "" ); // Join without separator
      default:
        return i; // Return input as is for unknown 'no'
    }
  }
  catch ( e )
  {
    return i; // In case of any error during conversion, return original input
  }
}

/*
 * End of utility functions.
 * The core problem-solving logic starts below this point.
 */
function Main ( )
{
  // Entry point for the primary algorithm.
  var N = nextInt( ); // Read the integer N from input. This determines the size of the output.

  var output = new Array( N ); // Initialize an array to store results, sized N.

  var map = { }; // Create an empty object (hash map) to store frequencies of calculated values.

  // First set of nested loops to calculate and count frequencies.
  // Iterates through i, j, k from 1 to 200.
  for ( var i = 1; i <= 200; i++ )
  {
    for ( var j = 1; j <= 200; j++ )
    {
      for ( var k = 1; k <= 200; k++ )
      {
        // Calculate the specific sum based on i, j, k.
        var add = i * i + j * j + k * k + i * j + j * k + k * i;

        // Check if the calculated 'add' value exists as a key in the map.
        if ( map[ add ] == null )
        {
          map[ add ] = 0; // If not, initialize its count to 0.
        }
        map[ add ]++; // Increment the count for this 'add' value.
      }
    }
  }

  // Second loop to populate the output array based on the calculated frequencies.
  // Iterates from 0 to N-1.
  for ( var i = 0; i < N; i++ )
  {
    // Check the frequency of (i + 1) in the map.
    if ( map[ i + 1 ] == null )
    {
      output[ i ] = 0; // If not found, frequency is 0.
    }
    else
    {
      output[ i ] = map[ i + 1 ]; // Otherwise, assign the stored frequency.
    }
  }

  // Output the final results, joining the elements of the output array with newlines.
  myout( myconv( output, 9 ) );
}