/* This is a strict mode script. It helps catch common coding errors and "unsafe" actions. */
"use strict" ;

/*
 * The main function that processes the input.
 * It calculates some combinatorial problem result.
 */
function  Main ( input )
{
  // Split the input string by newline characters to get an array of lines.
  input  =  input . split ( "\n" ) ;

  // Parse the first line to get the integer N.
  var  N  =  parseInt ( input [ 0 ] ,  10 ) ;

  // Initialize an empty array A to store subsequent integer values.
  var  A  =  [ ] ;

  // Loop N times to populate array A with parsed integers from the input.
  for ( var  i  =  0 ;   i  <  N ;   i ++ )
  {
    A . push ( parseInt ( input [ i + 1 ] ,  10 ) ) ;
  }


  // Calculate the sum of all elements in array A using the reduce method.
  var  S  =  A . reduce ( function ( p ,  c )
  {
    return  p  +  c ;
  } ) ; /* This comment indicates patterns where R and G are NOT used. */


  // dp will store counts for patterns where R and G are NOT excluded.
  var  dp  =  new  Array ( N  +  1 ) ; /* This array is for patterns involving R, G, B. */

  // dp1 will store counts for patterns where R and G are NOT excluded, but with different counting logic.
  var  dp1  =  new  Array ( N  +  1 ) ;

  // Initialize the 2D dp and dp1 arrays.
  // Each row will have S+1 columns, all filled with zero initially.
  for ( var  _i  =  0 ;   _i  <=  N ;   _i ++ )
  {
    dp [ _i ]  =  new  Array ( S  +  1 ) . fill ( 0 ) ;
    dp1 [ _i ]  =  new  Array ( S  +  1 ) . fill ( 0 ) ;
  }

  // Base cases for dynamic programming:
  // There is one way to have a sum of 0 with 0 elements.
  dp [ 0 ] [ 0 ]  =  1 ;
  dp1 [ 0 ] [ 0 ]  =  1 ;


  // Main dynamic programming loop.
  // _i2 iterates through the elements of A (from 1 to N, effectively).
  for ( var  _i2  =  0 ;   _i2  <=  N ;   _i2 ++ )
  {
    // j iterates through possible sums.
    for ( var  j  =  0 ;   j  <=  S ;   j ++ )
    {
      // Calculate the difference required for 'R' pattern.
      var  diff  =  j  -  A [ _i2  -  1 ] ;

      // If _i2 is greater than 0 (i.e., processing an actual element)
      // and the difference is non-negative (valid previous sum).
      if ( _i2  >  0   &&   diff  >=  0 )
      {
        // This block considers the 'R' pattern.
        // Add counts from the previous state where the current element A[_i2-1] was used to reach sum 'diff'.
        dp [ _i2 ] [ j ]  +=  dp [ _i2  -  1 ] [ diff ] ;
        dp1 [ _i2 ] [ j ]  +=  dp1 [ _i2  -  1 ] [ diff ] ;
      }

      // If _i2 is greater than 0 (i.e., processing an actual element).
      if ( _i2  >  0 )
      {
        // This block considers the 'G' pattern.
        // Add counts from the previous state where the current element A[_i2-1] was NOT used for the current sum 'j'.
        dp [ _i2 ] [ j ]  +=  dp [ _i2  -  1 ] [ j ] ; /* This comment indicates the 'G' or 'B' pattern. */

        // For dp1, if it's 'G' or 'B', it's multiplied by 2 because 'G' and 'B' are distinct choices.
        dp1 [ _i2 ] [ j ]  +=  2  *  dp1 [ _i2  -  1 ] [ j ] ;
      }
    }
  }


  // Calculate total possible arrangements (3 choices for N items).
  var  total  =  Math . pow ( 3 ,  N ) ;

  // Initialize sum variables.
  var  sum  =  0 ;
  var  sum1  =  0 ;

  // Iterate from S/2 up to S to find relevant sums.
  // Note: parseInt(S / 2, 10) is used to ensure integer division.
  for ( var  _i3  =  parseInt ( S  /  2 ,  10 ) ;   _i3  <=  S ;   _i3 ++ )
  {
    // If the current sum _i3 is greater than or equal to half of the total sum S.
    if ( _i3  >=  S  /  2 )
    {
      sum  +=  dp1 [ N ] [ _i3 ] ;
    }

    // If the current sum _i3 is exactly half of the total sum S.
    if ( _i3  ===  S  /  2 )
    {
      sum1  +=  dp [ N ] [ _i3 ] ;
    }
  }

  // Output the final calculated result modulo 998244353.
  console . log ( ( total  -  3  *  sum  +  3  *  sum1 )  %  998244353 ) ;
}

// Read input from standard input and pass it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" ) ) ;