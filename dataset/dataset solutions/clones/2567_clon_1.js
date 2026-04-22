/*
 * This section handles input processing and utility functions.
 * It's generally boilerplate for competitive programming setups.
 */

// Initialize the readline interface for standard input/output.
var read = require('readline') . createInterface(
  {
    input: process.stdin,   // Set input stream to standard input.
    output: process.stdout  // Set output stream to standard output.
  }
);

// Declare variables to store input lines and parsed object.
var obj;
var inLine = [ ] ;

// Event listener for each line of input received.
read . on (
  'line' ,
  function (input) {
    inLine . push(input); // Add the received line to the inLine array.
  }
);

// Event listener for when the input stream closes.
read . on (
  'close' ,
  function ( ) {
    // Initialize the input object with all collected lines.
    obj = init(inLine);

    // Output a newline to the error stream for visual separation.
    console . error ( "\n" ) ;

    // Record the start time for performance measurement.
    var start = Date . now ( ) ;

    // Execute the main logic of the program.
    Main ( ) ;

    // Calculate the elapsed time.
    var end = Date . now ( ) - start ;

    // Output the execution time to the error stream.
    myerr ( "time : " + end + "ms" ) ;

    // Output memory usage to the error stream.
    myerr ( "memory : " + Math . round ( process . memoryUsage ( ) . heapTotal / 1024 ) + "KB" ) ;
  }
);

/**
 * Creates a deep clone of a given object using JSON serialization.
 * This method is simple but has limitations (e.g., handles only JSON-serializable types).
 * @param {object} obj - The object to clone.
 * @returns {object} A deep copy of the input object.
 */
function makeClone (obj) {
  return JSON . parse ( JSON . stringify ( obj ) ) ;
}

/**
 * Reads the next input token and parses it as an integer.
 * @returns {number} The next input token as an integer.
 */
function nextInt ( ) {
  return myconv ( next ( ) , 1 ) ;
}

/**
 * Reads the next input token and splits it into an array of strings by spaces.
 * @returns {string[]} An array of strings.
 */
function nextStrArray ( ) {
  return myconv ( next ( ) , 2 ) ;
}

/**
 * Reads the next input token, splits it by spaces, and parses each part as a number.
 * @returns {number[]} An array of numbers.
 */
function nextIntArray ( ) {
  return myconv ( next ( ) , 4 ) ;
}

/**
 * Reads the next input token and splits it into an array of characters.
 * @returns {string[]} An array of characters.
 */
function nextCharArray ( ) {
  return myconv ( next ( ) , 6 ) ;
}

/**
 * Retrieves the next available input token.
 * @returns {string} The next input token.
 */
function next ( ) {
  return obj . next ( ) ;
}

/**
 * Checks if there are more input tokens available.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasNext ( ) {
  return obj . hasNext ( ) ;
}

/**
 * Initializes the input reader object.
 * @param {string[]} input - An array of input lines.
 * @returns {object} An object with methods to read input.
 */
function init ( input ) {
  return {
    list : input , // Store the array of input lines.
    index : 0 ,    // Current index in the input list.
    max : input . length , // Total number of input lines.

    /**
     * Checks if there are more lines to read.
     * @returns {boolean} True if there are more lines, false otherwise.
     */
    hasNext : function ( ) {
      return ( this . index < this . max ) ;
    } ,

    /**
     * Retrieves the next line from the input list.
     * Throws an error if no more input is available.
     * @returns {string} The next input line.
     */
    next : function ( ) {
      if ( this . hasNext ( ) ) {
        return this . list [ this . index ++ ] ;
      } else {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input" ;
      }
    }
  };
}

/**
 * Outputs a string to the standard output.
 * @param {string} s - The string to output.
 */
function myout ( s ) {
  console . log ( s ) ;
}

/**
 * Outputs a debug message to the standard error stream.
 * Uses `util.inspect` for detailed object inspection.
 * @param {*} s - The value to inspect and output.
 */
function myerr ( s ) {
  console . error ( "debug:" + require ( "util" ) . inspect ( s , false , null ) ) ;
}

// Parameter 'no' controls the conversion type:
//  - Unknown or outlier: returns the input 'i' as is.
//  - 1: Parses input 'i' as an integer.
//  - 2: Splits input 'i' by spaces into an array of strings.
//  - 4: Splits input 'i' by spaces and maps each part to a Number.
//  - 6: Splits input 'i' into an array of single characters.
//  - 7: Splits input 'i' into characters and maps each to a Number.
//  - 8: Joins elements of 'i' (array) with spaces.
//  - 9: Joins elements of 'i' (array) with newlines.
//  - 0: Joins elements of 'i' (array) with no separator.
function myconv ( i , no ) {
  try {
    switch ( no ) {
      case 1 : return parseInt ( i ) ;                       // Convert to integer.
      case 2 : return i . split ( " " ) ;                   // Split by space.
      case 4 : return i . split ( " " ) . map ( Number ) ;   // Split by space and convert to numbers.
      case 6 : return i . split ( "" ) ;                    // Split into characters.
      case 7 : return i . split ( "" ) . map ( Number ) ;   // Split into characters and convert to numbers.
      case 8 : return i . join ( " " ) ;                    // Join with spaces.
      case 9 : return i . join ( "\n" ) ;                   // Join with newlines.
      case 0 : return i . join ( "" ) ;                     // Join without separator.
      default : return i ;                                  // Default: return input as is.
    }
  } catch ( e ) {
    return i ; // In case of error during conversion, return original input.
  }
}

/*
 * This marks the end of the utility and input-handling section.
 * The Main function below contains the core logic for the problem.
 */

/**
 * The main function containing the problem's solution logic.
 * Reads input, performs calculations, and outputs the result.
 */
function Main ( ) {
  var N = nextInt ( ) ;        // Read an integer N. (Though N is not used in the provided code snippet directly)
  var s = nextCharArray ( ) ;  // Read a string and convert it to a character array.
  var output = 0 ;             // Initialize the output variable.

  // Loop as long as the character array 's' is not empty.
  while ( s . length > 0 ) {
    // Initialize a Z-array for the current string 's'.
    var z = new Array ( s . length ) ;
    z [ 0 ] = s . length ; // The first element of Z-array is always the length of the string.

    var i = 1 ; // 'i' is the current index being processed in the Z-array.
    var j = 0 ; // 'j' is the length of the current match.

    // Calculate the Z-array for the string 's'.
    while ( i < s . length ) {
      // Extend the match from the current position 'i'.
      while ( ( i + j ) < s . length && ( s [ j ] == s [ i + j ] ) ) {
        j ++ ;
      }
      z [ i ] = j ; // Store the length of the match at z[i].

      if ( j == 0 ) {
        i ++ ;        // If no match, move to the next position.
        continue ;    // Continue to the next iteration of the outer while loop.
      }

      var k = 1 ; // 'k' is used to copy values from a previous Z-box.

      // Copy values from the Z-box at index 'k' if they fall within the current match 'j'.
      while ( ( i + k ) < s . length && ( k + z [ k ] < j ) ) {
        z [ i + k ] = z [ k ] ; // Copy Z-value.
        k ++ ;                  // Move to the next 'k'.
      }

      i += k ; // Advance 'i' by 'k'.
      j -= k ; // Reduce 'j' by 'k', as 'k' part of the match is already processed.
    }

    // Iterate through the latter half of the Z-array to find the maximum Z-value.
    // This looks for the longest common prefix of suffixes that start at or after the middle.
    for ( var m = s . length - 1 ; m >= s . length / 2 ; m -- ) {
      output = Math . max ( output , z [ m ] ) ; // Update 'output' with the maximum Z-value found.
    }

    s . shift ( ) ; // Remove the first character from 's' to process the next suffix.
  }

  myout ( output ) ; // Output the final calculated maximum value.
}