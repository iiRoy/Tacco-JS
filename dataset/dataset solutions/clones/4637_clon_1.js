/*
 * This section contains utility functions for input/output and common operations.
 * It's generally boilerplate code for competitive programming environments.
 * Feel free to skip this part if you are only interested in the main algorithm.
 * -----------------------------------------------------------------------------
 */

// Initialize readline interface for standard input/output operations.
var read = require( 'readline' ).createInterface(
  {
    input  :  process.stdin ,   // Standard input stream.
    output :  process.stdout    // Standard output stream.
  }
);

// Global object to manage input lines.
var obj;

// Array to store all input lines read from stdin.
var inLine = [ ] ;

// Event listener for each line of input received.
read.on( 'line', function ( input ) {
  inLine.push( input ) ;
} );

// Event listener for when the input stream is closed.
read.on( 'close', function ( ) {
  // Initialize the input object with all collected lines.
  obj = init( inLine ) ;

  // Output a newline to stderr for visual separation.
  console.error( "\n" ) ;

  // Record the start time for performance measurement.
  var start = new Date( ) ;

  // Execute the main logic of the program.
  Main( ) ;

  // Calculate the elapsed time.
  var end = new Date( ) - start ;


  // Report execution time.
  myerr( "time : " + ( end ) + "ms" ) ;
  // Report memory usage.
  myerr( "memory : " + Math.round( process.memoryUsage( ).heapTotal / 1024 ) + "KB" ) ;
} ) ;

/**
 * Creates a deep clone of an object using JSON serialization.
 * @param {object} obj - The object to clone.
 * @returns {object} A deep copy of the input object.
 */
function makeClone ( obj ) {
  return JSON.parse( JSON.stringify( obj ) ) ;
}

// Retrieves the next integer from the input.
function nextInt ( ) {
  return myconv( next( ) , 1 ) ;
}

// Retrieves the next line as a string array (split by space).
function nextStrArray ( ) {
  return myconv( next( ) , 2 ) ;
}

// Retrieves the next line as an integer array (split by space).
function nextIntArray ( ) {
  return myconv( next( ) , 4 ) ;
}

// Retrieves the next line as a character array.
function nextCharArray ( ) {
  return myconv( next( ) , 6 ) ;
}

// Gets the next raw input line.
function next ( ) {
  return obj.next( ) ;
}

// Checks if there are more input lines available.
function hasNext ( ) {
  return obj.hasNext( ) ;
}

/**
 * Initializes the input management object.
 * @param {Array<string>} input - An array of all input lines.
 * @returns {object} An object with methods to access input lines sequentially.
 */
function init ( input ) {

  var returnObj = {
    list : input ,                 // Stores all input lines.
    index : 0 ,                    // Current position in the input list.
    max : input.length ,           // Total number of input lines.

    /**
     * Checks if there are more lines to read.
     * @returns {boolean} True if more lines exist, false otherwise.
     */
    hasNext : function ( ) {
      return ( this.index < this.max ) ;
    } ,

    /**
     * Retrieves the next line of input.
     * Throws an error if no more lines are available.
     * @returns {string} The next input line.
     */
    next : function ( ) {
      if ( ! this.hasNext( ) ) {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ" ;
      } else {
        var returnInput = this.list[ this.index ] ;
        this.index ++ ;
        return returnInput ;
      }
    }
  } ;
  return returnObj ;
}

// Outputs a string to the standard output.
function myout ( s ) {
  console.log( s ) ;
}

// Outputs debug information to the standard error stream.
function myerr ( s ) {
  console.error( "debug:" + require( "util" ).inspect( s , false , null ) ) ;
}

/*
 * myconv function: Handles various conversions for input data.
 *
 * [no] parameter specifies the conversion type:
 * Default/Unknown/Error: Returns the input 'i' as is.
 * 1: Converts input 'i' to an integer (parseInt).
 * 2: Splits input 'i' by space into a string array.
 * 4: Splits input 'i' by space and maps elements to numbers (integer array).
 * 6: Splits input 'i' by character into a character array.
 * 7: Splits input 'i' by character and maps elements to numbers (number array).
 * 8: Joins array 'i' with a space delimiter.
 * 9: Joins array 'i' with a newline delimiter.
 * 0: Joins array 'i' with no delimiter.
 */
function myconv( i , no ) {
  try {
    switch ( no ) {
      case 1 :
        return parseInt( i ) ;
      case 2 :
        return i.split( " " ) ;
      case 4 :
        return i.split( " " ).map( Number ) ;
      case 6 :
        return i.split( "" ) ;
      case 7 :
        return i.split( "" ).map( Number ) ;
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
    // In case of any conversion error, return the original input.
    return i ;
  }
}

/*
 * -----------------------------------------------------------------------------
 * End of boilerplate utility functions.
 * The core logic of the program starts below this line.
 * -----------------------------------------------------------------------------
 */

function Main ( ) {
    // Read the first line, which contains N and K.
    var one = nextIntArray ( ) ;

    // N: total number of items.
    var N = one[ 0 ] ;
    // K: number of items to select.
    var K = one[ 1 ] ;

    // Read the list of items.
    var list = nextIntArray ( ) ;

    // Initialize output with a very large number (effectively infinity).
    var output = Math.pow( 10 , 16 ) ;

    // Special case: if K is 1, no operations are needed, cost is 0.
    if ( K == 1 ) {
        myout( 0 ) ;
        return ;
    }

    // Iterate through all possible combinations of selecting N items.
    // (1 << N) generates 2^N, representing all subsets.
    for ( var i = 0 ; i < ( 1 << N ) ; i ++ ) {
        // 'selected' array will hold the chosen K elements.
        // The first element 'list[0]' is always included as per problem constraints.
        var selected = [ list[ 0 ] ] ;

        // Iterate from the second element to N-1 to check for selection.
        for ( var j = 1 ; j < N ; j ++ ) {
            // Check if the j-th bit is set in 'i'.
            // If it is, then the j-th element from 'list' is selected.
            if ( ( i & ( 1 << j ) ) != 0 ) {
                selected.push( list[ j ] ) ;
            }
        }

        // If the number of selected elements equals K.
        if ( selected.length == K ) {
            var sum = 0 ; // Initialize sum for this combination.

            // Iterate through the selected elements to calculate the cost.
            // The goal is to make selected[j] < selected[j+1] for all j.
            for ( var j = 0 ; j < selected.length - 1 ; j ++ ) {
                // If the current element is greater than or equal to the next element.
                if ( selected[ j ] >= selected[ j + 1 ] ) {
                    // Calculate the amount needed to increment selected[j+1]
                    // to be exactly 1 greater than selected[j].
                    var incrementAmount = selected[ j ] - selected[ j + 1 ] + 1 ;
                    sum += incrementAmount ; // Add to total sum.
                    selected[ j + 1 ] += incrementAmount ; // Update selected[j+1].
                }
            }
            // Update the minimum output found so far.
            output = Math.min( output , sum ) ;
        }
    }
    // Output the final minimum cost.
    myout( output ) ;
}