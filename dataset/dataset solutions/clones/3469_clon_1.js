/*
 * This is a Type I clone of the original JavaScript code.
 * All functional aspects, variable names, and expressions are identical.
 * Only whitespace and comments have been altered significantly
 * to demonstrate a Type I clone.
 */

var input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ;

// This object acts as an iterator for the input lines.
var obj = {
  "list" : input , // The array of input lines.
  "index" : 0 , // Current position in the list.
  "max" : input.length , // Total number of lines.

  // Checks if there are more elements to iterate.
  "hasNext" : function ( ) {
    return ( this.index < this.max ) ;
  } ,

  // Retrieves the next element from the list.
  "next" : function ( ) {
    if ( ! this.hasNext ( ) ) {
      throw "NoSuchElementException:次に要素は無いよ" ; // Error if no more elements.
    }
    var returnObj = this.list[ this.index ] ; // Get the current element.
    this.index ++ ; // Advance the index.
    return returnObj ; // Return the fetched element.
  }
} ;

// Call the main processing function to start the program execution.
Main ( ) ;

/**
 * Retrieves the next raw string element from the input iterator.
 * @returns {string} The next input line as a string.
 */
function next ( ) {
  return obj.next ( ) ;
}

/*
 * Converts the next input element to an integer.
 * Uses the myconv helper with type 1.
 */
function nextInt ( ) {
  return myconv ( next ( ) , 1 ) ;
}

// Retrieves the next input element and splits it by spaces into a string array.
function nextStrArray ( ) {
  return myconv ( next ( ) , 2 ) ; // 半角スペース分割
}

/*
 * Retrieves the next input element, splits it by spaces,
 * and converts each part to a number, returning a number array.
 */
function nextIntArray ( ) {
  return myconv ( next ( ) , 4 ) ; // 半角スペース + 数値化
}

// Retrieves the next input element and splits it into an array of characters.
function nextCharArray ( ) {
  return myconv ( next ( ) , 6 ) ; // 1文字分割
}

// Checks if there are more elements available in the input iterator.
function hasNext ( ) {
  return obj.hasNext ( ) ;
}

// Outputs the given value to the standard output (console.log).
function myout ( t ) {
  console.log ( t ) ;
} // 標準出力

// Outputs the given value to the standard error output (console.error).
function myerr ( t ) {
  console.error ( t ) ;
} // 標準エラー出力

/*
 * myconv function: Handles various conversions for input elements.
 * [no] parameter determines the conversion type:
 *   - 1: Convert to integer.
 *   - 2: Split by half-width spaces into a string array.
 *   - 4: Split by half-width spaces and convert to a number array.
 *   - 6: Split into a character array.
 *   - 7: Split into a character array and convert to a number array.
 *   - 8: Join array elements with half-width spaces.
 *   - 9: Join array elements with newlines.
 *   - 0: Join array elements without any separator.
 *   - Default: Return the input as is (for unknown or abnormal values).
 *
 * It includes error handling (try-catch) to return the original input
 * if conversion fails.
 */
function myconv ( i , no ) {
  try {
    switch ( no ) {
      case 1 :
        return parseInt ( i ) ;
      case 2 :
        return i.split ( " " ) ;
      case 4 :
        return i.split ( " " ) . map ( ( a ) => Number ( a ) ) ;
      case 6 :
        return i.split ( "" ) ;
      case 7 :
        return i.split ( "" ) . map ( ( a ) => Number ( a ) ) ;
      case 8 :
        return i.join ( " " ) ;
      case 9 :
        return i.join ( "\n" ) ;
      case 0 :
        return i.join ( "" ) ;
      default :
        return i ;
    }
  } catch ( e ) {
    return i ; // Return original input on error.
  }
}

// Main function where the program's primary logic resides.
function Main ( ) {
  var one = nextIntArray ( ) ; // Read the first line as an array of integers.

  var A = one[ 0 ] ; // Assign the first integer to variable A.
  var B = one[ 1 ] ; // Assign the second integer to variable B.
  var K = one[ 2 ] ; // Assign the third integer to variable K.

  // Loop K times to perform operations on A and B.
  for ( var i = 0 ; i < K ; i ++ ) {
    // Check if the current iteration number is even.
    if ( i % 2 == 0 ) {
      // If A is odd, decrement it by 1.
      if ( A % 2 == 1 ) {
        A -- ;
      }
      B += A / 2 ; // Add half of A to B.
      A /= 2 ; // Divide A by 2.
    } else {
      // If the current iteration number is odd.
      // If B is odd, decrement it by 1.
      if ( B % 2 == 1 ) {
        B -- ;
      }
      A += B / 2 ; // Add half of B to A.
      B /= 2 ; // Divide B by 2.
    }
  }

  // Output the final values of A and B, separated by a space.
  myout ( A + " " + B ) ;
}