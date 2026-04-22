var GET = ( function ( ) {
  // This immediately-invoked function expression (IIFE) defines a utility
  // for parsing input data, typically from standard input.
  // It returns a function 'f' which is the main entry point for parsing.

  /**
   * The public interface for the input parser.
   * Creates a new instance of the internal 'g' parser class.
   * @param {string} s - The raw input string.
   * @returns {g} A new parser instance.
   */
  function f ( s ) {
    return new g ( s ) ;
  }


  /**
   * The internal parser class. Manages the input string and current line index.
   * @param {string} s - The raw input string to be parsed.
   */
  function g ( s ) {
    // Store the input string, first trimming whitespace from ends,
    // then splitting it into an array of lines.
    this._s = s . trim ( ) . split ( "\n" ) ;
    // Initialize the current line index to 0, indicating the first line.
    this._y = 0 ;
  }


  // Define the 'a' (atom) method on the prototype of the 'g' class.
  // This method reads a single element from the current line.
  g . prototype . a = function ( f ) {
    var s = this._s , // Reference to the array of input lines.
        y = this._y , // Current line index.
        r ;          // Variable to hold the result.

    // Check if the current line at index 'y' is still a single string.
    // If so, it hasn't been processed into an array of elements yet.
    if ( typeof s [ y ] === "string" ) {
      // Split the line by spaces and reverse the resulting array.
      // Reversing allows us to efficiently extract elements from the "front"
      // of the line using `pop()`.
      s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;
    }

    // Extract the last element from the (reversed) array.
    // This is effectively the next element from the original line.
    r = s [ y ] . pop ( ) ;

    // After popping, if the current line array is empty,
    // it means all elements on this line have been consumed.
    if ( ! s [ y ] . length ) {
      // Advance the line pointer to the next line.
      this._y ++ ;
    }

    // Return the extracted element.
    // If 'f' (format flag) is true/truthy, return as a string.
    // Otherwise, convert it to a number using the unary plus operator (+r).
    return f ? r : + r ;
  } ;


  // Define the 'l' (line) method on the prototype of the 'g' class.
  // This method reads an entire line and returns its elements.
  g . prototype . l = function ( f ) {
    // Access the current line, split it by spaces into an array of strings,
    // and then immediately increment the line pointer '_y' to move to the next line.
    var s = this._s [ this._y ++ ] . split ( " " ) ;

    // Return the array of elements.
    // If 'f' is true/truthy, return the elements as strings.
    // Otherwise, map each element in the array to its numeric equivalent.
    return f ? s : s . map ( a => + a ) ;
  } ;


  // Define the 'm' (matrix) method on the prototype of the 'g' class.
  // This method reads 'n' consecutive lines and treats them as a 2D array (matrix).
  g . prototype . m = function ( n , f ) {
    // Use `slice` to extract 'n' lines starting from the current line index '_y'.
    // `this._y += n` updates the line pointer to after the 'n' lines.
    // Then, `map` each extracted line string, splitting it by spaces
    // to form an array of string elements for each row.
    var r = this._s . slice ( this._y , this._y += n ) . map ( a => a . split ( " " ) ) ;

    // Return the 2D array.
    // If 'f' is true/truthy, return all elements as strings.
    // Otherwise, map both the outer array (rows) and inner arrays (elements)
    // to convert all elements to numbers.
    return f ? r : r . map ( a => a . map ( a => + a ) ) ;
  } ;


  // Define the 'r' (rows) method on the prototype of the 'g' class.
  // This method reads 'n' consecutive lines and returns them as a 1D array of strings or numbers.
  g . prototype . r = function ( n , f ) {
    // Use `slice` to extract 'n' lines directly as strings.
    // `this._y += n` updates the line pointer to after the 'n' lines.
    var r = this._s . slice ( this._y , this._y += n ) ;

    // Return the array of lines.
    // If 'f' is true/truthy, return the lines as strings.
    // Otherwise, map each line string to its numeric equivalent.
    return f ? r : r . map ( a => + a ) ;
  } ;


  // The IIFE returns the public 'f' function, which is used to create parser instances.
  return f ;

} ) ( ) ;


// Initialize the 'o' object using the GET parser.
// It reads the entire content of "/dev/stdin" as a UTF-8 string,
// which is a common way to get input in competitive programming environments.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/**
 * Creates a multi-dimensional array initialized with a specific value or structure.
 * This function dynamically constructs and evaluates a JavaScript string
 * to create deeply nested arrays based on provided dimensions.
 *
 * @param {any} v - The initial value for the innermost elements of the array.
 *                    This can be a primitive or a string representing a JavaScript expression (e.g., "[]").
 * @param {...number} dimensions - A variable number of arguments representing the
 *                                 sizes of the array dimensions, from the outermost
 *                                 dimension to the innermost.
 * @returns {Array} A multi-dimensional array constructed according to the dimensions and initial value.
 */
function xArray ( v ) {
  var a = arguments , // Access the arguments object to get all parameters.
      l = a . length ,  // Get the total number of arguments.
      // Start building the string for the innermost array's creation.
      // `a[--l]` accesses the last dimension provided.
      // `fill(0)` is just a placeholder; `map` then replaces each `0` with the `v` value.
      r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ;

  // Loop backwards through the remaining dimensions (from second-to-last to first).
  while ( -- l ) {
    // Wrap the current 'r' string with another `Array().fill(0).map()` call
    // to create the next level of nesting.
    r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
  }

  // Evaluate the fully constructed JavaScript string.
  // This dynamically creates and returns the multi-dimensional array.
  return eval ( r ) ;
}


// Execute the main program logic and print its returned value to the standard output.
console . log ( main ( ) ) ;


/**
 * The main function that orchestrates the program's logic.
 * It reads input, performs calculations based on bitwise operations,
 * and formats the output into a space-separated, newline-joined string.
 *
 * @returns {string} The formatted result string containing the calculated 't' values.
 */
function main ( ) {
  // Read the first integer from the input using the 'a' (atom) method of the 'o' parser.
  var n = o . a ( ) ;

  // Initialize a 2D array named 'ans'.
  // It will have 'n-1' rows, and each row will be an empty array "[]" initially.
  // The structure `ans[i][j-i-1]` implies that the inner arrays will be populated
  // dynamically, and `i` goes up to `n-2` for actual access.
  var ans = xArray ( "[]" , n - 1 ) ;

  // Outer loop: Iterate through rows 'i' from 0 up to, but not including, 'n'.
  for ( var i = 0 ; i < n ; i ++ ) {
    // Inner loop: Iterate through columns 'j' starting from 'i + 1' up to, but not including, 'n'.
    // This ensures that 'j' is always greater than 'i', processing unique pairs (i, j).
    for ( var j = i + 1 ; j < n ; j ++ ) {
      // Initialize 't' to 1. This variable will count the effective "position"
      // of the least significant '1' bit in the XOR result, or more precisely,
      // 1 + the number of trailing zeros.
      var t = 1 ,
          // Calculate 'b' as the bitwise XOR of 'i' and 'j'.
          // This operation highlights differences in their binary representations.
          b = i ^ j ;

      // While 'b' is an even number (meaning its least significant bit is 0),
      // continue to right-shift 'b' by 1 (equivalent to integer division by 2)
      // and increment 't'.
      // This loop effectively counts how many times 'b' can be divided by 2
      // before it becomes odd, which is 1 + the number of trailing zeros in its binary form.
      while ( b % 2 === 0 ) {
        b >>= 1 ,
        t ++ ;
      }

      // Store the calculated 't' value into the 'ans' array.
      // The inner index `j - i - 1` adjusts for the fact that for a given 'i',
      // 'j' starts from 'i + 1'. So, `j = i + 1` maps to index 0,
      // `j = i + 2` maps to index 1, and so on.
      ans [ i ] [ j - i - 1 ] = t ;
    }
  }

  // Format the 'ans' array into a single string for output.
  // 1. `ans.map(a => a.join(" "))`: For each inner array 'a' (representing a row),
  //    join its elements with a space character. This creates an array of strings,
  //    where each string is a space-separated row.
  // 2. `.join("\n")`: Join these row strings with a newline character,
  //    creating a multi-line string where each line corresponds to a row of the 'ans' array.
  return ans . map ( a => a . join ( " " ) ) . join ( "\n" ) ;
}