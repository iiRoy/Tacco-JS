( function( input ) {

// Process the input string
var p = input.replace( /\n$/, '' ).split( '\n' );

// Get the number of test cases from the first line
var n = Number( p.shift() );

// Loop through each test case
for ( var i = 0; i < n; i++ ) {

    // Parse arguments for the current test case
    var args = p[ i ].split( ' ' ).map( Number );

    // Extract coordinates for three points (x1, y1), (x2, y2), (x3, y3)
    var x1 = args.shift();
    var y1 = args.shift();
    var x2 = args.shift();
    var y2 = args.shift();
    var x3 = args.shift();
    var y3 = args.shift();

    // Calculate the x-coordinate of the circumcenter
    // This formula is derived from the perpendicular bisector equations of two chords
    var x = ( ( Math.pow( x3, 2 ) - Math.pow( x2, 2 ) + Math.pow( y3, 2 ) - Math.pow( y2, 2 ) ) * ( y2 - y1 )
            - ( Math.pow( x2, 2 ) - Math.pow( x1, 2 ) + Math.pow( y2, 2 ) - Math.pow( y1, 2 ) ) * ( y3 - y2 ) )
            / 2 / ( ( y2 - y1 ) * ( x3 - x2 ) - ( x2 - x1 ) * ( y3 - y2 ) );

    // Calculate the y-coordinate of the circumcenter
    // Similar derivation for the y-coordinate
    var y = ( ( Math.pow( y3, 2 ) - Math.pow( y2, 2 ) + Math.pow( x3, 2 ) - Math.pow( x2, 2 ) ) * ( x2 - x1 )
            - ( Math.pow( y2, 2 ) - Math.pow( y1, 2 ) + Math.pow( x2, 2 ) - Math.pow( x1, 2 ) ) * ( x3 - x2 ) )
            / 2 / ( ( x2 - x1 ) * ( y3 - y2 ) - ( y2 - y1 ) * ( x3 - x2 ) );

    // Calculate the radius of the circumcircle
    // It's the distance from the circumcenter (x, y) to any of the three points, e.g., (x1, y1)
    var radius = Math.sqrt( Math.pow( x1 - x, 2 ) + Math.pow( y1 - y, 2 ) );

    // Output the circumcenter coordinates (x, y) and the radius, all formatted to 3 decimal places
    console.log( x.toFixed( 3 ), y.toFixed( 3 ), radius.toFixed( 3 ) );
}

} )( require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ) );
// End of the self-executing anonymous function