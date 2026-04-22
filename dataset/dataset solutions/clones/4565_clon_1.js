// Helper function to parse an integer from a string.
function pint( s )
{
    return parseInt( s );
}

// Helper function to parse a floating-point number from a string.
function pfloat( s )
{
    return parseFloat( s );
}


// Helper function to determine if a number is even.
function even( s )
{
    return ( s % 2 ) === 0;
}

// Helper function to determine if a number is odd.
function odd( s )
{
    return ( s % 2 ) === 1;
}


// Extends the Array prototype to sort numbers in ascending order.
Array.prototype.sortNumAsc = function ()
{
    return this.sort( ( a, b ) => ( a - b ) );
};


// Extends the Array prototype to sort numbers in descending order.
Array.prototype.sortNumDesc = function ()
{
    return this.sort( ( a, b ) => ( b - a ) );
};


// Extends the Array prototype to sort strings in ascending lexicographical order.
Array.prototype.sortStrAsc = function ()
{
    return this.sort();
};


// Extends the Array prototype to sort strings in descending lexicographical order.
Array.prototype.sortStrDesc = function ()
{
    return this.sort().reverse();
};


// Extends the Array prototype to return a new array with all occurrences of 'x' removed.
Array.prototype.without = function ( x )
{
    return this.filter( e => e !== x );
};


/**
 * The main function that processes input lines to solve a geometric problem.
 * It calculates the minimum difference between the largest and smallest area
 * when a rectangle of dimensions H x W is divided into three pieces.
 *
 * @param {string[]} lines - An array of strings, where the first string
 *                           contains two space-separated integers representing H and W.
 */
function main( lines )
{
    // Parse the first line of input to extract H (height) and W (width).
    // The input format is expected to be "H W".
    var a = lines[ 0 ]
                .split( ' ' )
                .map( pint );

    var H = a[ 0 ]; // Height of the initial rectangle
    var W = a[ 1 ]; // Width of the initial rectangle

    // Initialize 'min' to a very large value (positive infinity)
    // to ensure any calculated difference will be smaller.
    var min = Infinity;

    // Outer loop: Iterates through two possible orientations for the initial rectangle.
    // o = 0: (W, H) - width is T[0], height is T[1]
    // o = 1: (H, W) - height is T[0], width is T[1]
    for ( var o = 0; o < 2; o++ )
    {
        // Inner loop: Iterates through two ways of making the second cut.
        // This effectively considers different ways to divide the remaining area.
        for ( var t = 0; t < 2; t++ )
        {
            // Determine the current dimensions based on the orientation 'o'.
            // T[0] is the dimension being cut first, T[1] is the other dimension.
            var T = ( o === 0 ) ? [ W, H ] : [ H, W ];

            // Calculate the first cut along T[0].
            // X is approximately one-third of T[0].
            var X = Math.round( T[ 0 ] / 3 );
            // Y is the remaining part of T[0] after the first cut.
            var Y = T[ 0 ] - X;

            // Calculate the area of the first piece.
            // This piece has dimensions X by T[1].
            var a = X * T[ 1 ];

            // Determine the dimensions for the remaining area (U) after the first cut.
            // U[0] will be Y or T[1], U[1] will be T[1] or Y, depending on 't'.
            var U = ( t === 0 ) ? [ Y, T[ 1 ] ] : [ T[ 1 ], Y ];

            // Calculate the second cut along U[0].
            // Z is approximately half of U[0].
            var Z = Math.round( U[ 0 ] / 2 );
            // A is the remaining part of U[0] after the second cut.
            var A = U[ 0 ] - Z;

            // Calculate the areas of the second and third pieces.
            // These pieces are formed from the remaining area U.
            var b = Z * U[ 1 ]; // Area of the second piece
            var c = A * U[ 1 ]; // Area of the third piece

            // Store the three calculated areas in an array and sort them in descending order.
            var m = [ a, b, c ].sortNumDesc();

            // Update the minimum difference found so far.
            // The difference is between the largest (m[0]) and smallest (m[2]) area.
            min = Math.min( min, ( m[ 0 ] - m[ 2 ] ) );
        }
    }

    // Output the final minimum difference to the console.
    console.log( min );
}


// Reads input from standard input, processes each line by trimming whitespace,
// and then calls the 'main' function with the processed lines.
main( require( "fs" )
            .readFileSync( "/dev/stdin", "utf8" )
            .split( '\n' )
            .map( l => l.trim() )
);