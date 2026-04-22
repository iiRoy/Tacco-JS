"use strict" ; // Enable strict mode for better error handling and cleaner code.


/*
 * This function calculates the greatest common divisor (GCD)
 * of all elements in a given array of numbers.
 * It uses the Euclidean algorithm recursively.
 */
const   gcdArray    =    ( array )    =>    {
    let    len ,    a ,    b ; // Declare variables for length, current GCD, and next element.


    len    =    array.length ; // Get the total number of elements in the array.
    a      =    array[ 0 ] ; // Initialize 'a' with the first element of the array.


    // Iterate through the array starting from the second element.
    for    (    let    i    =    1 ;    i    <    len ;    i++    )    {
        b    =    array[ i ] ; // Get the current element.
        a    =    getGcd( a ,    b ) ; // Update 'a' with the GCD of the current 'a' and 'b'.
    }


    return    a ; // Return the final GCD of all array elements.
} ;


/*
 * This is a helper function to calculate the greatest common divisor (GCD)
 * of two numbers using the Euclidean algorithm.
 * It's a recursive implementation.
 */
const    getGcd    =    ( a ,    b )    =>    {
    // If 'a' is not zero, recursively call getGcd with (b % a, a).
    // Otherwise, 'b' is the GCD.
    return    a    ?    getGcd( b    %    a ,    a )    :    b ;
} ;


/**
 * The main function that processes input and determines
 * if a certain condition is met based on GCD calculations.
 * @param {string} arg - The input string, typically from stdin.
 */
const    main    =    ( arg )    =>    {

    // Trim whitespace and split the input string by newlines into an array of lines.
    arg    =    arg.trim().split( "\n" ) ;


    // Parse the first line to get N and K.
    // N is not used in the current logic, but it's part of the input.
    const    N    =    parseInt( arg[ 0 ].split( " " )[ 0 ] ) ; // First number on the first line.
    const    K    =    parseInt( arg[ 0 ].split( " " )[ 1 ] ) ; // Second number on the first line.


    // Parse the second line: split by spaces, convert to numbers, and sort in descending order.
    let    A    =    arg[ 1 ].split( " " ).map( n => parseInt( n ) ).sort( ( a , b ) => b    -    a ) ;


    // Get the maximum value from the array A (which is the first element after sorting).
    const    max    =    A[ 0 ] ;

    // Calculate the GCD of all elements in array A.
    let    gcd    =    gcdArray( A ) ;


    // Check if the maximum value is less than K.
    // If it is, K cannot be formed by the elements, so it's impossible.
    if    (    max    <    K    )    {
        console.log( "IMPOSSIBLE" ) ; // Output "IMPOSSIBLE" to the console.
        return ; // Exit the function.
    }


    // If max >= K, then check if K is a multiple of the calculated GCD.
    // If K % gcd === 0, it's possible; otherwise, it's impossible.
    console.log( K    %    gcd    ===    0    ?    "POSSIBLE"    :    "IMPOSSIBLE" ) ;
} ;


// Read input from /dev/stdin and pass it to the main function.
main( require( 'fs' ).readFileSync( '/dev/stdin' ,    'utf8' ) ) ;