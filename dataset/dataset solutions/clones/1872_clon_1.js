"use strict" ; // Enforce strict mode for better error handling and cleaner code.

function   main ( arg )
{

    // Deconstruct the initial values from the input string.
    // The input is trimmed, split by newline, taking the first line,
    // then split by space, and finally each part is converted to a Number.
    let   [ A , B , C , K ]   =   arg . trim ( ) . split ( "\n" ) [ 0 ] . split ( " " ) . map ( Number ) ;


    let   sum   =   0 ; // Initialize the accumulator for the final result.


    // The original iterative approach to solve this problem was commented out.
    // This version uses a direct, conditional calculation based on the problem's rules.


    // First phase: Process 'A' values.
    // 'A' values contribute +1 to the sum.
    if ( A   >=   K )
    {
        sum   =   K ; // If there are enough 'A's, take all K of them.
        K     =   0 ; // All K operations are consumed.
    }
    else
    {
        sum   =   A ; // If not enough 'A's, take all available 'A's.
        K     =   K   -   A ; // Reduce K by the number of 'A's taken.
    }


    // Second phase: Process 'B' values.
    // 'B' values do not change the sum, but consume K operations.
    if ( B   >=   K )
    {
        // If there are enough 'B's to cover remaining K, consume them.
        K     =   0 ; // All remaining K operations are consumed.
    }
    else
    {
        // If not enough 'B's, consume all available 'B's.
        K     =   K   -   B ; // Reduce K by the number of 'B's taken.
    }


    // Third phase: Process 'C' values.
    // 'C' values contribute -1 to the sum.
    if ( C   >=   K )
    {
        sum   =   sum   -   K ; // If there are enough 'C's, subtract remaining K from sum.
        // K is fully consumed here, no further operations needed.
    }
    else
    {
        sum   -=   C ; // If not enough 'C's, subtract all available 'C's from sum.
        // K is reduced by C, but its value is not used after this.
    }


    // Output the final calculated sum to standard output.
    console . log ( sum ) ;
}


// Read the entire content of standard input as a UTF-8 string.
// Then, pass this string to the 'main' function for processing.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;