// Defines a constructor function for a 2D Vector object.
function Vector ( x , y )
{
    // Assigns the provided x-coordinate to the vector instance.
    this.x = x ;

    // Assigns the provided y-coordinate to the vector instance.
    this.y = y ;
}

// Adds a 'sub' method to the Vector prototype for vector subtraction.
Vector .prototype .sub = function ( v )
{
    // Returns a new Vector object, representing the result of subtracting vector 'v' from the current vector.
    return new Vector( this.x - v.x , this.y - v.y );
};

// Adds a 'product' method (representing the 2D cross product, which is a scalar) to the Vector prototype.
Vector .prototype .product = function ( v )
{
    // Calculates and returns the scalar cross product value: (this.x * v.y) - (this.y * v.x).
    return this.x * v.y - this.y * v.x ;
};


// This is an Immediately Invoked Function Expression (IIFE).
// It takes the raw input string as its argument and processes it.
( function ( input )
{
    // Prepares the input: removes a potential trailing newline character, then splits the string into an array of lines.
    var line = input.replace( /\n$/ , '' ) .split( '\n' );

    // Continues processing as long as there are lines remaining in the 'line' array.
    while ( line .length > 0 )
    {
        // Retrieves the first line from the array, splits it by spaces, and converts each resulting string part into a number.
        // This 'p' array now holds all numerical coordinates for the current test case.
        var p = line .shift() .split( ' ' ) .map( Number );


        // Creates three Vector objects (v1, v2, v3) representing the vertices of a triangle,
        // by sequentially extracting coordinate pairs from the 'p' array.
        var v1 = new Vector( p .shift() , p .shift() );
        var v2 = new Vector( p .shift() , p .shift() );
        var v3 = new Vector( p .shift() , p .shift() );

        // Creates a Vector object for the test point 'p', using the remaining coordinates from the 'p' array.
        var p = new Vector( p .shift() , p .shift() );


        // Calculates several intermediate vectors:
        // v12: Vector from v1 to v2.
        var v12 = v2 .sub( v1 );
        // v2p: Vector from v2 to the test point p.
        var v2p = p .sub( v2 );

        // v23: Vector from v2 to v3.
        var v23 = v3 .sub( v2 );
        // v3p: Vector from v3 to the test point p.
        var v3p = p .sub( v3 );

        // v31: Vector from v3 to v1.
        var v31 = v1 .sub( v3 );
        // v1p: Vector from v1 to the test point p.
        var v1p = p .sub( v1 );


        // Computes the cross products to determine the orientation of the test point 'p' relative to each edge of the triangle.
        // c1: Orientation of p with respect to edge (v1, v2).
        var c1 = v12 .product( v2p );
        // c2: Orientation of p with respect to edge (v2, v3).
        var c2 = v23 .product( v3p );
        // c3: Orientation of p with respect to edge (v3, v1).
        var c3 = v31 .product( v1p );


        // Determines if the point 'p' lies strictly inside the triangle (v1, v2, v3).
        // This condition is met if all three cross products have the same sign (all positive or all negative),
        // indicating that 'p' is consistently on the same side of all triangle edges.
        if ( ( c1 > 0 && c2 > 0 && c3 > 0 ) || ( c1 < 0 && c2 < 0 && c3 < 0 ) )
        {
            // If the point is inside the triangle, output 'YES'.
            console .log( 'YES' );

            // Proceeds to the next iteration of the loop to process the next line of input.
            continue;
        }

        // If the point is not strictly inside the triangle (e.g., outside or on an edge), output 'NO'.
        console .log( 'NO' );
    }

// Reads the entire content of '/dev/stdin' as a UTF-8 string synchronously,
// and passes it as the 'input' argument to the IIFE.
} ) ( require( 'fs' ) .readFileSync( '/dev/stdin' , 'utf8' ) );