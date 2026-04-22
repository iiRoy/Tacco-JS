/* This program calculates a specific value based on numerical input.
 * It's a demonstration of a Type I code clone,
 * where only whitespace and comments are altered.
 */

// Define the main function that processes the input
function main ( input ) {
    // Split the entire input string into an array of individual lines
    const inputs = input.split( '\n' );

    // Extract the first line, split it by space, and convert parts to numbers.
    // N represents a total capacity or limit.
    // M represents a count (though it is not used in subsequent logic).
    const [ N , M ] = inputs[ 0 ] .split( ' ' ) .map( Number ) ;

    // Extract the second line, split it by space, and convert parts to numbers.
    // This forms an array 'Ai' containing item values.
    const Ai = inputs[ 1 ] .split( ' ' ) .map( Number ) ;

    // Calculate the sum of all elements in the 'Ai' array using the reduce method.
    // 'h' is the accumulator (current sum), 'e' is the current element.
    const sum = Ai .reduce ( ( h , e ) => {
        return h + e ; // Add the current element 'e' to the accumulator 'h'
    } , 0 ) ; // Start the accumulation from an initial value of 0

    // Determine the final output based on the comparison of N and sum.
    // If N minus sum is negative, output -1.
    // Otherwise, output N minus sum.
    console.log(
        N - sum < 0
            ? -1 // Result if N - sum is negative
            : N - sum // Result if N - sum is non-negative
    ) ;

} // End of the main function definition.

// The following code block handles reading input and calling the main function.
// It uses Node.js's 'fs' module to read from standard input.
main(
    require ( "fs" )
        . readFileSync ( "/dev/stdin" , "utf8" )
) ;
// End of the entire script.