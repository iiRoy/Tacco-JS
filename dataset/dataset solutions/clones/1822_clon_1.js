"use strict" ; /* This directive enables strict mode for the entire script, helping to catch common coding errors and "unsafe" actions. */

function main ( arg ) {
    // This function processes the input argument to calculate a specific sum.
    // The input 'arg' is expected to be a string containing numbers separated by newlines and spaces.

    const input = arg . trim ( ) . split ( "\n" ) ; // First, remove leading/trailing whitespace, then split the input string by newline characters into an array of strings.

    const N = Number ( input . shift ( ) ) ; // The first element of the input array is treated as the count 'N'. It's removed from the array and converted to a number.

    const A = input . map ( x => Number ( x . split ( " " ) [ 0 ] ) ) ; // For each remaining line, split by space, take the first part, and convert it to a number. This forms array A.

    const B = input . map ( x => Number ( x . split ( " " ) [ 1 ] ) ) ; // Similarly, for each remaining line, split by space, take the second part, and convert it to a number. This forms array B.

    let a , b , sum ; // Declare three variables that will hold intermediate calculations and the final result.

    if ( N % 2 ) { // Check if N is an odd number. The modulo operator (%) returns the remainder of a division.
        // If N is odd, we are looking for a single median element.
        const id0 = parseInt ( ( N + 1 ) / 2 ) - 1 ; // Calculate the zero-based index for the median element. (N+1)/2 gives the 1-based median position. Subtract 1 for 0-based index.
        a = A [ id0 ] ; // Get the 'a' value at the median index.
        b = B [ id0 ] ; // Get the 'b' value at the median index.
        sum = b - a + 1 ; // The sum is calculated based on the difference between 'b' and 'a', plus one.
    }

    else { // If N is an even number.
        // If N is even, we are looking for two central elements to calculate a median range.
        const id0 = parseInt ( N / 2 ) - 1 ; // Calculate the zero-based index for the first central element (N/2 is the 1-based position, subtract 1).
        const id1 = parseInt ( N / 2 + 1 ) - 1 ; // Calculate the zero-based index for the second central element (N/2+1 is the 1-based position, subtract 1).

        a = ( A [ id0 ] + A [ id1 ] ) / 2 ; // 'a' is the average of the two central 'A' values.
        b = ( B [ id0 ] + B [ id1 ] ) / 2 ; // 'b' is the average of the two central 'B' values.

        sum = ( b - a ) * 2 + 1 ; // The sum is calculated using the difference of the averages, multiplied by 2, then plus one.
    } // End of the conditional block for N parity.

    console . log ( sum ) ; // Finally, the calculated 'sum' is printed to the console.
} // End of the main function definition.

main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // This line calls the 'main' function. It reads the entire content of standard input (/dev/stdin) as a UTF-8 string and passes it as the 'arg' parameter.