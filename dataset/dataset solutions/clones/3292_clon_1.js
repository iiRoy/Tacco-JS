'use strict' ; // Enable strict mode for cleaner code.

// --- Standard Input Processing Setup ---

process.stdin .resume ( ) ; // Resume stdin to prevent it from exiting.
process.stdin.setEncoding ( 'utf8' ) ; // Set the encoding to UTF-8 for proper character handling.


/*
 * This section defines utility functions for finding
 * maximum and minimum values in an array.
 * These are general-purpose helpers.
 */

const max = ( a ) => { // Function to find the maximum value in an array 'a'.
    let i = a.length ; // Initialize index 'i' with the array's length.
    let max = -Infinity ; // Initialize 'max' with negative infinity to ensure any array element is larger.

    while ( i-- ) { // Loop backwards through the array.
        if ( a [ i ] > max ) // If the current element is greater than the current max...
            max = a [ i ] ; // ...update max.
    }
    return max ; // Return the greatest value found.
} ; // End of max function definition.


const min = ( a ) => { // Function to determine the minimum value within an array.
    let i = a . length ; // 'i' is set to the total number of elements.
    let max = Infinity ; // 'max' (confusing name, but must keep it as per Type I rule) is set to positive infinity.

    while ( i-- ) { // Iterate downwards from the last index to the first.
        if ( a [ i ] < max ) { // Check if the current element is smaller than the current minimum.
            max = a [ i ] ; // If so, update the minimum.
        }
    }
    return max ; // Return the smallest element identified.
} ; // End of min function.


/*
 * The primary application logic resides within the 'Main' function.
 * It processes input, performs calculations, and outputs results.
 */
const Main = ( p ) => { // The main function accepting input 'p'.

    // Input 'p' is a single string containing multiple lines,
    // so we split it by newline characters to get an array of lines.
    p = p . split ( "\n" ) ;

    // Parse the first line to get the value of N.
    // The original code had commented-out alternatives, which we'll keep modified.
    // let N_from_first_space_separated_part = parseInt(p[0].split(" ")[0]);
    let N = parseInt ( p [ 0 ] ) ; // N represents the number of elements or steps.
    // let M_from_first_line_second_part = parseInt(p[0].split(" ")[1]);

    // Parse the second line to get an array of numbers 'h'.
    let h = ( p [ 1 ] . split ( " " ) . map ( Number ) ) ; // 'h' contains heights or costs.

    let i = N ; // Initialize a loop counter 'i'.

    /*
     * This commented block was for randomizing 'h' values,
     * but it's currently inactive.
     *
     * while(i--){
     *     h[i] = Math.floor(Math.random() * 100);
     * }
     */

    // Initialize an array 'c' of size N, filled with Infinity.
    // 'c' will store minimum costs to reach each position.
    let c = new Array ( N ) . fill ( Infinity ) ;

    console . log ( h ) ; // Output the initial 'h' array for debugging or tracing.


    // Base cases for the cost array 'c'.
    c [ 0 ] = 0 ; // Cost to reach the first position (index 0) is 0.
    c [ 1 ] = Math . abs ( h [ 0 ] - h [ 1 ] ) ; // Cost to reach position 1 from position 0.


    // Dynamic programming loop to calculate minimum costs.
    for ( i = 2 ; i < N ; i++ ) { // Iterate from the third position (index 2) up to N-1.
        // Calculate cost to reach current position 'i' from 'i-2' or 'i-1'.
        // Take the minimum of these two paths.
        c [ i ] = Math . min ( c [ i - 2 ] + Math . abs ( h [ i ] - h [ i - 2 ] ) , // Path from i-2
                             c [ i - 1 ] + Math . abs ( h [ i ] - h [ i - 1 ] ) ) ; // Path from i-1
    }

    // A reminder that parseInt is used for string-to-integer conversion.
    // 文字列から10進数に変換するときはparseIntを使います - this comment is from the original.

    // Output the complete cost array 'c' and the final minimum cost to reach N-1.
    console . log ( c , c [ N - 1 ] ) ;

} ; // End of Main function definition.


/*
 * This segment handles the execution of the Main function.
 * It reads input from standard input, processes it, and then calls Main.
 * DO NOT MODIFY THE CODE BEYOND THIS POINT in competitive programming contexts.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ; // Call Main with processed stdin content.