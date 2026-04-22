var output ;

/* This variable will store the final result of the program.
 * It is initialized here and will be updated later within the Main function. */
var input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ;

// The 'obj' object manages the input stream.
// It provides methods to navigate through the input lines.
var obj = {
  "list"  :  input , // Stores the array of input lines.
  "index" :  0 , // Current position in the input array.
  "max"   :  input.length , // Total number of input lines.

  /**
   * Retrieves the next element from the input list.
   * Throws an error if no more elements are available.
   * @returns {string} The next input line.
   */
  "next" : function ( ) {
    if ( ! this.hasNext ( ) ) {
      throw "NoSuchElementException:次に要素は無いよ" ; // Error message for out-of-bounds access.
    }
    var returnObj = this.list [ this.index ] ; // Get the current element.
    this.index ++ ; // Advance the index for the next call.
    return returnObj ;
  } ,

  /**
   * Checks if there are more elements available in the input list.
   * @returns {boolean} True if more elements exist, false otherwise.
   */
  "hasNext" : function ( ) {
    return ( this.index < this.max ) ; // Compare current index with maximum length.
  }
} ;

// Start the main execution flow of the program.
Main ( ) ;

/**
 * Convenience function to get the next input element.
 * Delegates to the 'obj.next()' method.
 * @returns {string} The next input line.
 */
function next ( ) {
  return obj.next ( ) ;
}

/**
 * Convenience function to check for more input elements.
 * Delegates to the 'obj.hasNext()' method.
 * @returns {boolean} True if more elements exist, false otherwise.
 */
function hasNext ( ) {
  return obj.hasNext ( ) ;
}

/**
 * Outputs a value to the standard console.
 * @param {*} t - The value to be printed.
 */
function myout ( t ) {
  console.log ( t ) ; // standard output stream
}

/**
 * Outputs a value to the standard error console.
 * @param {*} t - The value to be printed as an error.
 */
function myerr ( t ) {
  console.error ( t ) ; // standard error stream
}

// [no] parameter handling for conversion function.
// If an unknown value or an error occurs, the original argument is returned.
// 1: Convert to integer.
// 2: Split by half-width space.
// 4: Split by half-width space and convert to an array of numbers.
// 6: Split into individual characters.
// 7: Split into individual characters and convert to an array of numbers.
// 8: Join array elements with half-width space.
// 9: Join array elements with a newline character.
// 0: Join array elements without any separator.
function myconv ( i , no ) {
  try {
    switch ( no ) {
      case 1 : return parseInt ( i ) ;
      case 2 : return i.split ( " " ) ;
      case 4 : return i.split ( " " ) . map ( ( a ) => Number ( a ) ) ;
      case 6 : return i.split ( "" ) ;
      case 7 : return i.split ( "" ) . map ( ( a ) => Number ( a ) ) ;
      case 8 : return i.join ( " " ) ;
      case 9 : return i.join ( "\n" ) ;
      case 0 : return i.join ( "" ) ;
      default : return i ; // Default case: return the input as is.
    }
  } catch ( e ) {
    return i ; // In case of any conversion error, return the original input.
  }
}

/**
 * The main function where the program logic resides.
 * It reads input, processes it, and outputs the result.
 */
function Main ( ) {
  var s = myconv ( next ( ) , 6 ) ; // Read next line and split into characters.
  var list = { } ; // Initialize an empty object to count character frequencies.

  // Loop through the characters to count their occurrences.
  for ( var i = 0 ; i < s.length ; i ++ ) {
    if ( list [ s [ i ] ] == null ) {
      list [ s [ i ] ] = 1 ; // First occurrence of this character.
    } else {
      list [ s [ i ] ] ++ ; // Increment count for existing character.
    }
  }

  var maxKeys = [ ] ; // This variable appears to be unused in the current logic.
  var max = 0 ; // This variable also appears to be unused.
  var keys = Array.from ( Object.keys ( list ) ) ; // Get an array of unique characters found.

  // Special case: if only one unique character exists, the answer is 0.
  if ( keys.length == 1 ) {
    myout ( 0 ) ;
    return ; // Exit the function early.
  }

  // Initialize 'output' with a large value for minimum calculation.
  var output = 107 ;

  // Iterate through each unique character as a potential target character.
  for ( var j = 0 ; j < keys.length ; j ++ ) {
    var tmpKey = keys [ j ] ; // The current target character.
    // Create a mutable copy of the original character array 's'.
    var tmpS = Object.assign ( [ ] , s ) ;
    var count = 0 ; // Counter for operations needed to convert tmpS to tmpKey.

    // Loop until all characters in tmpS are tmpKey.
    while ( ! check ( tmpS , tmpKey ) ) {
      // Perform the transformation: if next char is tmpKey, current char becomes tmpKey.
      for ( var i = 0 ; i < tmpS.length ; i ++ ) {
        if ( tmpS [ i + 1 ] == tmpKey ) {
          tmpS [ i ] = tmpKey ;
        }
      }
      tmpS.pop ( ) ; // Remove the last element after each transformation pass.
      count ++ ; // Increment the operation count.
    }
    // Update 'output' with the minimum count found so far.
    output = Math.min ( output , count ) ;
  }
  myout ( output ) ; // Output the final minimum count.
}

/**
 * Checks if all characters in a string array are equal to a given character.
 * @param {string[]} str - The array of characters to check.
 * @param {string} chr - The target character.
 * @returns {boolean} True if all characters in 'str' are 'chr', false otherwise.
 */
function check ( str , chr ) {
  var ret = true ; // Assume true initially.
  for ( var i = 0 ; i < str.length ; i ++ ) {
    if ( str [ i ] != chr ) {
      ret = false ; // Found a character that doesn't match.
      // No break here, but it could be optimized by adding one.
    }
  }
  return ret ; // Return the final boolean result.
}