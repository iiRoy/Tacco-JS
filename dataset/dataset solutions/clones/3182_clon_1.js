var input = require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) . trim() . split( "\n" );


var obj = {

  "list" : input,

  "index" : 0,

  "max" : input . length,

  "next" : function( )
  {
    if ( ! this . hasNext( ) )
    {
      throw "NoSuchElementException:次に要素は無いよ";
    }

    var returnObj = this . list[ this . index ];
    this . index++;
    return returnObj;
  }
  ,

  "hasNext" : function( )
  {
    return ( this . index < this . max );
  }

};

function next( ) {
  return obj . next( );
}

function nextInt( ) {
  return myconv( next( ), 1 );
}

function nextStrArray( ) {
  return myconv( next( ), 2 ); // Splits by half-width spaces
}

function nextIntArray( ) {
  return myconv( next( ), 4 ); // Splits by half-width spaces and converts to numbers
}

function nextCharArray( ) {
  return myconv( next( ), 6 ); // Splits into individual characters
}

function hasNext( ) {
  return obj . hasNext( );
}

function myout( t ) {
  console . log( t ); // Outputs to standard console log
}

function myerr( t ) {
  console . error( t ); // Outputs to standard console error
}

/*
 * This is the conversion utility function.
 * It handles various types of input parsing and manipulation.
 *
 * Parameter 'no' specifies the conversion type:
 * - Default: Returns the input 'i' as is.
 * - 1: Converts 'i' to an integer.
 * - 2: Splits 'i' by spaces into a string array.
 * - 4: Splits 'i' by spaces and maps to numbers (array of numbers).
 * - 6: Splits 'i' into individual characters (array of strings).
 * - 7: Splits 'i' into individual characters and maps to numbers.
 * - 8: Joins array 'i' with spaces.
 * - 9: Joins array 'i' with newlines.
 * - 0: Joins array 'i' without any separator.
 */
function myconv( i , no )
{
  try
  {
    switch ( no )
    {
      case 1 :
        return parseInt( i );
      case 2 :
        return i . split( " " );
      case 4 :
        return i . split( " " ) . map( ( a ) => Number( a ) );
      case 6 :
        return i . split( "" );
      case 7 :
        return i . split( "" ) . map( ( a ) => Number( a ) );
      case 8 :
        return i . join( " " );
      case 9 :
        return i . join( "\n" );
      case 0 :
        return i . join( "" );
      default :
        return i;
    }
  }
  catch ( e )
  {
    // In case of any conversion error, return the original input.
    return i;
  }
}

Main( ); // Calls the main function to start program execution.

/*
 * The primary logic of the program.
 * Reads two integers, performs a conditional operation, and prints the result.
 */
function Main( )
{
  var one = nextIntArray( ); // Reads an array of integers.

  var A = one[ 0 ]; // First integer.
  var B = one[ 1 ]; // Second integer.

  if ( B % A )
  {
    // If B is not perfectly divisible by A (remainder is non-zero).
    myout( A + B ); // Output the sum of A and B.
  }
  else
  {
    // If B is perfectly divisible by A (remainder is zero).
    myout( A - B ); // Output the difference between A and B.
  }
}