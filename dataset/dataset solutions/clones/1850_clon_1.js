/*
 * This file contains utility functions for competitive programming
 * to handle input/output and common data transformations.
 */

// Initialize the readline interface for standard input/output operations.
var read = require('readline').createInterface(
  {
    input  : process.stdin,  // Set standard input as the source.
    output : process.stdout  // Set standard output as the destination.
  }
);

// Declare a variable to hold the initialized input object.
var obj;

// An array to store all lines read from input.
var inLine = [];

// Event listener for each line read from stdin.
read.on(
  'line',
  function( input )
  {
    inLine.push( input ); // Add the current line to the input buffer.
  }
);

// Event listener for when the input stream closes.
read.on(
  'close',
  function()
  {
    // Initialize the input processing object with all collected lines.
    obj = init( inLine );

    // Log the start of the main execution block to stderr.
    myerr( "-----start-----" );

    // Record the starting time for performance measurement.
    var start = new Date();

    // Execute the main logic of the program.
    Main();

    // Calculate the elapsed time.
    var end = new Date() - start;

    // Log the end of the main execution block.
    myerr( "----- end -----" );
    // Log the total execution time.
    myerr( "time : " + ( end ) + "ms" );
  }
);


// Helper function to read the next integer from input.
function nextInt()
{
  return myconv( next(), 1 );
}

// Helper function to read the next line as a string array (space-separated).
function nextStrArray()
{
  return myconv( next(), 2 );
}

// Helper function to read the next line as an integer array (space-separated).
function nextIntArray()
{
  return myconv( next(), 4 );
}

// Helper function to read the next line as a character array.
function nextCharArray()
{
  return myconv( next(), 6 );
}

// Retrieves the next item from the input object.
function next()
{
  return obj.next();
}

// Checks if there are more items to read from input.
function hasNext()
{
  return obj.hasNext();
}


/*
 * Initializes an object for sequential access to input lines.
 * @param {Array<string>} input - An array of strings, each representing a line of input.
 * @returns {object} An object with methods to access input lines.
 */
function init( input )
{
  var returnObj = {
    list    : input,            // The array of input lines.
    index   : 0,                // Current index for reading.
    max     : input.length,     // Total number of input lines.

    // Method to check if there are more lines to read.
    hasNext : function()
    {
      return ( this.index < this.max );
    },

    // Method to get the next line of input.
    next    : function()
    {
      if ( !this.hasNext() )
      {
        // Throw an error if no more input is available.
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      }
      else
      {
        var returnInput = this.list[ this.index ]; // Get the current line.
        this.index++;                              // Advance the index.
        return returnInput;                        // Return the line.
      }
    }
  };
  return returnObj;
}


// Function to output a string to standard output.
function myout( s )
{
  console.log( s );
}

// Function to output debug information to standard error.
function myerr( s )
{
  console.error( "debug:" + require( "util" ).inspect( s, false, null ) );
}


/**
 * Converts or processes input based on the specified operation number.
 *
 * @param {*} i - The input value to be processed.
 * @param {number} no - The operation number.
 *   - 1: Convert to integer.
 *   - 2: Split by space into a string array.
 *   - 4: Split by space and convert to a number array.
 *   - 6: Split into a character array.
 *   - 7: Split into a character array and convert to a number array.
 *   - 8: Join array elements with space.
 *   - 9: Join array elements with newline.
 *   - 0: Join array elements without any separator.
 *   - default: Return input as is.
 * @returns {*} The processed value.
 */
function myconv( i, no )
{
  try
  {
    switch ( no )
    {
      case 1:
        return parseInt( i ); // Parse as an integer.
      case 2:
        return i.split( " " ); // Split by space.
      case 4:
        return i.split( " " ).map( Number ); // Split by space and map to Number.
      case 6:
        return i.split( "" ); // Split into individual characters.
      case 7:
        return i.split( "" ).map( Number ); // Split into individual characters and map to Number.
      case 8:
        return i.join( " " ); // Join array elements with a space.
      case 9:
        return i.join( "\n" ); // Join array elements with a newline.
      case 0:
        return i.join( "" ); // Join array elements without a separator.
      default:
        return i; // Return input as is for unknown operations.
    }
  }
  catch ( e )
  {
    // In case of an error during conversion, return the original input.
    return i;
  }
}


// Main function where the program's primary logic resides.
function Main()
{
  // Read an integer K from input.
  var K = nextInt();

  // Read the next string from input.
  var s = next();

  // Check if the string length is less than or equal to K.
  if ( s.length <= K )
  {
    myout( s ); // If so, print the entire string.
  }
  else
  {
    // Otherwise, print the first 7 characters followed by "...".
    myout( s.slice( 0, 7 ) + "..." );
  }
}