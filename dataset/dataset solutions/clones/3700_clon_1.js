/*
 * This script processes input lines to calculate the maximum absolute difference
 * between any two elements in a numerical array provided via standard input.
 * It reads lines, parses numbers, and then performs a comparison.
 */

//  Initialize an array to hold all input lines received.
//  Also, initialize a variable 'result' to store the maximum difference found,
//  starting it at zero as differences are non-negative.
var lines  =  [ ] ;
var result = 0 ;

//  Create a readline interface instance. This allows the script to read input
//  line by line from the standard input stream (process.stdin)
//  and potentially write output to the standard output stream (process.stdout).
var rl = readline . createInterface ( {
  input  :  process.stdin ,  //  Specify standard input as the source.
  output :  process.stdout   //  Specify standard output as the destination.
} ) ;

/*
 *  Attach an event listener for the 'line' event.
 *  This function will be executed every time a new line of input is received.
 *  The received line (parameter 'x') is added to the 'lines' array.
 */
rl . on ( 'line' ,  function ( x )
  {
    lines . push ( x ) ; //  Add the current line to our collection.
  }
) ;

/*
 *  Attach an event listener for the 'close' event.
 *  This function runs once the input stream has ended (e.g., EOF is reached).
 *  It contains the core logic for processing the collected input and calculating
 *  the desired result.
 */
rl . on ( 'close' ,  function ( )
  {
    //  The first line of input (lines[0]) is expected to be the count 'N'.
    //  Convert this string to a number.
    var N  =  Number ( lines [ 0 ] ) ;

    //  The second line of input (lines[1]) contains space-separated numbers.
    //  Split this string by spaces, then use 'map' to convert each string part
    //  into a numerical value, storing them in array 'A'.
    var A  =  lines [ 1 ] . split ( " " ) . map ( value  =>  Number ( value ) ) ;

    //  Begin a nested loop structure to iterate through all unique pairs
    //  of elements within the array 'A'.
    for ( var i = 0 ;  i < N ;  i++ )
      {
        for ( var j = 0 ;  j < N ;  j++ )
          {
            //  Calculate the absolute difference between the current pair of elements,
            //  A[i] and A[j].
            //  Then, update 'result' to be the maximum of its current value
            //  and this newly calculated absolute difference.
            result  =  Math . max ( result , Math . abs ( A [ i ]  -  A [ j ] ) ;
          }
      }

    //  After checking all possible pairs, print the final maximum absolute
    //  difference to the console.
    console . log ( result ) ;
  }
) ;