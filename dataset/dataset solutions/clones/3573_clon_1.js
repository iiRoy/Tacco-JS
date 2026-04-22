/*
 * This file contains utility functions for competitive programming
 * and the main solution logic.
 *
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered significantly
 * to generate a Type I clone.
 */
var read = require('readline').createInterface(
 {
    input : process.stdin,
    output: process.stdout
 }
) ;
var obj ; // Object to manage input processing
var inLine = [ ] ; // Array to store all input lines

/*
 * Event handler for each line read from stdin.
 * Pushes the input line into the 'inLine' array.
 */
read.on('line' , function ( input ) {
 inLine.push(input) ;
} ) ;

/*
 * Event handler for the 'close' event, indicating end of input.
 * Initializes the input object, measures execution time, and calls the main logic.
 */
read.on( 'close' , function ( ) {
  // Initialize the input object with all collected lines.
  obj = init( inLine ) ;

  // Log start of execution to error stream.
  myerr( "-----start-----" ) ;

  // Record start time for performance measurement.
  var start = new Date( ) ;

  // Execute the main program logic.
  Main( ) ;

  // Calculate elapsed time.
  var end = new Date( ) - start ;

  // Log end of execution to error stream.
  myerr( "----- end -----" ) ;
  myerr( "time : " + ( end ) + "ms" ) ; // Log execution time.
  myerr( "memory : " + Math.round( process.memoryUsage( ).heapTotal / 1024 ) + "KB" ) ; // Log memory usage.
} ) ;

// --- Input Parsing Helper Functions ---

/**
 * Reads the next token as an integer.
 * @returns {number} The parsed integer.
 */
function nextInt( ) { return myconv( next( ) , 1 ) ; }

/**
 * Reads the next token and splits it into a string array by space.
 * @returns {string[]} An array of strings.
 */
function nextStrArray( ) { return myconv( next( ) , 2 ) ; }

/**
 * Reads the next token, splits it by space, and converts elements to numbers.
 * @returns {number[]} An array of numbers.
 */
function nextIntArray( ) { return myconv( next( ) , 4 ) ; }

/**
 * Reads the next token and splits it into a character array.
 * @returns {string[]} An array of characters.
 */
function nextCharArray( ) { return myconv( next( ) , 6 ) ; }

/**
 * Retrieves the next raw input line/token.
 * @returns {string} The next input string.
 */
function next( ) { return obj.next( ) ; }

/**
 * Checks if there are more input tokens available.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasNext( ) { return obj.hasNext( ) ; }


/**
 * Initializes the input processing object.
 * This object provides methods to read input lines sequentially.
 * @param {string[]} input - An array of all input lines.
 * @returns {object} An object with list, index, max, hasNext, and next properties.
 */
function init( input )
{
  /*
   * The return object manages the input lines.
   * 'list' holds all input lines.
   * 'index' tracks the current line being processed.
   * 'max' stores the total number of input lines.
   */
  var returnObj = {
    list : input , // All input lines
    index : 0 ,    // Current reading index
    max : input.length , // Total number of lines

    // Method to check if there are more lines to read.
    hasNext : function ( ) {
      return ( this.index < this.max ) ;
    } ,

    // Method to get the next input line.
    next : function ( ) {
      // If no more input, throw an error.
      if ( ! this.hasNext( ) )
      {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ" ;
      }
      else
      {
        // Get the current line, then increment the index.
        var returnInput = this.list[ this.index ] ;
        this.index ++ ;
        return returnInput ;
      }
    }
  } ;
  return returnObj ;
}

// --- Output and Debugging Helper Functions ---

/**
 * Prints a value to standard output.
 * @param {*} s - The value to print.
 */
function myout( s ) {
  console.log( s ) ;
}

/**
 * Prints a debug message to standard error.
 * Uses util.inspect for detailed object logging.
 * @param {*} s - The value to debug.
 */
function myerr( s ) {
  console.error( "debug:" + require( "util" ).inspect( s , false , null ) ) ;
}


/*
 * This function provides various conversion utilities for input data.
 * The 'no' parameter determines the type of conversion.
 *
 * Conversion Modes:
 *   - 1: Convert to integer.
 *   - 2: Split string by space into a string array.
 *   - 4: Split string by space and convert elements to numbers.
 *   - 6: Split string into a character array.
 *   - 7: Split string into a character array and convert to numbers (e.g., "123" -> [1, 2, 3]).
 *   - 8: Join array elements with a space.
 *   - 9: Join array elements with a newline.
 *   - 0: Join array elements without any separator.
 *   - Default: Return input as is (or if an error occurs during conversion).
 */
function myconv( i , no ) {
  try {
    switch ( no ) {
      case 1 : return parseInt( i ) ;
      case 2 : return i.split( " " ) ;
      case 4 : return i.split( " " ).map( Number ) ;
      case 6 : return i.split( "" ) ;
      case 7 : return i.split( "" ).map( Number ) ;
      case 8 : return i.join( " " ) ;
      case 9 : return i.join( "\n" ) ;
      case 0 : return i.join( "" ) ;
      default : return i ;
    }
  }
  catch ( e ) {
    // In case of any conversion error, return the original input.
    return i ;
  }
}

/*
 * --- Main Logic Section ---
 * This section contains the primary algorithm for the problem.
 */
function Main( ) {
	// Read the first line of input, which contains two integers N and K.
	var one = nextIntArray( ) ;

	// Assign the first integer to N.
	var N = one[ 0 ] ;

	// Assign the second integer to K.
	var K = one[ 1 ] ;

	// Initialize the output variable to zero.
	var output = 0 ;

	/*
	 * Special case: If K is 1, the answer is simply N cubed.
	 * This is because every number from 1 to N is divisible by 1.
	 * So for each of the three choices, there are N options.
	 */
	if ( K == 1 ) {
		myout( Math.pow( N , 3 ) ) ; // Output N^3.
		return ; // Exit the function early.
	}

	// Initialize a counter for generating multiples.
	var count = 1 ;

	// Arrays to store numbers divisible by K (or K/2).
	var even = [ ] ;
	var odd = [ ] ;

	// Check if K is an even number.
	if ( K % 2 == 0 ) {
		// If K is even, populate the 'even' array with multiples of K up to N.
		while ( K * count <= N ) {
			even.push( K * count ) ;
			count ++ ;
		}
		// Reset count for the next loop.
		var count = 0 ;
		// Populate the 'odd' array with multiples of K/2 that are not multiples of K.
		// These are numbers of the form (K/2) + K*count up to N.
		while ( ( K / 2 ) + K * count <= N ) {
			odd.push( ( K / 2 ) + K * count ) ;
			count ++ ;
		}
	}
	else {
		// If K is odd, all relevant numbers are multiples of K.
		// Populate the 'odd' array with multiples of K up to N.
		while ( K * count <= N ) {
			odd.push( K * count ) ;
			count ++ ;
		}
	}

	// Iterate from 1 to N to calculate the total count.
	for ( var i = 1 ; i <= N ; i ++ ) {
		// Check the divisibility condition for K.
		if ( K % 2 == 0 ) {
			// If K is even:
			// If 'i' is a multiple of K, it contributes (even.length)^2 to the output.
			if ( i % K == 0 ) {
				output += even.length * even.length ;
			}
			// If 'i' is a multiple of K/2 but not K, it contributes (odd.length)^2 to the output.
			else if ( i % ( K / 2 ) == 0 ) {
				output += odd.length * odd.length ;
			}
		}
		else {
			// If K is odd:
			// If 'i' is a multiple of K, it contributes (odd.length)^2 to the output.
			if ( i % K == 0 ) {
				output += odd.length * odd.length ;
			}
		}

	}
	// Output the final calculated result.
	myout( output ) ;
}