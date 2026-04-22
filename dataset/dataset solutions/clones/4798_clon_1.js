/*
 * This file contains a JavaScript program.
 * It includes utility functions for input processing and a main logic function.
 * Please note that this is a Type I clone, meaning only whitespace and comments
 * have been altered from an original source. The functional behavior remains identical.
 */

//  -----------------------------------------------------------------------------
//  Input/Output Utility Section - Not part of the core algorithm logic.
//  -----------------------------------------------------------------------------

var read = require ( 'readline' ) . createInterface ( {
  input :   process . stdin ,
  output :  process . stdout
} ) ;

var obj ;
var inLine = [ ] ;

// This event listener captures each line of input received.
read . on ( 'line' , function ( input ) {
  inLine . push ( input ) ;
} ) ;

// This event listener is triggered when all input has been received.
read . on ( 'close' , function ( ) {

  /*
   * Initialize the global 'obj' with the processed input lines.
   * This 'obj' will be used by 'next()' and 'hasNext()' functions.
   */
  obj = init ( inLine ) ;

  // Output a newline to stderr for visual separation before error messages.
  console . error ( '\n' ) ;

  // Record the start time for performance measurement.
  var start = Date . now ( ) ;

  // Execute the primary application logic.
  Main ( ) ;

  // Calculate the elapsed time.
  var end = Date . now ( ) - start ;

  // Log execution time to stderr.
  myerr ( 'time : ' + end + 'ms' ) ;

  // Log memory usage to stderr.
  myerr ( 'memory : ' + Math . round ( process . memoryUsage ( ) . heapTotal / 1024 ) + 'KB' ) ;
} ) ;

/**
 * Creates a deep clone of an object. Handles Sets specifically, otherwise uses JSON serialization.
 * @param {any} obj - The object to clone.
 * @returns {any} A deep clone of the input object.
 */
function makeClone ( obj ) {
  return ( obj instanceof Set )
           ? new Set ( Array . from ( obj ) )
           : JSON . parse ( JSON . stringify ( obj ) ) ;
}

// Helper functions for reading various data types from input.
function nextInt ( ) {
  return myconv ( next ( ) , 1 ) ;
}

function nextStrArray ( ) {
  return myconv ( next ( ) , 2 ) ;
}

function nextIntArray ( ) {
  return myconv ( next ( ) , 4 ) ;
}

function nextCharArray ( ) {
  return myconv ( next ( ) , 6 ) ;
}

// Retrieves the next item from the input object.
function next ( ) {
  return obj . next ( ) ;
}

// Checks if there are more items to read from the input.
function hasNext ( ) {
  return obj . hasNext ( ) ;
}


/**
 * Initializes an input handler object.
 * @param {Array<string>} input - An array of strings representing the input lines.
 * @returns {object} An object with methods to manage input reading.
 */
function init ( input ) {
  return {
    list : input ,
    index : 0 ,
    max : input . length ,
    hasNext : function ( ) {
      return ( this . index < this . max ) ;
    } ,
    next : function ( ) {
      if ( this . hasNext ( ) ) {
        return this . list [ this . index ++ ] ;
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input' ;
      }
    }
  } ;
}

// Outputs a string to standard output, followed by a newline.
function myout ( s ) {
  console . log ( s ) ;
}

// Outputs a debug message to standard error, formatted.
function myerr ( s ) {
  console . error ( 'debug:' + require ( 'util' ) . inspect ( s , false , null ) ) ;
}

/*
 * This function performs various conversions on input data based on the 'no' parameter.
 * It's a versatile utility for parsing and formatting.
 *
 * `no` parameter guide:
 *   - 1: Parse integer.
 *   - 2: Split string by space into an array of strings.
 *   - 4: Split string by space and map to numbers (parseInt).
 *   - 6: Split string into an array of characters.
 *   - 7: Split string into array of characters and map to numbers.
 *   - 8: Join array elements with spaces.
 *   - 9: Join array elements with newlines.
 *   - 0: Join array elements with no separator.
 *   - Default/Unknown: Return input as is.
 */
function myconv ( i , no ) {
  try {
    switch ( no ) {
      case 1 :
        return parseInt ( i ) ;
      case 2 :
        return i . split ( ' ' ) ;
      case 4 :
        return i . split ( ' ' ) . map ( Number ) ;
      case 6 :
        return i . split ( '' ) ;
      case 7 :
        return i . split ( '' ) . map ( Number ) ;
      case 8 :
        return i . join ( ' ' ) ;
      case 9 :
        return i . join ( '\n' ) ;
      case 0 :
        return i . join ( '' ) ;
      default :
        return i ;
    }
  } catch ( e ) {
    return i ; // In case of error, return original input.
  }
}

//  -----------------------------------------------------------------------------
//  Main Application Logic Section.
//  -----------------------------------------------------------------------------

function Main ( ) {

  // Read the integer N, which defines the grid size.
  var N = nextInt ( ) ;

  // Read a list of integers from input.
  var list = nextIntArray ( ) ;

  // Initialize an output array of size N * N, filled with 'null' implicitly.
  var output = new Array ( N * N ) ;

  // First pass: Populate initial values based on the 'list' array.
  // This loop places 'i + 1' at the index specified by 'list[i] - 1'.
  for ( var i = 0 ; i < N ; i ++ ) {
    output [ list [ i ] - 1 ] = i + 1 ;
  }


  // Second pass: Fill remaining nulls with increasing values starting from 2.
  for ( var i = 2 ; i <= N ; i ++ ) {
    var count = i - 1 ; // Number of elements to place for the current value 'i'.

    // Iterate through the entire output array.
    for ( var j = 0 ; j < N * N ; j ++ ) {

      if ( output [ j ] == null ) {
        // If the current position is empty, place the value 'i'.
        count -- ;
        output [ j ] = i ;

        // If all required 'i' values have been placed, break this inner loop.
        if ( count == 0 ) {
          break ;
        }
      } else if ( output [ j ] == i ) {
        // If 'i' is already present, it indicates a conflict, so output "No" and exit.
        myout ( "No" ) ;
        return ;
      }
    }
  }


  // Third pass: Fill remaining nulls with decreasing values.
  // This loop works backward through the output array.
  for ( var i = 1 ; i < N ; i ++ ) {
    var count = N - i ; // Number of elements to place for the current value 'i'.

    // Iterate backward through the output array.
    for ( var j = N * N - 1 ; j >= 0 ; j -- ) {

      if ( output [ j ] == null ) {
        // If the current position is empty, place the value 'i'.
        count -- ;
        output [ j ] = i ;

        // If all required 'i' values have been placed, break this inner loop.
        if ( count == 0 ) {
          break ;
        }
      } else if ( output [ j ] == i ) {
        // If 'i' is already present, it indicates a conflict, so output "No" and exit.
        myout ( "No" ) ;
        return ;
      }
    }
  }


  // Final check: Ensure no nulls remain in the output array.
  for ( var i = 0 ; i < N * N ; i ++ ) {
    if ( output [ i ] == null ) {
      // If any position is still null, the arrangement is impossible.
      myout ( "No" ) ;
      return ;
    }
  }

  // If all checks pass, a valid arrangement was found.
  myout ( "Yes" ) ;
  // Output the final array, joined by spaces.
  myout ( myconv ( output , 8 ) ) ;
}