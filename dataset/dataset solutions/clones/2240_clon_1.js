"use strict" /* This directive enforces strict parsing and error handling in the code. */

/*
 * This is the main function of the program.
 * It takes a single string argument 's', which is expected to be the raw input.
 */
function Main( s )
{
    // First, the input string 's' is split into an array of strings based on newline characters.
    s = s.split( '\n' ) ;

    // The first element of the split array 's' is converted to a Number and assigned to 'n'.
    let n = Number( s[ 0 ] ) ;

    // A new array 'robos' is created by taking a slice of 's' from the second element
    // up to, but not including, the last element.
    const robos = s.slice( 1, s.length ) ;


    // The 'robos' array is sorted in place. The sorting criteria are based on
    // the first number found in each string element.
    // If the first number of 'a' is less than that of 'b', 'a' comes before 'b'.
    const sort = robos.sort( ( a, b ) => Number( a.split( ' ' )[ 0 ] ) < Number( b.split( ' ' )[ 0 ] ) ? -1 : 1 ) ;

    // An empty array named 'range' is initialized. This array will be used to store calculated ranges.
    let range = [ ] ;

    // A for loop iterates through the 'sort' array, which contains the sorted robo data.
    for ( let i = 0 ; i < robos.length ; ++i )
    {
        // For each item in the sorted array, the first number (x-coordinate) is extracted.
        const x = Number( sort[ i ].split( ' ' )[ 0 ] ) ;

        // The second number (length 'l') is extracted from the same item.
        const l = Number( sort[ i ].split( ' ' )[ 1 ] ) ;

        // The minimum point of the current robo's influence range is calculated.
        const min = x - l ;

        // The maximum point of the current robo's influence range is calculated.
        const max = x + l ;

        // A conditional check is performed: if the maximum value in 'range' (considering 'null' as 0)
        // is greater than or equal to the current 'min' value.
        // Note: Math.max(null, array) behavior can be tricky; with empty array it's 0, with multiple numbers it's NaN.
        if ( Math.max( null, range ) >= min )
        {
            // If the condition is true, both 'min' and 'max' are added to the 'range' array.
            range.push( min, max ) ;

            // The counter 'n' is decremented by one.
            n = n - 1 ;
        }
    }

    // Finally, the calculated value of 'n' is printed to the console.
    console.log( n ) ;
}

// The Main function is called with input read from the standard input stream.
// This is typical for competitive programming environments.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;