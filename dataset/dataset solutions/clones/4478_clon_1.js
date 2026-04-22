"use strict" ; // Enforce strict mode for better error handling and performance.

/*
 * This is the main entry point for the program.
 * It takes a single argument, which is expected to be the raw input string.
 *
 * @param {string} arg - The raw input data, typically read from standard input.
 */
const   main   =   arg   =>   {
    // First, process the input string:
    // 1. Remove any leading or trailing whitespace using .trim().
    // 2. Split the string into an array of lines based on the newline character.
    arg   =   arg . trim ( ) . split ( "\n" ) ;

    // Parse the first line of the input as an integer.
    // This value, N, often represents the number of elements or some other problem constraint.
    const   N   =   parseInt ( arg [ 0 ] ) ;

    // Parse the second line of the input.
    // 1. Split the string by spaces to get an array of number strings.
    // 2. Use .map() to convert each string in the array to an integer.
    const   A   =   arg [ 1 ] . split ( " " ) . map ( n => parseInt ( n ) ) ;

    // Calculate the total sum of all elements in the array A.
    // The .reduce() method is used for this, accumulating the sum.
    const   totalSum   =   A . reduce ( ( m , n ) => m + n ) ;

    // Initialize 'left' with the value of the first element of array A.
    // This represents the sum of elements on the "left" side of a conceptual split.
    let   left    =   A [ 0 ] ;
    // Initialize 'right' with the total sum minus the first element.
    // This represents the sum of elements on the "right" side of the split.
    let   right   =   totalSum   -   A [ 0 ] ;

    // Initialize 'answer' to Infinity.
    // This ensures that any valid difference calculated later will be smaller
    // and will correctly update the 'answer' variable.
    let   answer   =   Infinity ;

    // Iterate through the array A using a 'for...in' loop.
    // Note: 'for...in' iterates over property names (indices in this case) as strings.
    // For array iteration, 'for...of' or a traditional 'for' loop is often preferred,
    // but the original code uses 'for...in' and converts the index to an integer.
    for ( let   i   in   A )   {
        // Calculate the absolute difference between the 'right' and 'left' sums.
        // This is the current difference for the current split point.
        let   diff   =   Math . abs ( right   -   left ) ;
        // Update 'answer' if the current 'diff' is smaller than the current 'answer'.
        answer   =   Math . min ( answer , diff ) ;

        // These next two lines simulate moving the split point one position to the right.
        // The element A[parseInt(i) + 1] is effectively moved from the 'right' partition
        // to the 'left' partition.
        // We need to convert 'i' to an integer because 'for...in' provides it as a string.
        right   -=   A [ parseInt ( i )   +   1 ] ; // Subtract the element from the right sum.
        left    +=   A [ parseInt ( i )   +   1 ] ; // Add the element to the left sum.
    }

    // After iterating through all possible split points, print the minimum difference found.
    console . log ( answer ) ;
}

// This line reads the input from standard input (/dev/stdin) synchronously.
// It uses Node.js's 'fs' module to read the file content as a UTF-8 string.
// The read content is then passed as an argument to the 'main' function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Execute the main function.