"use strict" ;

/*
 * This is the main function that processes the input data.
 * It reads values, sorts them, and calculates a final sum.
 */
function main ( input )
{
  // Parse the first line of input into an array of integers named 'kari'.
  const kari = input [ 0 ] . trim ( ) . split ( " " ) . map ( i => parseInt ( i ) ) ;

  // Process the second line of input for array 'p'.
  let p = input [ 1 ] . trim ( ) . split ( " " ) . map ( i => parseInt ( i ) ) ;

  // Process the third line of input for array 'q'.
  let q = input [ 2 ] . trim ( ) . split ( " " ) . map ( i => parseInt ( i ) ) ;

  // Process the fourth line of input for array 'r'.
  let r = input [ 3 ] . trim ( ) . split ( " " ) . map ( i => parseInt ( i ) ) ;


  const x = kari [ 0 ] ; // Extract value x from kari
  const y = kari [ 1 ] ; // Extract value y from kari
  const a = kari [ 2 ] ; // Extract value a from kari
  const b = kari [ 3 ] ; // Extract value b from kari
  const c = kari [ 4 ] ; // Extract value c from kari


  // Sort array 'p' in descending order.
  p . sort ( function ( a , b )
  {
    return b - a ; // Descending sort logic
  } ) ;
  p = p . slice ( 0 , x ) ; // Keep only the first 'x' elements of 'p'.

  // Sort array 'q' in descending order.
  q . sort ( function ( a , b )
  {
    return b - a ; // Another descending sort
  } ) ;
  q = q . slice ( 0 , y ) ; // Keep only the first 'y' elements of 'q'.

  /*
   * Sort array 'r' in descending order.
   * Note: 'r' is sorted but its length might be larger than needed later.
   */
  r . sort ( function ( a , b )
  {
    return b - a ;
  } ) ;
  r = r . slice ( 0 , x + y ) ; // Keep only the first 'x + y' elements of 'r'.


  // Concatenate 'p' and 'q' into 'preresult'.
  let preresult = p . concat ( q ) ;

  // Sort 'preresult' again in descending order.
  preresult . sort ( function ( a , b )
  {
    return b - a ;
  } ) ;


  // This nested loop block implements a specific replacement logic.
  // It iterates through 'r' and tries to replace smaller elements in 'preresult'.
  for ( let i = 0 ; i < r . length ; i ++ )
  {
    for ( let j = 0 ; j < preresult . length ; j ++ )
    {
      if ( r [ i ] > preresult [ j ] )
      {
        preresult [ j ] = r [ i ] ; // Replace if 'r[i]' is greater
        break ; // Move to the next element in 'r' after a replacement
      }
    }
  }


  // Calculate the sum of all elements in the final 'preresult' array.
  let sum = 0 ;
  for ( let i = 0 ; i < preresult . length ; i ++ )
  {
    sum += preresult [ i ] ; // Accumulate sum
  }

  // Output the final calculated sum to the console.
  console . log ( sum ) ;
}

// Call the main function with input read from standard input.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( "\n" ) ) ;