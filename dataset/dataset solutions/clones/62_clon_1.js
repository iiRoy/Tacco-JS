/*
 * This JavaScript file processes input lines, performing
 * large number addition using a custom sum function.
 * It's designed to read from standard input, expecting
 * pairs of numbers on subsequent lines after an initial
 * (unused) line count.
 */

// An Immediately Invoked Function Expression (IIFE) is used here
// to encapsulate the main execution logic and prevent global variable pollution.
( function ( input ) {

    // First, clean the input string: remove any trailing newline character
    // and then split the string into an array of individual lines.
    var p = input . replace ( /\n$/, '' ) . split ( '\n' ) ;

    // The first line of the input is typically a count or some metadata.
    // In this specific implementation, its value is consumed but not directly used
    // in the subsequent processing loop for number addition.
    var n = p . shift ( ) ;

    // Begin a loop to process pairs of numbers from the remaining input lines.
    // The loop continues as long as there are lines left in the 'p' array.
    while ( p . length > 0 ) {

        // Extract the first number string for the current addition operation.
        var n1 = p . shift ( ) ;

        // Extract the second number string for the current addition operation.
        var n2 = p . shift ( ) ;

        // Call the custom 'sum' function to add the two large number strings.
        // The result, also a string, is stored back into the 'n' variable.
        // Note: This 'n' shadows the earlier 'n' declared for the line count.
        var n = sum ( n1 , n2 ) ;

        // Check if the length of the resulting sum string is 80 or more characters.
        // This acts as a simple overflow check for display purposes.
        if ( n . length >= 80 ) {

            // If the sum is too long, print an 'overflow' message to the console.
            console . log ( 'overflow' ) ;

            // Skip the rest of the current loop iteration and move to the next pair of numbers.
            continue ;

        }

        // If the sum is within the acceptable length, print the sum to the console.
        // The '%s' format specifier ensures it's treated as a string.
        console . log ( '%s' , n ) ;

    } // End of the while loop, all number pairs have been processed.

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; // This immediately invokes the function,
                                                             // passing the content of /dev/stdin as the 'input' argument.


/**
 * Implements a large number addition algorithm for two numbers represented as strings.
 * This function handles numbers that exceed the precision limits of standard JavaScript numbers.
 *
 * @param {string} n1 - The first number as a string.
 * @param {string} n2 - The second number as a string.
 * @returns {string} The sum of n1 and n2, also as a string.
 */
function sum ( n1 , n2 ) {

    // Declare two variables, 'a' and 'b', which will hold the digits of the numbers
    // as arrays, with digits stored in reverse order (least significant digit first).
    var a , b ;

    // Determine which of the two input numbers is longer. This helps in
    // consistently assigning the potentially longer number to 'a' and the shorter to 'b',
    // which simplifies the subsequent addition loop.
    if ( n1 . length > n2 . length ) {
        // Convert n1 string to an array of numbers (digits), then reverse it.
        a = n1 . split ( '' ) . map ( Number ) . reverse ( ) ;
        // Convert n2 string to an array of numbers (digits), then reverse it.
        b = n2 . split ( '' ) . map ( Number ) . reverse ( ) ;
    } else {
        // If n2 is longer or equal in length, assign n1 to 'b' and n2 to 'a'.
        b = n1 . split ( '' ) . map ( Number ) . reverse ( ) ;
        a = n2 . split ( '' ) . map ( Number ) . reverse ( ) ;
    }

    // First pass: Add corresponding digits from 'b' to 'a'.
    // This loop iterates up to the length of the shorter number ('b').
    // The sum is accumulated in 'a', potentially resulting in digits greater than 9.
    for ( var i = 0 ; i < b . length ; i ++ ) {
        a [ i ] += b [ i ] ;
    }

    // Second pass: Process carries. This loop iterates through the 'a' array (the longer number's digits).
    // It propagates carries from right to left (least significant to most significant digit).
    // The loop runs up to the second-to-last digit because a carry from the last digit would
    // either create a new most significant digit or be added to an existing one.
    for ( var i = 0 ; i < a . length - 1 ; i ++ ) {
        // If a digit at the current position is 10 or greater, a carry is necessary.
        if ( a [ i ] >= 10 ) {
            // Calculate the carry amount (how many tens to carry over).
            var m = Math . floor ( a [ i ] / 10 ) ;
            // Update the current digit to its remainder after carrying.
            a [ i ] = a [ i ] % 10 ;
            // Add the carry to the next digit (at the higher place value).
            a [ i + 1 ] += m ;
        }
    }

    // Finally, reverse the array of digits back to the correct order (most significant digit first)
    // and join them into a single string to represent the final sum.
    return a . reverse ( ) . join ( '' ) ;

} // End of the sum function.