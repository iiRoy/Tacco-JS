// This section initializes the input data for the program.
// It reads from standard input, trims whitespace, and splits by newlines.
var input = require(  "fs"  ) . readFileSync ( "/dev/stdin",   "utf8"  ) . trim ( ) . split ( "\n" ) ;


// The 'obj' object manages the input stream, providing methods
// to retrieve elements sequentially. It acts like an iterator.
var obj =
{
  "list"  : input , // The array containing all input lines
  "index" :   0   , // Current position in the input 'list'
  "max"   : input . length , // Total number of elements in 'list'

  "next" : function ( )
  {
    // Check if there are more elements before proceeding
    if ( ! this . hasNext ( ) )
    {
      throw "NoSuchElementException:次に要素は無いよ"; // Error if no more elements
    }

    // Retrieve the current element and advance the index
    var returnObj = this . list [ this . index ] ;
    this . index ++ ;
    return returnObj ;
  } ,

  "hasNext" : function ( )
  {
    // Determines if there are more elements to be read
    return ( this . index < this . max ) ;
  }
} ;


// The primary execution function of the program.
Main ( ) ;


// Helper functions to simplify input processing.
// These functions abstract away the details of 'obj' and 'myconv'.

function next ( )
{
  return obj . next ( ) ;
}

function nextInt ( )
{
  return myconv ( next ( ) , 1 ) ; // Reads next line and converts to integer
}

function nextStrArray ( )
{
  return myconv ( next ( ) , 2 ) ; // Reads next line and splits by space into string array
}

function nextIntArray ( )
{
  return myconv ( next ( ) , 4 ) ; // Reads next line, splits by space, and converts to integer array
}

function nextCharArray ( )
{
  return myconv ( next ( ) , 6 ) ; // Reads next line and splits into individual characters
}

function hasNext ( )
{
  return obj . hasNext ( ) ;
}


// Output utility functions.
function myout ( t )
{
  console . log ( t ) ; // Prints to standard output
}

function myerr ( t )
{
  console . error ( t ) ; // Prints to standard error output
}


// This function, 'myconv', is a versatile converter for input data.
// It handles various transformations based on the 'no' parameter.

// 'no' parameter mapping:
// -------------------------------------------------------------------
// 1   : Converts input 'i' to an integer using parseInt.
// 2   : Splits 'i' by single space characters into an array of strings.
// 4   : Splits 'i' by single space characters, then maps each part to a Number.
// 6   : Splits 'i' into an array of individual characters.
// 7   : Splits 'i' into individual characters, then maps each character to a Number.
// 8   : Joins elements of array 'i' with a single space.
// 9   : Joins elements of array 'i' with a newline character.
// 0   : Joins elements of array 'i' without any separator.
// default: If 'no' doesn't match, or if an error occurs, 'i' is returned as is.
// -------------------------------------------------------------------

function myconv ( i , no )
{
  try
  {
    switch ( no )
    {
      case 1 :
        return parseInt ( i ) ;
      case 2 :
        return i . split ( " " ) ;
      case 4 :
        return i . split ( " " ) . map ( ( a ) => Number ( a ) ) ;
      case 6 :
        return i . split ( "" ) ;
      case 7 :
        return i . split ( "" ) . map ( ( a ) => Number ( a ) ) ;
      case 8 :
        return i . join ( " " ) ;
      case 9 :
        return i . join ( "\n" ) ;
      case 0 :
        return i . join ( "" ) ;
      default :
        return i ; // Default case: return original input
    }
  }
  catch ( e )
  {
    // In case of any conversion error, simply return the original input 'i'.
    return i ;
  }
}


// The core logic of the program resides within the Main function.
// It processes specific input values to calculate an optimal output.

function Main ( )
{
  // Read the first line of input, expected to be an array of integers.
  var one = nextIntArray ( ) ;

  // Destructure the array 'one' into specific variables representing costs.
  var Q = one [ 0 ] ; // Cost related to quarter units
  var H = one [ 1 ] ; // Cost related to half units
  var S = one [ 2 ] ; // Cost related to single units
  var D = one [ 3 ] ; // Cost related to double units

  // Read the next integer, representing the quantity 'N'.
  var N = nextInt ( ) ;


  // Calculate temporary costs for different unit conversions,
  // normalizing them to a common base (e.g., equivalent to 'D' in terms of quantity).
  var tmpQ = Q * 8 ; // Q is for 0.25L, 8*Q for 2L
  var tmpH = H * 4 ; // H is for 0.5L, 4*H for 2L
  var tmpS = S * 2 ; // S is for 1L, 2*S for 2L

  // Initialize the final output value.
  var output = 0 ;

  // Create a list of normalized costs for comparison.
  // These represent the cost to acquire 2 units of liquid.
  var countList = [ tmpQ , tmpH , tmpS , D ] ;

  // Find the minimum cost to acquire 2 units of liquid.
  // This 'evenCount' is the most economical way to get 2 liters.
  var evenCount = Math . min . apply ( null , countList ) ;

  // Calculate the cost for the bulk of the quantity 'N' (pairs of units).
  // Math.floor(N / 2) gives the number of full pairs.
  output = evenCount * Math . floor ( N / 2 ) ;

  // If 'N' is odd, there's one unit remaining after the pairs are accounted for.
  if ( N % 2 == 1 )
  {
    // Recalculate temporary costs for acquiring a single unit.
    tmpQ = Q * 4 ; // Q is for 0.25L, 4*Q for 1L
    tmpH = H * 2 ; // H is for 0.5L, 2*H for 1L

    // Add the minimum cost to acquire this single remaining unit.
    // Compare costs from Q, H, and S, all normalized to 1 unit.
    output += Math . min ( tmpQ , Math . min ( tmpH , S ) ) ;
  }

  // Output the final calculated minimum cost.
  myout ( output ) ;
}