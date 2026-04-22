/*
 * This JavaScript file processes numerical input to calculate
 * properties of a triangle given two sides and the included angle.
 *
 * It reads input from standard in, processes it, and prints the
 * calculated area, perimeter, and height to standard out.
 */

/**
 * The primary function that performs the triangle calculations.
 * @param {string[]} lines - An array of strings, where the first element
 *                           contains space-separated numerical values.
 */
function main( lines )
{
    // Parse the input line to extract the three numerical values.
    // The first line of input is expected to contain 'a', 'b', and 'deg'
    // separated by one or more whitespace characters.
    var nums = lines[ 0 ] . split( /\s+/ );

    // Extract side 'a', side 'b', and the angle 'deg' (in degrees)
    // from the parsed numbers.
    var a   = parseFloat( nums[ 0 ] );
    var b   = parseFloat( nums[ 1 ] );
    var deg = parseFloat( nums[ 2 ] );


    // Convert the angle from degrees to radians, as trigonometric functions
    // in JavaScript (and most programming languages) expect radians.
    var rad = deg * Math.PI / 180;

    // Calculate the third side 'c' of the triangle using the Law of Cosines.
    // c^2 = a^2 + b^2 - 2ab*cos(rad)
    var c   = Math.sqrt( Math.pow( a, 2 ) + Math.pow( b, 2 ) - 2 * a * b * Math.cos( rad ) );


    // Calculate the area of the triangle using the formula:
    // Area = (1/2) * a * b * sin(rad)
    var area      = a * b * Math.sin( rad ) / 2.0;

    // Calculate the perimeter of the triangle by summing all three sides.
    var perimeter = a + b + c;

    // Calculate the height 'h' relative to side 'a'.
    // Area = (1/2) * base * height => height = 2 * Area / base
    var h         = 2 * area / a;

    // Output the calculated values (area, perimeter, height)
    // formatted to 6 decimal places, separated by spaces.
    console.log( [
        area . toFixed( 6 ),
        perimeter . toFixed( 6 ),
        h . toFixed( 6 ),
    ] . join( ' ' ) );
}


// Initialize an array to store incoming data chunks from standard input.
var chunks = [ ];

// Event listener for 'data' events on standard input.
// Each time data is received, append it to the 'chunks' array.
process . stdin . on( 'data', function( chunk )
{
    chunks . push( chunk )
} );

// Event listener for the 'end' event on standard input.
// This signifies that all input data has been received.
process . stdin . on( 'end', function( )
{
    // Join all received chunks into a single string.
    // Then, split the string by newline characters to get an array of lines.
    var lines = chunks . join( '' ) . split( '\n' );

    // Call the main function with the processed input lines.
    main( lines );
} );