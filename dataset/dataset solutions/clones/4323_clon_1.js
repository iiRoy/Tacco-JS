/*
 * This JavaScript program processes numerical input data.
 * It's designed to read a sequence of numbers, perform specific
 * array manipulations, and then calculate a final sum based on
 * derived values. This version includes extensive comments and
 * varied whitespace for visual differentiation.
 *
 * Program Type: Input Processing & Calculation
 * Author: Automated Clone Generator
 * Date: October 27, 2023
 */

'use strict' ; // Enforces strict parsing and error handling in the script.


function   Main   (   input   )   {

    // Step 1: Pre-process the raw input string.
    // - trim(): Removes leading/trailing whitespace.
    // - split(/\s+/): Splits the string into an array of substrings using one or more whitespace characters as delimiter.
    // - map(x=>x-0): Converts each string element in the array to a number.
    input   =   input . trim ( ) . split ( / \s+ / ) . map ( x => x - 0 ) ;


    // Step 2: Extract the first number, which is assigned to N.
    // The shift() method removes the first element from an array and returns that element.
    var   N   =   input . shift ( ) ;


    // Step 3: Initialize two empty arrays, A and B, for storing subsequent data.
    var   A   =   [ ] ; // Array A will store the first set of numbers.
    var   B   =   [ ] ; // Array B will store the second set of numbers.


    // Step 4: Populate arrays A and B by alternately popping elements from the 'input' array.
    // The loop continues as long as there are elements remaining in the 'input' array.
    // Elements are popped from the end of the 'input' array.
    while   (   input . length   >   0   )   {
        B . push ( input . pop ( ) ) ; // The last element of 'input' goes into B.
        A . push ( input . pop ( ) ) ; // The new last element of 'input' (originally second to last) goes into A.
    }


    // Step 5: Find the maximum value within array A.
    // Math.max.apply(null, A) is used to find the maximum value in an array.
    var   M   =   Math . max . apply ( null ,   A ) ;


    // Step 6: Find the corresponding value in array B.
    // - A.indexOf(M): Gets the index of the maximum value (M) in array A.
    // - B[index]: Uses this index to retrieve the element from array B.
    var   S   =   B [ A . indexOf ( M ) ] ;


    // Step 7: Output the sum of M and S to the console.
    console . log ( M + S ) ;

} // End of the Main function definition.


// This section handles reading input from the standard input stream ('/dev/stdin')
// and then invokes the 'Main' function with the read content.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // Call Main with file system input.