/*
 * This is a JavaScript program designed to process input data
 * and determine a specific index based on calculations.
 * It's a standard competitive programming template structure.
 */
function main ( input )
{
    // Trim leading/trailing whitespace from the entire input string.
    input = input.trim();


    // Parse the numerical values from the input string.
    // N: The count of elements in the array.
    const N = parseInt( input.split( " " )[ 0 ], 10 );
    // T: A temperature value.
    const T = parseInt( input.split( "\n" )[ 1 ].split( " " )[ 0 ], 10 );
    // A: Another temperature value.
    const A = parseInt( input.split( "\n" )[ 1 ].split( " " )[ 1 ], 10 );

    // arr: An array of numbers, parsed from the third line of input.
    const arr = input.split( '\n' )[ 2 ].split( ' ' ).map( ( n ) => parseInt( n, 10 ) );


    // Initialize an array to store calculated absolute differences.
    const tempArr = [];

    // Loop through each element of the 'arr' array.
    for ( var i = 0; i < N; i++ )
    {
        // Calculate the absolute difference between (T - arr[i] * 0.006) and A.
        var sa = Math.abs( ( T - arr[ i ] * 0.006 ) - A );
        // Add the calculated difference to tempArr.
        tempArr.push( sa );
    }

    // Find the minimum value within the tempArr.
    var min = Math.min.apply( null, tempArr );

    // Log the 1-based index of the first occurrence of the minimum value.
    console.log( tempArr.indexOf( min ) + 1 );

}

/*
 * This section handles reading input from standard input
 * and then calls the main function with that input.
 * It's typical for competitive programming environments.
 */
main( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );