/*
 * This function calculates the Greatest Common Divisor (GCD)
 * of two non-negative integers using the Euclidean algorithm.
 *
 * @param {number} a - The first integer.
 * @param {number} b - The second integer.
 * @returns {number} The GCD of a and b.
 */
function GCD ( a, b )
{
    // Initialize m and n based on the maximum and minimum of a and b.
    var m = Math.max( a, b );
    var n = Math.min( a, b );

    // The Euclidean algorithm loop.
    while ( n != 0 )
    {
        var N = n; // Store the current value of n.
        n = m % n; // Calculate the remainder.
        m = N;     // Update m with the previous n.
    }

    // m now holds the GCD.
    return m;
}

// --- Main program execution starts here ---

// Read the entire input from stdin as a UTF-8 string.
var input = require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' );

// Process the input:
// 1. Trim leading/trailing whitespace.
// 2. Split the input string by newline characters into an array of strings.
var Arr = ( input . trim() )
                 . split( "\n" );

// Iterate through each line (each test case) in the input array.
for ( var i = 0 ; i < Arr . length ; i++ )
{
    // For each line:
    // 1. Split the string by space.
    // 2. Convert each part to a Number.
    var arr = Arr[ i ] . split( " " ) . map( Number );

    // Calculate the GCD of the first two numbers in the current line.
    var gcd = GCD( arr[ 0 ] , arr[ 1 ] );

    // Calculate the simplified ratio of the first two numbers.
    // This effectively calculates (a/gcd) / (b/gcd) which is a/b in simplest form.
    var num = ( arr[ 0 ] / gcd ) / ( arr[ 1 ] / gcd );

    // Get the third number from the input array, which acts as a counter.
    var n = arr[ 2 ];

    // Initialize a sum variable for the current test case.
    var sum = 0;

    // Loop 'n' times (decrementing n in the condition).
    while ( n-- )
    {
        // Calculate the fixed-point representation of 'num' with 'n+2' decimal places.
        // Then, take the last two characters (the tenths and hundredths digits after the decimal point).
        var str = ( num . toFixed( n + 2 ) ) . slice( -2 );

        // Add the first character (the tenths digit) to the sum, converting it to a number.
        sum += ( str[ 0 ] - 0 );
    }

    // Output the calculated sum for the current test case.
    console.log( sum );
}

// --- End of program ---