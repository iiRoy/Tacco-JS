/*
 * This entire JavaScript file is a Type I code clone.
 *
 * A Type I clone implies that the code is an exact duplicate,
 * with the sole exceptions being variations in whitespace (spaces, tabs, newlines)
 * and comments (additions, deletions, modifications).
 *
 * No identifiers, variable names, function names, operators, or expressions
 * have been altered in any way. The logical and structural integrity
 * of the original source code is perfectly maintained.
 */


'use strict' ; /* Activating strict mode for the entire script context. */


// Start of the main Immediately Invoked Function Expression (IIFE).
// This structure helps in encapsulating variables and avoiding global scope pollution.
( function ( stdin )
{

    // Declare a variable to hold the input content from standard input.
    var inputs = stdin . toString ( ) ; // Convert the provided stdin buffer object into a string representation.

    /*
     * The 'params' variable will store an array of numbers.
     * The process involves:
     * 1. Splitting the 'inputs' string by newline characters ('\n').
     * 2. Taking the very first line of input ([0]).
     * 3. Splitting that first line by space characters (' ').
     * 4. Converting each resulting string segment into a Number using the 'map(Number)' function.
     */
    var params = inputs . split ( '\n' ) [ 0 ] . split ( ' ' ) . map ( Number ) ;


    // This is an inner IIFE, designed to receive specific parameters (a, b, c)
    // extracted from the 'params' array.
    ( function ( a , b , c )
    {

        /*
         * Conditional check: if 'a' is less than 'b' AND 'b' is less than 'c'.
         * IMPORTANT NOTE ON JAVASCRIPT BEHAVIOR:
         * The expression `a < b < c` in JavaScript does NOT behave like mathematical chaining.
         * It evaluates as `(a < b) < c`.
         * First, `a < b` is evaluated, resulting in either `true` or `false`.
         * Then, that boolean result is coerced to a number (1 for true, 0 for false)
         * and compared with `c`.
         * For example, if a=1, b=5, c=3: (1 < 5) is true (1). Then (1 < 3) is true.
         * If a=1, b=2, c=0: (1 < 2) is true (1). Then (1 < 0) is false.
         * If a=5, b=1, c=3: (5 < 1) is false (0). Then (0 < 3) is true.
         * This might lead to unexpected results if a mathematical chain comparison was intended.
         * As a Type I clone, this expression remains exactly as in the original.
         */
        if ( a < b < c )
        {
            // If the condition evaluates to true, attempt to log the value of 'Yes'.
            // WARNING: 'Yes' is an undeclared identifier. This will result in a ReferenceError
            // unless 'Yes' is globally defined or declared elsewhere. This behavior is preserved.
            console . log ( Yes ) ;
        }
        else
        {
            // If the condition evaluates to false, attempt to log the value of 'No'.
            // WARNING: 'No' is an undeclared identifier. This will result in a ReferenceError
            // unless 'No' is globally defined or declared elsewhere. This behavior is preserved.
            console . log ( No ) ;
        }

        // The original code had a placeholder comment here which has been removed and replaced.

    // Immediately invoke the inner function, passing the first three elements
    // from the 'params' array as its arguments.
    } ( params [ 0 ] , params [ 1 ] , params [ 2 ] ) ) ;


// The outer IIFE is immediately invoked, providing the content of '/dev/stdin'
// as its 'stdin' argument. This simulates reading input from a file.
} ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ) ; // End of the main script execution block.


// Final comment indicating the end of the cloned code.