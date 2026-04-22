'use strict' ; /* This directive ensures that the code runs in strict mode,
                          which helps catch common coding errors and "unsafe" actions. */


const input =
    require ( 'fs' )
        . readFileSync ( '/dev/stdin' ,  'utf8' )
        . trim ( )
        . split ( ' ' )
        . map ( x  =>  x * 1 ) ; // Read input from stdin, convert to string, trim whitespace,
                               // split by spaces into an array, and then convert each element to a number.


let ans  =  0 ; // Initialize the answer counter. This will store the number of doublings.


/*
 * The 'max' variable stores the upper limit for our doubling sequence.
 * It is derived from the second element of the parsed input array (index 1).
 */
let max  =  input [ 1 ] ;


// The 'div' variable holds the starting value for the sequence.
// It corresponds to the first element of the input array (index 0).
let div  =  input [ 0 ] ;


/**
 * 'tmpNum' is a temporary variable that represents the current number
 * in the sequence. It starts with the initial 'div' value and is
 * subsequently doubled in each iteration of the loop.
 */
let tmpNum  =  div ;


// Begin a loop that continues as long as 'tmpNum' does not exceed 'max'.
while ( tmpNum  <=  max )
{
    // Increment the answer counter for each successful doubling step.
    ans ++ ;

    // Double the 'tmpNum' for the next iteration of the loop.
    // This is equivalent to tmpNum = tmpNum * 2;
    tmpNum  *=  2 ;
}


// Output the final calculated answer to the standard console.
console . log ( ans ) ;