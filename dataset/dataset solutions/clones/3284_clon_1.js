/* This JavaScript program processes input data to categorize numbers
 * into three distinct groups based on given thresholds.
 * It then calculates the minimum count among these three categories.
 *
 * This code adheres to strict mode for better error handling and performance.
 *
 * Developed by: Clone Generator
 * Version: 1.0
 * Date: October 27, 2023
 */

"use strict" ; // Enforce strict mode for the entire script.

const   Main   =    (   input   )    =>
{
        // 1. Input Processing:
        //    - Remove leading/trailing whitespace from the input string.
        //    - Split the cleaned input into an array of strings, where each string is a line.
        let    xs    =    input .   trim ( ) .   split ( '\n' )   ;


        // 2. Variable Initialization from Input:
        //    - The first line (xs[0]) contains the total number of elements, N.
        let    N    =    Number ( xs [ 0 ] )    ;

        //    - The second line (xs[1]) contains two space-separated thresholds, A and B.
        //      Extract A (first part).
        let    A    =    Number ( xs [ 1 ] .   split ( " " ) [ 0 ] )    ;
        //      Extract B (second part).
        let    B    =    Number ( xs [ 1 ] .   split ( " " ) [ 1 ] )    ;


        // 3. Data Structure Setup:
        //    - Initialize three empty arrays to store numbers categorized by thresholds.
        let    P1    =    [ ]    ;   // For numbers <= A
        let    P2    =    [ ]    ;   // For numbers > A and <= B
        let    P3    =    [ ]    ;   // For numbers > B

        //    - The third line (xs[2]) contains space-separated numbers for processing.
        //      Split the string by spaces and convert each part to an integer (base 10).
        let    P    =    xs [ 2 ] .   split ( ' ' ) .   map ( v   =>   parseInt ( v , 10 ) )    ;


        // 4. Categorization Logic (Loop):
        //    - Iterate through each number in the array P from index 0 up to N-1.
        for    (    let    i    =    0    ;    i    <    N    ;    i ++    )
            {
            //    - Conditional check for categorization:
            //      If the current number P[i] is less than or equal to A, add it to P1.
            if    (    P [ i ]    <=    A    )
                {
                P1 .   push ( P [ i ] )    ;
                }
            //      Else, if P[i] is less than or equal to B, add it to P2.
            else    if    (    P [ i ]    <=    B    )
                {
                P2 .   push ( P [ i ] )    ;
                }
            //      Otherwise (P[i] is greater than B), add it to P3.
            else
                {
                    P3 .   push ( P [ i ] )
                }
            }


        // 5. Result Calculation:
        //    - Find the minimum length among the three categorized arrays (P1, P2, P3).
        let    ans    =    Math .   min ( P1 .   length ,    P2 .   length ,    P3 .   length )    ;

        // 6. Output:
        //    - Print the calculated minimum value to the standard output.
        console .   log ( ans )
}

// Main function execution:
//    - Read the entire content of '/dev/stdin' as a UTF-8 encoded string.
//    - Pass this string as input to the 'Main' function to start the processing.
Main ( require ( 'fs' ) .   readFileSync ( '/dev/stdin' , 'utf8' ) ) ;