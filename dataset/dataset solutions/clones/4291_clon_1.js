/*
 * This is a JavaScript program designed for string processing and utility operations.
 * It provides functions for reading input, converting data types, and performing specific string manipulations.
 *
 * The primary purpose of this script is to analyze a given string, specifically
 * to determine if it is a palindrome when 'x' characters are ignored, and
 * to calculate a value based on the distribution of 'x' characters.
 */

var obj = init ( ) ; // Global variable 'obj' is initialized once to handle input.

// The main function of the program is called immediately after initialization.
Main ( ) ;

// --- Input Utility Functions ---

/**
 * Converts the next available input token into an integer.
 * @returns {number} The integer representation of the next input.
 */
function nextInt ( )
{
  return myconv ( next ( ) , 1 ) ; /* This function uses 'myconv' with mode 1 for integer conversion. */
}

/**
 * Retrieves the next input token and splits it into an array of strings
 * using half-width spaces as delimiters.
 * @returns {Array<string>} An array of strings.
 */
function nextStrArray ( )
{
  return myconv ( next ( ) , 2 ) ; // Mode 2 for splitting by half-width spaces.
}

/**
 * Retrieves the next input token, splits it by half-width spaces, and then
 * converts each resulting substring into a number.
 * @returns {Array<number>} An array of numbers.
 */
function nextIntArray ( )
{
  return myconv ( next ( ) , 4 ) ; // Mode 4 for splitting by spaces and converting to numbers.
}

/**
 * Retrieves the next input token and splits it into an array where each
 * element is a single character from the token.
 * @returns {Array<string>} An array of characters.
 */
function nextCharArray ( )
{
  return myconv ( next ( ) , 6 ) ; // Mode 6 for single-character splitting.
}

/**
 * Advances the input stream and returns the next line/token.
 * @returns {string} The next input line.
 */
function next ( )
{
  return obj.next ( ) ; // Delegates to the 'next' method of the global 'obj' input handler.
}

/**
 * Checks if there are more input lines/tokens available to be read.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasNext ( )
{
  return obj.hasNext ( ) ; // Delegates to the 'hasNext' method of the global 'obj' input handler.
}

/**
 * Reads all data from standard input, processes it, and returns it as an array of lines.
 * This involves reading the file system, decoding to UTF-8, trimming whitespace,
 * and splitting by newline characters.
 * @returns {Array<string>} An array where each element is a line from standard input.
 */
function myin ( )
{
  return require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ;
}


// Function to initialize the input reading mechanism.
function init ( )
{
  var inputFile = myin ( ) ; // Fetch all input lines.
  var returnObj = {
    "list" : inputFile ,         // Stores the array of input lines.
    "index" : 0 ,                // Current read position (line index).
    "max" : inputFile.length ,   // Total number of lines available.

    "hasNext" : function ( )
    {
      return ( this.index < this.max ) ; // Checks if the current index is within bounds.
    } ,

    "next" : function ( )
    {
      if ( ! this.hasNext ( ) )
      {
        return "" ; // If no more input, return an empty string.
      }
      else
      {
        var returnInput = this.list [ this.index ] ; // Get the current line.
        this.index ++ ;                               // Increment index for the next read.
        return returnInput ;                          // Return the fetched line.
      }
    }
  } ;
  return returnObj ; // Return the configured input object.
}

/**
 * Outputs the given content to the standard output stream.
 * @param {any} t - The data to be logged to the console.
 */
function myout ( t )
{
  console.log ( t ) ;
}

/**
 * Outputs the given content to the standard error stream.
 * This is typically used for debugging messages or error reporting.
 * @param {any} t - The data to be logged to the error console.
 */
function myerr ( t )
{
  console.error ( t ) ;
}

/*
 * The 'myconv' function is a versatile converter for various data types and formats.
 * It takes an input 'i' and a conversion mode 'no'.
 *
 * Conversion Modes (value of 'no'):
 * ---------------------------------------------------------------------------------
 *  - 1: Converts 'i' to an integer using parseInt().
 *  - 2: Splits 'i' by half-width spaces (" ") into an array of strings.
 *  - 4: Splits 'i' by half-width spaces (" ") and then maps each resulting string
 *       to a Number (e.g., ["1", "2"] becomes [1, 2]).
 *  - 6: Splits 'i' into an array of single characters (e.g., "abc" becomes ["a", "b", "c"]).
 *  - 7: Splits 'i' into single characters and then maps each character to a Number.
 *  - 8: Joins the elements of array 'i' with a half-width space (" ").
 *  - 9: Joins the elements of array 'i' with a newline character ("\n").
 *  - 0: Joins the elements of array 'i' without any separator.
 *  - Default / Error: If 'no' is unknown or an error occurs during conversion,
 *                     the original input 'i' is returned unchanged.
 * ---------------------------------------------------------------------------------
 */
function myconv ( i , no )
{
  try
  {
    switch ( no )
    {
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
        return i ; // For any unrecognized 'no' value, return the input as is.
    }
  }
  catch ( e )
  {
    // In case any conversion operation throws an error,
    // the original input 'i' is returned to prevent program crash.
    return i ;
  }
}

/**
 * The main execution block of the program.
 * It reads a string, processes it to check for a specific palindrome-like property
 * (ignoring 'x' characters), and calculates a value based on 'x' distribution.
 */
function Main ( )
{
  var s = next ( ) ; // Read the input string from standard input.
  var len = s.length ; // Get the total length of the input string 's'.
  // Create a new string 'notXs' by removing all occurrences of the character 'x' from 's'.
  var notXs = s.replace ( /x/g , "" ) ;

  var tmpS = "" ; // Temporary string to store non-'x' characters in reverse order.
  var count = 0 ; // Counter to keep track of consecutive 'x' characters.
  var list = [ ] ; // Array to store the counts of 'x's found between non-'x' characters.

  // Loop through each character of the input string 's'.
  for ( var i = 0 ; i < len ; i = ( i + 1 ) | 0 )
  {
    // Check if the current character is NOT 'x'.
    if ( s [ i ] != "x" )
    {
      tmpS = s [ i ] + tmpS ; // Prepend the non-'x' character to tmpS.
      list.push ( count ) ;   // Add the accumulated 'x' count to the list.
      count = 0 ;             // Reset the 'x' counter.
    }
    else
    {
      count ++ ; // If the character IS 'x', increment the 'x' counter.
    }
  }

  list.push ( count ) ; // Add the final count of trailing 'x's after the loop.

  myerr ( list ) ; // Output the list of 'x' counts to standard error for debugging purposes.

  // Check if the string formed by non-'x' characters in reverse (tmpS)
  // is identical to the string formed by non-'x' characters in original order (notXs).
  if ( tmpS != notXs )
  {
    myout ( -1 ) ; // If they are not identical, it means the non-'x' part is not a palindrome.
    return ;       // In this case, output -1 and terminate the function.
  }

  var output = 0 ; // Initialize the variable to store the final calculated result.

  // Iterate through the 'list' array to calculate the total difference in 'x' counts.
  for ( var i = 0 ; i < list.length ; i = ( i + 1 ) | 0 )
  {
    // Add the absolute difference between the 'x' count at the current index
    // and the 'x' count at the corresponding position from the end of the list.
    output += Math.abs ( list [ i ] - list [ list.length - 1 - i ] ) ;
  }

  // The final required output is half of the total accumulated difference.
  myout ( output / 2 ) ;
}