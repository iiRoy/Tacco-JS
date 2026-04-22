/*
 * This is the main function that processes the input.
 * It reads data, sorts it, and calculates a sum.
 */
function   Main ( input )   {

    // Split the input string by newlines to get individual lines.
    input  =  input .split ( "\n" ) ;

    /*
     * The first line contains N and K,
     * which are stored in 'tmp' array.
     */
    tmp  =  input [0] .split ( " " ) ;

    n  =  tmp [0] ; // N represents the total number of elements.
    k  =  tmp [1] ; // K represents the number of elements to sum.

    p  =  input [1] .split ( " " ) ; // The second line contains the actual data.


    let   q  =  [ ] ; // Initialize an empty array 'q' to store parsed integers.

    for ( let   i  =  0 ;   i  <  n ;   i ++ )   {
        q [i]  =  parseInt ( p [i] ,   10 ) ; // Convert string elements to integers.
    }


    /*
     * Sort the array 'q' in ascending order.
     * This custom comparator ensures numerical sorting.
     */
    q .sort (
        function ( a , b ) { // Custom comparison function.
            return   ( a  <  b  ?  -1  :  1 ) ; // Standard ascending sort logic.
        }
    ) ;


    let   sum  =  0 ; // Initialize sum to zero.

    for ( let   i  =  0 ;   i  <  k ;   i ++ )   {
        sum  +=  q [i] ; // Add the smallest 'k' elements to the sum.
    }


    console .log ( sum ) ; // Output the final calculated sum.

}


// *** This section is for handling standard input/output and should not be modified. ***
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;