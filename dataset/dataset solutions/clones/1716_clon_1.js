/*
 * This is a utility section for input/output handling.
 * You can generally ignore the details of this part.
 * --------------------------------------------------------------------------------
 */

var read = require( 'readline' ).createInterface( {
  input  : process.stdin,
  output : process.stdout
} );

var obj; // Object to manage input lines.

var inLine = [ ]; // Array to store all input lines.


// Event listener for each line of input
read.on( 'line', function ( input ) {

  inLine.push( input );

} );


// Event listener for the end of input
read.on( 'close', function ( ) {

  obj = init( inLine ); // Initialize the input object with all lines.

  console.error( "\n" ); // Print a newline to stderr for readability.

  var start = new Date( ); // Record start time for performance measurement.

  Main( ); // Call the main logic function.

  var end = new Date( ) - start; // Calculate execution time.


  // Log execution time to stderr
  myerr( "time : " + ( end ) + "ms" );

  // Log memory usage to stderr
  myerr( "memory : " + Math.round( process.memoryUsage( ).heapTotal / 1024 ) + "KB" );

} );


// --- Input parsing helper functions ---

function nextInt( ) {
  return myconv( next( ), 1 );
}


function nextStrArray( ) {
  return myconv( next( ), 2 );
}


function nextIntArray( ) {
  return myconv( next( ), 4 );
}


function nextCharArray( ) {
  return myconv( next( ), 6 );
}


function next( ) {
  return obj.next( );
}


function hasNext( ) {
  return obj.hasNext( );
}


/**
 * Initializes an object to facilitate reading input lines.
 *
 * @param {Array<string>} input - An array of all input lines.
 * @returns {object} An object with methods to check for next lines and retrieve them.
 */
function init( input ) {

  var returnObj = {
    list  : input,
    index : 0,
    max   : input.length,

    // Checks if there are more lines to read.
    hasNext : function ( ) {
      return ( this.index < this.max );
    },

    // Retrieves the next line of input.
    next : function ( ) {
      if ( !this.hasNext( ) ) {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ"; // Error if no more lines.
      } else {
        var returnInput = this.list[ this.index ];
        this.index++;
        return returnInput;
      }
    }
  };

  return returnObj;

}


// --- Output helper functions ---

/**
 * Prints a message to standard output.
 * @param {*} s - The message to print.
 */
function myout( s ) {
  console.log( s );
}


/**
 * Prints a debug message to standard error.
 * @param {*} s - The message to print.
 */
function myerr( s ) {
  console.error( "debug:" + require( "util" ).inspect( s, false, null ) );
}


/*
 * Helper function for type conversions and array manipulations.
 *
 * [no] parameter description:
 *   - Default/Unknown value: Returns argument as is.
 *   - 1: Convert to integer.
 *   - 2: Split by space into string array.
 *   - 4: Split by space into integer array.
 *   - 6: Split by character into string array.
 *   - 7: Split by character into integer array.
 *   - 8: Join array elements with space.
 *   - 9: Join array elements with newline.
 *   - 0: Join array elements without any separator.
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
    return i; // In case of conversion error, return original input.
  }

}


/*
 * End of utility section.
 * --------------------------------------------------------------------------------
 */


/**
 * The main function where the core logic of the program resides.
 * This function is called after all input has been read.
 */
function Main( ) {

  // Read the number of days, D.
  var D = nextInt( );

  // Read the costs list (clist).
  var clist = nextIntArray( );

  // Initialize an array to store daily outputs.
  var output = new Array( D );

  // Keep track of the last day each contest type was held.
  // Assuming 26 contest types (0-25).
  var lastContest = new Array( 26 ).fill( 0 );


  // Loop through each day from 1 to D.
  for ( var i = 1; i <= D; i++ ) {

    // Read the satisfaction list for the current day.
    var list = nextIntArray( );

    var max = -1; // Initialize max satisfaction for the day.
    var maxIndex = -1; // Initialize index of contest with max satisfaction.


    // Find the contest type with the maximum satisfaction for the current day.
    for ( var j = 0; j < list.length; j++ ) {
      if ( max < list[ j ] ) {
        max = list[ j ];
        maxIndex = j;
      }
    }

    // Update the last day this contest type was held.
    lastContest[ maxIndex ] = i;


    // Adjust 'max' satisfaction based on costs for all contest types.
    // The cost increases for each day a contest type hasn't been held.
    for ( var j = 0; j < 26; j++ ) {
      max -= clist[ j ] * ( i - lastContest[ j ] );
    }


    // Calculate the cumulative satisfaction.
    if ( i == 1 ) {
      output[ i - 1 ] = max; // For the first day, it's just the day's max.
    } else {
      // For subsequent days, add to the previous day's cumulative satisfaction.
      output[ i - 1 ] = max + output[ i - 2 ];
    }

    myerr( max ); // Debugging output for the current day's adjusted satisfaction.

    // The following lines are commented out in the original, so they remain commented.
    // output[i - 1] = maxIndex + 1;
    // output[i] = Math.ceil(Math.random() * 26);

  }

  // Output the final cumulative satisfactions, joined by newlines.
  myout( myconv( output, 9 ) );

}