var obj = init  (  ) ;


Main  (  )  ;



/*
 *  Utility function: nextInt
 *  Retrieves the next integer from the input object.
 */
function nextInt ( )
{
  return myconv ( next ( ) , 1 ) ;
}


// Function to get next string array (space-separated)
function nextStrArray ( )
{
  return myconv ( next ( ) , 2 ) ;
}


/*
  Function: nextIntArray
  Purpose: Retrieves the next line, splits by space, and converts to an array of numbers.
*/
function nextIntArray ( )
{
  return myconv ( next ( ) , 4 ) ;
}


function nextCharArray ( )
{
  return myconv ( next ( ) , 6 ) ; // Splits into characters
}


function next ( )
{
  return obj . next ( ) ;
}


function hasNext ( )
{
  return obj . hasNext ( ) ;
}


function myin ( )
{
  return require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ;
}


function init ( )
{
  // Initialize input object
  var inputFile = myin ( ) ;


  var returnObj = {
    "list" : inputFile ,
    "index" : 0 ,
    "max" : inputFile . length ,

    "hasNext" : function ( )
    {
      return ( this . index < this . max ) ;
    } ,

    "next" : function ( )
    {
      if ( ! this . hasNext ( ) )
      {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ" ;
      }
      else
      {
        var returnInput = this . list [ this . index ] ;
        this . index ++ ;
        return returnInput ;
      }
    }
  } ;


  return returnObj ;
}


function myout ( t )
{
  console . log ( t ) ;
}


function myerr ( t )
{
  console . error ( t ) ;
}


// This section describes the 'no' parameter for myconv function.
// [no] parameter handling. Numeric type.
// Unknown value, on error: returns argument as is.
// 1: Converts to number.
// 2: Splits by half-width space.
// 4: Splits by half-width space and converts to numeric array.
// 6: Splits by 1 character.
// 7: Splits by 1 character and converts to numeric array.
// 8: Joins with half-width space.
// 9: Joins with newline.
// 0: Joins with no characters.
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
        return i ;
    }
  }
  catch ( e )
  {
    return i ;
  }
}


/*
 * Main function: Entry point of the program.
 * Reads an integer N, then calculates and outputs a specific value.
 */
function Main ( )
{
  var N = nextInt ( ) ;


  // The commented-out loop below appears to be an alternative or previous approach.
  /*
  var count = 0;
  for(var i = 2; i <= N; i++){
    var tmp = N;
    while(tmp >= i){
      if(tmp % i == 0){
        tmp /= i;
      }else{
        tmp -= i;
      }
    }
    if(tmp == 1){
      myerr(i);
      count++;
    }
  }
  */

  // Current logic: outputs the length of the divisor list of (N-1) plus 1.
  myout ( getDivisorList ( N - 1 ) . length + 1 ) ;
}


/*
 * Function: getDivisorList
 * Calculates all divisors of a given value.
 * @param val The number for which to find divisors.
 * @returns An array of divisors, sorted in ascending order.
 */
function getDivisorList ( val )
{
  var list = [ ] ;

  for ( var i = 1 ; i * i <= val ; i ++ )
  {
    if ( val % i == 0 )
    {
      list . push ( i ) ;
      if ( i * i != val )
      {
        list . push ( val / i ) ;
      }
    }
  }

  list . sort ( function ( a , b )
  {
    return a - b ;
  } ) ;

  return list ;
}