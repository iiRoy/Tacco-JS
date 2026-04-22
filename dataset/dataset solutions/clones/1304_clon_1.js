/*
 * This is a Type I clone of the original JavaScript code.
 *
 * All identifiers, keywords, operators, and expressions are strictly preserved.
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered
 * to create a visually distinct, yet functionally identical, code fragment.
 *
 * This file processes matrix multiplication based on input from stdin.
 */

'use strict' ; // Ensure strict mode for the entire script.

// Define the main function that encapsulates the matrix multiplication logic.
const   main    =    ( arg )    =>
{

    // Step 1: Process the raw input string.
    // Trim any leading/trailing whitespace and split into lines.
    var   input   =   arg . trim ( ) . split ( "\n" ) ;

    // Step 2: Parse configuration parameters from the first line of input.
    // The first line contains three space-separated integers:
    // config[0] = number of rows in matrix A
    // config[1] = number of columns in matrix A (and rows in matrix B)
    // config[2] = number of columns in matrix B
    var   config   =   input [ 0 ] . split ( " " ) . map ( ( str ) =>   parseInt ( str ,   10 ) ) ;

    // Step 3: Parse Matrix A from the input.
    // It spans from the second line (index 1) up to config[0] rows.
    // Each row is split by spaces and converted to integers.
    const   matrixA   =   input . slice ( 1 ,   config [ 0 ] + 1 ) . map ( ( row ) =>   row . split ( " " ) . map ( ( str ) =>   parseInt ( str ,   10 ) ) ) ;

    // Step 4: Parse Matrix B from the input.
    // It starts immediately after Matrix A and spans config[1] rows.
    // Each row is also split by spaces and converted to integers.
    const   matrixB   =   input . slice ( config [ 0 ] + 1 ,   config [ 0 ] + 1 + config [ 1 ] ) . map ( ( row ) =>   row . split ( " " ) . map ( ( str ) =>   parseInt ( str ,   10 ) ) ) ;


    // Step 5: Initialize the result matrix with zeros.
    // The result matrix will have dimensions config[0] x config[2].
    const   result   =   [ ... Array ( config [ 0 ] ) ] . map ( ( obj1 ) =>   [ ... Array ( config [ 2 ] ) ] . map ( ( obj2 ) =>   0 ) ) ;


    // Step 6: Perform matrix multiplication using nested loops.
    // Outer loop iterates through rows of Matrix A (and result matrix).
    for   ( var   n   =   0 ;   n   <   config [ 0 ] ;   n ++ )
    {

        // 'cal' is re-declared in the inner loop, this variable is not used here.
        var   cal   =   [ ] ;

        // Middle loop iterates through columns of Matrix B (and result matrix).
        for   ( var   l   =   0 ;   l   <   config [ 2 ] ;   l ++ )
        {

            // Initialize a temporary array to store products for the current cell (n, l).
            // Note: 'cal' is re-declared here, shadowing the outer 'cal' variable.
            var   cal   =   [ ] ;

            // Inner loop iterates through columns of Matrix A (and rows of Matrix B).
            for   ( var   m   =   0 ;   m   <   config [ 1 ] ;   m ++ )
            {
                // Calculate the product of corresponding elements and push to 'cal'.
                cal . push ( matrixA [ n ] [ m ]   *   matrixB [ m ] [ l ] ) ;
            }

            // Sum the products in 'cal' to get the value for result[n][l].
            result [ n ] [ l ]   =   cal . reduce ( ( a ,   b ) =>   a   +   b ) ;
        }
    }


    // Step 7: Format and print the result matrix to standard output.
    // Each row of the result matrix is joined by spaces.
    // All rows are then joined by newline characters.
    console . log ( result . map ( ( a ) =>   a . join ( " " )   ) . join ( "\n" ) ) ;
} ;


// Read input from standard input and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;