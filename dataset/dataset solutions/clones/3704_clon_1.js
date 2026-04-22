"use strict" ; /* This directive enforces strict mode. */


const main =  ( arg ) =>   { // Main function definition starts here.


    arg  =  arg . trim ( ) . split ( "\n" ) ; /* Process the input string: trim whitespace and split by newlines. */

    const  N  =  parseInt ( arg [ 0 ] ) ; // Parse the first element as an integer for N.


    const  a  =  arg [ 1 ] . split ( " " ) . map ( n => parseInt ( n ) ) ; // Split the second line by spaces and map to integers for array 'a'.


    let   list   =   [ ] ; // Initialize an empty list to store processed values.


    for ( let   i   in   a ) { // Iterate over the indices of array 'a'.

        let   temp   =   a [ i ]   -   ( parseInt ( i )   +   1 ) ; // Calculate temp: a[i] minus (index + 1).

        /* Add the calculated temporary value to our list. */
        list . push ( temp ) ;
    } // End of for loop.


    let   set   =   new   Set ( list ) ; // Create a Set from the list to get unique values.


    console . log ( [ ... set ] . map ( n => Math . abs ( n ) ) . reduce ( ( m , n ) => m + n ) ) ; // Convert set to array, map to absolute values, then sum them up, and log the result.

} ; // End of main function.


// Call the main function with input read from stdin.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;