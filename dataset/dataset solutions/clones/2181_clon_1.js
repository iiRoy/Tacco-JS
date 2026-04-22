/* This section handles input setup and utility functions.
 * It's generally not directly related to the core algorithm,
 * but necessary for competitive programming environments. */
// Don't have to see. start------------------------------------------
var read = require( 'readline' ) . createInterface ( {
  input : process . stdin , // Standard input stream
  output : process . stdout // Standard output stream
} ) ;

var obj ; // Object to manage input lines
var inLine = [ ] ; // Array to store all input lines

read . on ( 'line' , function ( input ) {
  // Event listener for each line of input
  inLine . push ( input ) ;
} ) ;

read . on ( 'close' , function ( ) {
  // Event listener when input stream closes
  obj = init ( inLine ) ; // Initialize the input manager
  console . error ( '\n↑入力 ↓出力' ) ; // Display input/output indicator for user
  Main ( ) ; // Call the main function to start processing
} ) ;


/*
 * Helper function to create a deep clone of an object.
 * Supports Set objects by converting them to arrays first.
 * For other types, it uses JSON serialization/deserialization.
 */
function makeClone ( obj ) {
  return ( obj instanceof Set )
           ? new Set ( Array . from ( obj ) ) // Clone a Set
           : JSON . parse ( JSON . stringify ( obj ) ) ; // Deep clone other objects
}


// --- Input parsing utility functions ---

function nextInt ( ) {
  // Reads the next line and converts it to an integer.
  return myconv ( next ( ) , 1 ) ;
}

function nextStrArray ( ) {
  // Reads the next line and splits it into a string array by spaces.
  return myconv ( next ( ) , 2 ) ;
}

function nextIntArray ( ) {
  // Reads the next line, splits it by spaces, and converts elements to numbers.
  return myconv ( next ( ) , 4 ) ;
}

function nextCharArray ( ) {
  // Reads the next line and splits it into a character array.
  return myconv ( next ( ) , 6 ) ;
}


function next ( ) {
  // Retrieves the next available input line.
  return obj . next ( ) ;
}

function hasNext ( ) {
  // Checks if there are more input lines to read.
  return obj . hasNext ( ) ;
}


/*
 * Initializes the input object with the provided lines.
 * This object manages reading lines sequentially using an index.
 */
function init ( input ) {
  return {
    list : input , // The array of input lines
    index : 0 , // Current index for reading
    max : input . length , // Total number of input lines
    hasNext : function ( ) {
      return ( this . index < this . max ) ; // Check if index is within bounds
    } ,
    next : function ( ) {
      if ( this . hasNext ( ) ) {
        return this . list [ this . index ++ ] ; // Return current line and increment index
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input' ; // Error if no more input
      }
    }
  } ;
}


function myout ( s ) {
  // Custom function for printing output to console.
  console . log ( s ) ;
}


function myerr ( s ) {
  // Custom function for printing debug messages to console error stream.
  console . error ( 'debug:' + require ( 'util' ) . inspect ( s , false , null ) ) ;
}


/*
 * Central conversion utility.
 * 'no' parameter dictates the conversion type:
 * 1: parseInt (string to integer)
 * 2: split by space (string to array of strings)
 * 4: split by space and map to Number (string to array of numbers)
 * 6: split by character (string to array of characters)
 * 7: split by character and map to Number (string to array of numbers from digits)
 * 8: join by space (array to string)
 * 9: join by newline (array to string)
 * 0: join without character (array to string)
 * Default: return as is (no conversion).
 */
function myconv ( i , no ) {
  try {
    switch ( no ) {
      case 1 :
        return parseInt ( i ) ; // Convert to integer
      case 2 :
        return i . split ( ' ' ) ; // Split by space
      case 4 :
        return i . split ( ' ' ) . map ( Number ) ; // Split and map to numbers
      case 6 :
        return i . split ( '' ) ; // Split into characters
      case 7 :
        return i . split ( '' ) . map ( Number ) ; // Split into characters and map to numbers
      case 8 :
        return i . join ( ' ' ) ; // Join with spaces
      case 9 :
        return i . join ( '\n' ) ; // Join with newlines
      case 0 :
        return i . join ( '' ) ; // Join without separator
      default :
        return i ; // No conversion
    }
  } catch ( e ) {
    return i ; // In case of conversion error, return original input
  }
}

// Don't have to see. end------------------------------------------

// Main program logic starts here.
// This is where the primary computation for the problem takes place.

function Main ( ) {

  var s = next ( ) ; // Get the input string
  var K = nextInt ( ) ; // Get the integer K
  var output = 0 ; // Initialize output counter

  // Iterate through all possible substrings of length K
  for ( var i = 0 ; i < s . length - K + 1 ; i ++ ) {

    var tmp = "" ; // Temporary string to build substring

    // Build the substring of length K starting at index i
    for ( var j = 0 ; j < K ; j ++ ) {
      tmp += s [ i + j ] ;
    }

    // Convert the substring to an integer
    tmp = myconv ( tmp , 1 ) ;

    if ( i != 0 ) {
      // If not the first iteration, this part seems to reset 'tmp'
      // to a number consisting of K nines, effectively maxing out the K-digit number.
      tmp = myconv ( new Array ( K ) . fill ( "9" ) . join ( "" ) , 1 ) ;
    }

    // Iterate downwards from 'tmp' to Math.pow(10, K-1) (smallest K-digit number)
    for ( var j = tmp ; j >= Math . pow ( 10 , K - 1 ) ; j -- ) {

      if ( j . toString ( ) . indexOf ( "0" ) != -1 ) {
        // If the number 'j' contains a '0' digit
        if ( K == 3 && j % 100 == 0 ) {
          // Special case: if K is 3 and j ends with '00'
          output += F ( s . length - ( i + K ) , K - 1 ) ; // Call helper function F
        } else {
          // General case for numbers containing '0'
          output += 9 * ( s . length - ( i + K ) ) ;
        }

      } else {
        // If the number 'j' does not contain a '0' digit
        output ++ ;
      }

    }

  }

  myout ( output ) ; // Output the final calculated result.

}


/*
 * Auxiliary function F, likely a recursive or helper function
 * for calculating counts based on 'keta' (number of digits) and 'k' (length).
 * It appears to have similar logic to the Main function's inner loop,
 * focusing on a specific range.
 */
function F ( keta , k ) {

  // Create a string of 'keta' nines (e.g., "999" for keta=3)
  var s = new Array ( keta ) . fill ( "9" ) . join ( "" ) ;
  var output = 0 ; // Initialize output for this function

  // Iterate through possible substrings of length 'k' within 's'
  for ( var i = 0 ; i < s . length - k + 1 ; i ++ ) {

    var tmp = "" ; // Temporary string for substring

    // Build the substring
    for ( var j = 0 ; j < k ; j ++ ) {
      tmp += s [ i + j ] ;
    }

    tmp = myconv ( tmp , 1 ) ; // Convert substring to integer

    if ( i != 0 ) {
      // If not the first iteration, reset 'tmp' to K nines
      tmp = myconv ( new Array ( k ) . fill ( "9" ) . join ( "" ) , 1 ) ;
    }

    // Iterate downwards from 'tmp' to smallest 'k'-digit number
    for ( var j = tmp ; j >= Math . pow ( 10 , k - 1 ) ; j -- ) {

      if ( j . toString ( ) . indexOf ( "0" ) != -1 ) {
        // If 'j' contains a '0' digit
        output += 9 * ( s . length - ( i + k ) ) ;
      } else {
        // If 'j' does not contain a '0' digit
        output ++ ;
      }

    }

  }

  return output ; // Return the calculated count

}


/*
 * Debugging function to verify the logic for a given N and K.
 * Counts numbers up to N that have exactly K non-zero digits.
 * This is likely for testing purposes and not part of the main solution.
 */
function debug ( N , K ) {

  var output = 0 ; // Initialize debug output counter

  // Iterate from 1 up to N
  for ( var i = 1 ; i <= N ; i ++ ) {

    var s = i . toString ( ) ; // Convert number to string
    var count = 0 ; // Counter for non-zero digits

    // Iterate through each character (digit) of the string
    for ( var j = 0 ; j < s . length ; j ++ ) {

      if ( s [ j ] != 0 ) {
        // If the digit is not '0', increment count
        count ++ ;
      }

    }

    if ( count == K ) {
      // If the number has exactly K non-zero digits, increment total output
      output ++ ;
    }

  }

  myout ( output ) ; // Output the debug result

}

// Original debug call, commented out.
// debug(314159, 3);