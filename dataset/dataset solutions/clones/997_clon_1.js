/*
 * This is an Immediately Invoked Function Expression (IIFE).
 * It encapsulates the core logic to prevent global scope pollution.
 * The 'input' parameter will receive the content read from standard input.
 */
( function( input ) {

    // Declare a variable 'p' to store processed input.
    // The input string is first split by newline characters, creating an array of strings.
    // Then, the map(Number) function converts each string element in the array to a numeric type.
    var p = input . split( '\n' ) . map( Number );

    // 'n' represents the first element of the processed input, which is expected to be
    // the count of subsequent numbers we need to consider.
    // The shift() method removes the first element from the 'p' array and returns it,
    // effectively separating the count from the actual data.
    var n = p . shift( );


    /*
     * 'a' will hold the array of numbers that we need to analyze.
     * It's a slice of 'p' from index 0 up to 'n' elements.
     * This ensures that we only work with the specified number of data points,
     * discarding any potential extra lines in the input beyond 'n' numbers.
     */
    var a = p . slice( 0, n );


    // Initialize 'max' to negative infinity.
    // This is a common practice when looking for a maximum value, as any valid
    // difference (profit) found will inherently be greater than -Infinity.
    var max = -Infinity;

    // Outer loop: This loop iterates through each element 'i' in the array 'a'.
    // In the context of a stock trading problem, 'a[i]' could represent a "buy price".
    for ( var i = 0 ; i < a . length ; i ++ )
    {
        // Inner loop: This loop iterates through elements 'j' that come *after* 'i' in the array.
        // This is crucial because a "sell price" (a[j]) must occur after a "buy price" (a[i]).
        // The loop starts from 'i + 1' to ensure 'j' is always ahead of 'i'.
        for ( var j = i + 1 ; j < a . length ; j ++ )
        {
            // Conditional check: We calculate the difference between the current sell price 'a[j]'
            // and the current buy price 'a[i]'.
            // If this difference is greater than the 'max' difference found so far,
            // it means we've found a new, better profit opportunity.
            if ( ( a[j] - a[i] ) > max )
            {
                // Update 'max': If the current profit is higher, we store it in 'max'.
                max = a[j] - a[i]; // Assign the new maximum profit.
            }
        } // End of inner loop (j)
    } // End of outer loop (i)

    // Output the final calculated maximum difference to the console.
    // This value represents the greatest profit that could be made by buying and selling
    // a stock once, given the sequence of prices in array 'a'.
    console . log( max );

} ) (
    // This part of the IIFE immediately executes the function with its argument.
    // It reads the entire content of standard input synchronously.
    // 'require('fs')' imports the Node.js file system module.
    // '.readFileSync('/dev/stdin', 'utf8')' reads the file '/dev/stdin' (standard input)
    // and decodes it as a UTF-8 string, which is then passed as the 'input' argument.
    require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' )
) ;