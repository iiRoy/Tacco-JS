var input = require("fs") . readFileSync(
  "/dev/stdin",
  "utf8"
) . trim() . split( "\n" ) ; // This line reads all input from standard in, processes it, and splits it into an array of strings.

/*
 *  The 'obj' variable acts as a custom iterator for the input array.
 *  It keeps track of the current position and the total number of lines.
 */
var obj = {
  "list" : input, // Stores the array of input lines.
  "index" : 0,    // The current index of the line to be read.
  "max" : input.length, // The total count of input lines available.

  // This method checks if there are more elements (lines) to read.
  "hasNext" : function ( )
  {
    return ( this.index < this.max ) ;
  },

  // This method retrieves the next line from the input list.
  "next" : function ( )
  {
    if ( ! this.hasNext( ) )
    {
      // Throws an error if an attempt is made to read beyond the end of the input.
      throw "NoSuchElementException:次に要素は無いよ" ;
    }
    var returnObj = this.list[ this.index ] ; // Get the current line.
    this.index++; // Increment the index for the next read.
    return returnObj ; // Return the line.
  }
} ;

// Calls the main function to start the program's execution.
Main ( ) ;

/**
 *  A simple wrapper function to get the next input line.
 *  @returns {string} The next line of input.
 */
function next ( )
{
  return obj . next ( ) ;
}

// Reads the next input line and converts it to an integer.
function nextInt ( )
{
  return myconv ( next ( ) , 1 ) ;
}

/*
 *  Reads the next input line and splits it into an array of strings
 *  using half-width spaces as delimiters.
 *  @returns {string[]} An array of strings.
 */
function nextStrArray ( )
{
  return myconv ( next ( ) , 2 ) ;
}

// Reads the next input line, splits it by spaces, and converts each part to a number.
function nextIntArray ( )
{
  return myconv ( next ( ) , 4 ) ;
}

// Reads the next input line and converts it into an array of single characters.
function nextCharArray ( )
{
  return myconv ( next ( ) , 6 ) ;
}

// Checks if there are any more lines remaining in the input.
function hasNext ( )
{
  return obj . hasNext ( ) ;
}

// Prints the given argument to standard output.
function myout ( t )
{
  console . log ( t ) ;
}

// Prints the given argument to standard error output.
function myerr ( t )
{
  console . error ( t ) ;
}

/*
 * This 'myconv' function is a versatile converter.
 * It takes an input 'i' and a 'no' parameter indicating the desired conversion type.
 *
 * Conversion modes:
 *   1: Parse as an integer.
 *   2: Split string by spaces.
 *   4: Split string by spaces and map to numbers.
 *   6: Split string into individual characters.
 *   7: Split string into characters and map to numbers.
 *   8: Join array elements with a space.
 *   9: Join array elements with a newline.
 *   0: Join array elements without any separator.
 *   Default: Return the input 'i' unchanged.
 *
 * It includes basic error handling, returning the original input on conversion failure.
 */
function myconv( i , no )
{
  try
  {
    switch ( no )
    {
      case 1 : return parseInt ( i ) ;
      case 2 : return i . split ( " " ) ;
      case 4 : return i . split ( " " ) . map ( ( a ) => Number ( a ) ) ;
      case 6 : return i . split ( "" ) ;
      case 7 : return i . split ( "" ) . map ( ( a ) => Number ( a ) ) ;
      case 8 : return i . join ( " " ) ;
      case 9 : return i . join ( "\n" ) ;
      case 0 : return i . join ( "" ) ;
      default : return i ;
    }
  }
  catch ( e )
  {
    return i ; // If an error occurs during conversion, return the original input.
  }
}

// This is the primary function where the main logic of the program is executed.
function Main ( )
{
  var N = nextInt ( ) ; // Reads an integer value N from the input.

  // myerr(getDivisorList(N)); // This line is commented out, likely for debugging purposes.

  // Get all divisors of N, then sort them in descending order.
  var list = getDivisorList ( N ) . sort ( function ( a , b )
  {
  	return b - a ; // Custom sort function for descending order.
  } ) ;

  var output = 0 ; // Initialize a variable to accumulate the final output.

  // Loop through the first half of the sorted divisor list.
  // This calculation is specific to the problem's requirements.
  for ( var i = 0 ; i < Math . floor ( list.length / 2 ) ; i++ )
  {
    output += list[ i ] - 1 ; // Subtracts 1 from each divisor and adds to output.
    // myerr(output); // Another commented-out debugging line.
  }

  myout ( output ) ; // Prints the final calculated output.
}

/*
 *  Calculates all positive divisors for a given number 'val'.
 *  It returns them in an array, sorted in ascending order.
 *  @param {number} val - The integer for which divisors are to be found.
 *  @returns {number[]} An array containing all divisors of 'val'.
 */
function getDivisorList ( val )
{
        var list = [ ] ; // Initialize an empty array to store the divisors.

        // Loop from 1 up to the square root of 'val'.
        for ( var i = 1 ; i * i <= val ; i++ )
        {
                if ( val % i == 0 ) // Check if 'i' is a divisor of 'val'.
                {
                        list . push ( i ) ; // Add 'i' to the list of divisors.
                        if ( i * i != val )
                        {
                                // If 'i' is not the square root, then 'val / i' is also a divisor.
                                list . push ( val / i ) ;
                        }
                }
        }
        // Sort the list of divisors in ascending order.
        list . sort ( function ( a , b )
        {
          return a - b ;
        } ) ;

        return list ; // Return the sorted list of divisors.
}