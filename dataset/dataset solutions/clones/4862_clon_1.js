/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition, ensuring all
 * functional elements remain identical while varying
 * whitespace and comments extensively for visual distinction.
 */

"use strict" ;  // Enforces strict mode for cleaner code.


const main  =  arg  =>  {

    // Pre-processing the input argument: trim and split by newline.
    arg  =  arg . trim ( ) . split ( "\n" ) ;

    // Parsing the dimensions H (height) and W (width) from the first line.
    const H  =  parseInt ( arg [ 0 ] . split ( " " ) [ 0 ] ) ;
    const W  =  parseInt ( arg [ 0 ] . split ( " " ) [ 1 ] ) ;


    // Extracting the word grid from the input.
    // Slices from the second line (index 1) up to H lines, then maps each line to an array of words.
    const words  =  arg . slice ( 1 ,  H  +  1 ) . map ( s => s . split ( " " ) ) ;

    // Defining the alphabet for column representation (A-J).
    const alpha  =  "ABCDEFGHIJ" . split ( "" ) ;


    // Iterating through the grid to find the target word "snuke".
    for  ( let  i = 0 ;  i < H ;  i ++ )  { // Outer loop for rows.

        for  ( let  j = 0 ;  j < W ;  j ++ )  { // Inner loop for columns.

            // Check if the current cell contains the word "snuke".
            if  ( words [ i ] [ j ]  ===  "snuke" )  {

                // If found, log its position using alpha for column and i+1 for row.
                console . log ( alpha [ j ]  +  ( i + 1 ) ) ;

            } // End of if condition.

        } // End of inner loop (columns).

    } // End of outer loop (rows).

} ; // End of main function definition.


// Invoking the main function with input read from stdin.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;