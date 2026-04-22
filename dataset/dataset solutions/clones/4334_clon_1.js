var  input =  require("fs") . readFileSync (  "/dev/stdin"  ,  "utf8"  ) . trim ( ) . split ( "\n" ) ; /* This line reads the input from standard input,
                                                                      decodes it as UTF-8, removes leading/trailing whitespace,
                                                                      and splits it into an array of lines. */

var obj =
{
  "list" : input , /* The array holding all input lines */
  "index" : 0 ,    // The current position in the input array
  "max" : input.length , // The total number of lines in the input array
  "next" : function ( )
  {
    // Checks if there are more elements to process
    if ( ! this . hasNext ( ) )
    {
      throw "NoSuchElementException:次に要素は無いよ"; /* Throws an error if no more elements are available */
    }

    var returnObj = this . list [ this . index ] ; // Retrieves the element at the current index
    this . index ++ ;                               // Increments the index for the next call
    return returnObj ;                              // Returns the retrieved element
  } ,

  "hasNext" : function ( ) {
    return ( this . index < this . max ) ; // Returns true if the current index is less than the total number of elements
  }
} ;

// Initiates the main program execution
Main ( ) ;

function next ( ) {
  return obj . next ( ) ; // A simple wrapper function to get the next input line
}

function hasNext ( ) {
  return obj . hasNext ( ) ; // A simple wrapper function to check if more input lines exist
}

function myout ( t ) {
  console . log ( t ) ; /* This function is used for displaying output to the standard console. */
}

function myerr ( t ) {
  console . error ( t ) ; /* This function is for displaying error messages to the standard error stream. */
}

/*
 * Function: myconv
 * Description: Handles various data type conversions and manipulations based on the 'no' parameter.
 * Parameters:
 *   i - The input value (can be a string or an array).
 *   no - An integer code specifying the type of conversion or operation.
 *
 * Conversion Codes:
 *   1 : Converts 'i' to an integer using parseInt().
 *   2 : Splits 'i' (string) by a space character into an array of strings.
 *   4 : Splits 'i' (string) by space and then maps each resulting string to a Number.
 *   6 : Splits 'i' (string) into an array of single characters.
 *   7 : Splits 'i' (string) into an array of single characters and then maps each character to a Number.
 *   8 : Joins elements of 'i' (array) with a space character.
 *   9 : Joins elements of 'i' (array) with a newline character.
 *   0 : Joins elements of 'i' (array) with no separator.
 *   Default : Returns 'i' unchanged if 'no' does not match any specific case.
 *
 * Error Handling: If any error occurs during the conversion process, the original input 'i' is returned.
 */
function myconv ( i , no )
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
    return i ; // Returns original input in case of conversion error
  }
}

function Main ( )
{
  // Reads the next line of input and converts it into an array of numbers.
  var one = myconv ( next ( ) , 4 ) ;

  // Assigns the elements of the 'one' array to N, M, and K respectively.
  var N = one [ 0 ] ; // Represents the first dimension.
  var M = one [ 1 ] ; // Represents the second dimension.
  var K = one [ 2 ] ; // Represents the target count.

  // Checks for a direct solution where K is a multiple of M or N.
  if ( ( K % M == 0 ) || ( K % N == 0 ) )
  {
    myout ( "Yes" ) ; // If true, a solution exists.
    return ;          // Exits the function early.
  }

  // Iterates through all possible values for 'i' from 1 to N.
  for ( var i = 1 ; i <= N ; i ++ )
  {
    // For each 'i', iterates through all possible values for 'j' from 1 to M.
    for ( var j = 1 ; j <= M ; j ++ )
    {
      /*
       * Calculates 'count' based on the formula.
       * This formula computes the total number of cells that would be marked
       * if 'i' rows and 'j' columns are selected in an N x M grid,
       * effectively (rows + columns - shared_cells).
       */
      var count = ( M * i ) + ( N * j ) - 2 * ( i * j ) ;

      // Compares the calculated 'count' with the target value K.
      if ( count == K )
      {
        myout ( "Yes" ) ; // If they match, a solution is found.
        return ;          // Exits the function immediately.
      }
    }
  }

  // If no combination of 'i' and 'j' yields the target K,
  // then no solution exists under the given conditions.
  myout ( "No" ) ; // Outputs "No" indicating no solution.
}