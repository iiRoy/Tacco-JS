const config = {
    input: '/dev/stdin', // Path to the standard input device.
    newline: '\n'        // Character used to signify a new line in the input.
}; /* End of configuration object definition */


// Read all data from the specified input source,
// decode it as UTF-8, and then split it into an array of strings (lines).
const line = require('fs').readFileSync( config.input , 'utf-8' ).split( config.newline );


/**
 *  A utility function to create a point object with x and y coordinates.
 *
 *  @param {number} x - The horizontal coordinate.
 *  @param {number} y - The vertical coordinate.
 *  @returns {object} An object structured as { x: x, y: y }.
 */
const pos = (x, y) => {
    // Returns a new object representing a 2D point.
    return { x : x, y : y };
}; /* End of pos function */


/**
 *  This recursive function generates segments of a Koch curve.
 *  It divides a line segment (p1, p2) into four smaller segments,
 *  recursively applying the pattern to each new segment,
 *  unless the recursion depth 'n' reaches zero.
 *
 *  @param {object} p1 - The starting point of the current line segment.
 *  @param {object} p2 - The ending point of the current line segment.
 *  @param {number} n  - The current recursion depth.
 *  @returns {Array<object>} An array of points that form the fractal path.
 */
const div = ( p1 , p2 , n ) => {
    // Base case for the recursion: if depth is 0, return an empty array.
    if ( n === 0 )
    {
        return [ ];
    }

    // Pre-calculate cosine and sine for a 60-degree rotation (Math.PI / 3.0 radians).
    const cos = Math.cos(Math.PI / 3.0);
    const sin = Math.sin(Math.PI / 3.0);

    // Calculate the three intermediate points for the Koch curve construction.

    // Point 's': one-third of the way from p1 to p2.
    const s = pos( ( 2 * p1.x + p2.x ) / 3 , ( 2 * p1.y + p2.y ) / 3 );

    // Point 't': two-thirds of the way from p1 to p2.
    const t = pos( ( p1.x + 2 * p2.x ) / 3 , ( p1.y + 2 * p2.y ) / 3 );

    // Point 'u': the apex of the equilateral triangle formed on the middle third (s-t).
    // This is achieved by rotating the vector (t-s) by 60 degrees around point 's'.
    const u = pos( ( t.x - s.x ) * cos - ( t.y - s.y ) * sin + s.x
                 , ( t.x - s.x ) * sin + ( t.y - s.y ) * cos + s.y
                 );
    
    // Recursively generate the segments and concatenate them to form the complete path.
    return div( p1 , s , n - 1 )
               .concat( s ) // Add point 's' to the path.
               .concat( div( s , u , n - 1 ) )
               .concat( u ) // Add point 'u' to the path.
               .concat( div( u , t , n - 1 ) )
               .concat( t ) // Add point 't' to the path.
               .concat( div( t , p2 , n - 1 ) )
           ;
}; /* End of div function definition */


/*
 *  The main function to generate a complete Koch curve.
 *  It starts with a horizontal line segment from (0,0) to (100,0)
 *  and applies the fractal division 'n' times.
 *
 *  @param {number} n - The recursion depth for the Koch curve generation.
 *  @returns {Array<object>} An array of points representing the final Koch curve.
 */
const solve = (n) => {
    // Base case: If depth is 0, return the initial straight line segment.
    if (n === 0) {
        return [pos(0.0, 0.0), pos(100.0, 0.0)];
    }
    // For n > 0, generate the fractal points and include the start/end points.
    return [ pos( 0.0 , 0.0 ) ,
             ...div( pos( 0.0 , 0.0 ) , pos( 100.0 , 0.0 ) , n ) ,
             pos( 100.0 , 0.0 )
           ];
}; /* End of solve function */


// --- Main execution block begins here ---

// Parse the first line of input to get the recursion depth.
// Then, generate the Koch curve points using the 'solve' function.
solve( parseInt( line[0] ) )
    // Iterate over each point in the generated Koch curve.
    .forEach( p => {
        // Print the x and y coordinates of the current point,
        // formatted to 8 decimal places for precision.
        console.log( p.x.toFixed(8) , p.y.toFixed(8) );
    } );

// --- End of script ---