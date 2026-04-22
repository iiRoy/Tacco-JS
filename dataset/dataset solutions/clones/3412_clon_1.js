/*
 * This JavaScript function, named Main, is designed to process
 * a given input string, typically representing data from standard input.
 * It performs a series of operations to calculate a specific sum.
 */
function Main ( input )
{
    // The input string is first split by newline characters.
    // The first line is extracted and stored in the variable 'N'.
    // 'N' might represent the count of subsequent data items,
    // though its value is not directly used in the final sum calculation.
    var N = input.split( '\n' )[ 0 ];


    // The entire input string is split by newlines again,
    // and the resulting array of lines is assigned to 'p'.
    var p = input.split( '\n' );


    // The first element of the array 'p' is removed.
    // This typically corresponds to the 'N' value already extracted,
    // or a header line that is not part of the data to be summed.
    p.shift();


    // Each remaining element in the array 'p' (which are strings)
    // is converted into an integer using 'parseInt'.
    // The 'map' function applies this conversion to all elements.
    p = p.map( v => parseInt( v ) );


    // The maximum value among the integers in array 'p' is found.
    // The spread operator '...' is used to pass all elements of 'p'
    // as individual arguments to 'Math.max'.
    var max = Math.max( ...p );


    // The first occurrence of the maximum value is removed from the array 'p'.
    // 'indexOf(max)' finds its position, and 'splice' removes one element at that position.
    p.splice( p.indexOf( max ), 1 );


    // A variable 'sum' is initialized to zero.
    // This variable will accumulate the sum of the remaining elements.
    var sum = 0;


    // The 'forEach' method is used to iterate over the modified array 'p'.
    // For each value 'v' in 'p', it is added to the 'sum'.
    p.forEach( v => sum += v );


    // Finally, half of the previously found maximum value ('max')
    // is added to the total 'sum'.
    sum += max / 2;


    // The final calculated sum is floored (rounded down to the nearest integer)
    // and then printed to the console.
    console.log( Math.floor( sum ) );

} // End of the Main function definition.


// -----------------------------------------------------------------------------
// This part of the code is responsible for reading input from standard input
// and invoking the 'Main' function.
// In typical competitive programming setups, this section should remain untouched.
// It uses Node.js 'fs' module to synchronously read the entire content
// of '/dev/stdin' (standard input) as a UTF-8 encoded string.
// -----------------------------------------------------------------------------
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );