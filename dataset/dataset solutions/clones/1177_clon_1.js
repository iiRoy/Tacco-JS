/*
 * This file contains a JavaScript program designed to calculate
 * the standard deviation of a series of numbers provided via standard input.
 * It reads input line by line, processes numerical data, and outputs results.
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 */
( function( input ) {

        // Split the entire input string by newline character to get an array of lines.
        var p = input . split( '\n' );

        // Begin an infinite loop to process multiple test cases until a specific condition is met.
        while ( true ) {

            /*
             * Extract the first line, which represents the count of numbers for the current test case.
             * Convert it to a numerical type.
             */
            var n = Number( p . shift() );

            // If n is 0, it signifies the end of input, so terminate the program.
            if ( n === 0 ) {
                return;
            }

            // Extract the next line, which contains the numbers for the current test case.
            // Split them by space, convert each part to a number, and store in array 's'.
            var s = p . shift() . split( ' ' , n ) . map( Number ) ;

            // Calculate the standard deviation of the array 's' and print it to the console.
            console . log( standardDeviation( s ) ) ;
        }

    }

)(
    // Read the entire content of standard input as a UTF-8 string.
    require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' )
);


/*
 * Function to calculate the arithmetic mean (average) of an array of numbers.
 * @param {Array<number>} a - An array of numbers.
 * @returns {number} The mean of the numbers in the array.
 */
function mean( a ) {
    return a . reduce( function( a , b ) {

        return a + b ;

    } ) / a . length ;
}


/*
 * Function to calculate the variance of an array of numbers.
 * Variance measures how far a set of numbers is spread out from their average value.
 * @param {Array<number>} a - An array of numbers.
 * @returns {number} The variance of the numbers in the array.
 */
function variance( a ) {

    // First, calculate the mean of the array.
    var m = mean( a ) ;

    // Initialize variance accumulator.
    var v = 0 ;

    // Iterate over each element to sum the squared differences from the mean.
    a . forEach( function( e ) {

        v += Math . pow( e - m , 2 ) / a . length ;

    } ) ;

    // Return the calculated variance.
    return v ;
}


/*
 * Function to calculate the standard deviation of an array of numbers.
 * Standard deviation is the square root of the variance.
 * @param {Array<number>} a - An array of numbers.
 * @returns {number} The standard deviation of the numbers in the array.
 */
function standardDeviation( a ) {
    // Simply return the square root of the variance.
    return Math . sqrt( variance( a ) ) ;
}