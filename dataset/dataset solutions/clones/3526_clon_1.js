/*
 * This JavaScript code processes input data.
 * The entire input content is passed to the Main function.
 * It's designed to solve a specific problem involving coordinate comparisons.
 */
function Main(  input ) {

    // The input string is split into an array of lines.
    // The first line will be at input[0], the second at input[1], and so on.
    input = input .split( "\n" ) ;


    // Extracting and splitting the first three lines of input.
    // These lines likely contain numeric values separated by spaces.
    lineTop = input[0] .split( " " ) ;
    lineX   = input[1] .split( " " ) ;
    lineY   = input[2] .split( " " ) ;


    // Convert string representations of numbers to integers (base 10).
    // This is crucial for performing numerical comparisons and calculations.
    var n = parseInt( lineTop[0], 10 );
    var m = parseInt( lineTop[1], 10 );
    var x = parseInt( lineTop[2], 10 );
    var y = parseInt( lineTop[3], 10 );


    // Initial condition check: If x is greater than or equal to y,
    // a "War" state is declared immediately, and the program exits.
    if ( x >= y )
    {
        console.log( 'War' ) ;
        return ;
    }


    // Initialize maxX with the initial x value and minY with the initial y value.
    // These will be used to find the maximum x-coordinate and minimum y-coordinate.
    var maxX = x ;
    var minY = y ;


    // Iterate through the elements of lineX to find the maximum x-coordinate.
    // Each 'work' element is a string, so it's parsed to an integer for comparison.
    for ( var work of lineX )
    {
        if ( parseInt( work ) > parseInt( maxX ) )
        {
            maxX = work ; // Update maxX if a larger value is found.
        }
    }


    // Iterate through the elements of lineY to find the minimum y-coordinate.
    // Each 'work' element is a string, so it's parsed to an integer for comparison.
    for ( var work of lineY )
    {
        if ( parseInt( work ) < parseInt( minY ) )
        {
            minY = work ; // Update minY if a smaller value is found.
        }
    }


    // Final comparison to determine the outcome.
    // If the minimum y-coordinate is greater than or equal to the maximum x-coordinate, it's "War".
    // Otherwise, it's "No War".
    if ( minY >= maxX )
    {
        console.log( 'War' ) ;
    }
    else
    {
        console.log( 'No War' ) ;
    }

} /* End of Main function definition */


/*
 * The following line should not be modified.
 * It handles reading input from standard input and invoking the Main function.
 */
Main( require( "fs" ) .readFileSync( "/dev/stdin", "utf8" ) ) ;