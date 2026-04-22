/*
 *  This file calculates the area of a polygon given its vertices.
 *  The problem statement can be found here:
 *  http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=0079
 *
 *  Current status: Implemented and tested with sample cases.
 *
 *  Detailed comments:
 *  The algorithm uses the shoelace formula, specifically by triangulating the polygon
 *  into triangles with a common vertex (p0) and summing their signed areas.
 *  The final sum is then divided by 2 to get the polygon's area.
 *  Special care is taken for output formatting to ensure exactly one decimal place.
 */

var log = console.log; /* Alias console.log for brevity */

// Check if running in a Node.js-like environment to handle input
if (typeof process != "undefined") {
    var input = "";
    process.stdin.resume(); // Keep the process alive
    process.stdin.setEncoding('utf8'); // Set encoding for input stream
    process.stdin.on('data', function (chunk) {
        input += chunk; // Accumulate input data
    });
    process.stdin.on('end', function () {
        var lines = input.split("\n"); // Split input into individual lines
        main(lines); // Call the main processing function
    });
}


function main ( lines ) {
    // Process input lines: split by space, filter empty strings, convert to numbers
    lines = lines . map ( function ( line ) {
        return line . split ( " " ) . filter ( function ( e ) {
            return e != ""; // Remove empty strings that might result from multiple spaces
        } ) . map ( function ( e ) {
            var n = Number ( e ) ; // Attempt to convert to a number
            if ( n . toString ( ) == "NaN" ) {
                // If conversion fails, it might be a newline character
                return e . replace ( / ( \r ) | ( \n ) /g , "" ) ; // Clean up newlines/carriage returns
            }
            return n ; // Return the number
        } ) ;
    } ) ;

    lines . shift ( ) ; // The first line typically contains the number of points, which is not needed here as we process until end of input.
    var points = lines ; // The remaining lines are the coordinates of the polygon vertices.
    // points.reverse(); // This line was commented out in the original, keeping it that way.


    log ( points ) ; // Log the parsed points for debugging

    var p0 = points [ 0 ] ; // The first point is chosen as the reference vertex for triangulation
    var ps , pe ; // Variables to hold current and next points in the loop
    var S = 0 ; // Accumulator for the sum of signed areas of triangles
    var length = points . length ; // Total number of points in the polygon

    // Loop through the points, forming triangles with p0
    for ( var i = 1 ; i < length - 1 ; i ++ ) {
        // i ranges from 1 to length-2, covering all necessary triangles
        ps = points [ i ] ; // Current point
        pe = points [ i + 1 ] ; // Next point
        S += sign_s ( p0 , ps , pe ) ; // Add the signed area of triangle (p0, ps, pe)
    }

    // The total area is half of the accumulated sum
    var r_S = "" + ( S / 2 ) ; // Convert the result to a string for formatting
    var idx = r_S . indexOf ( "." ) ; // Find the position of the decimal point

    if ( idx == -1 ) {
        // If no decimal point, it's an integer, so append ".0"
        r_S += ".0" ;
    } else {
        // If there is a decimal point, ensure only one decimal place
        // Take substring up to one digit after the decimal point
        r_S = r_S . slice ( 0 , idx + 2 ) ;
    }

    log ( r_S ) ; // Output the formatted area
}

function sign_s ( p1 , p2 , p3 ) {
    // Calculates the signed area of the parallelogram formed by vectors (p1->p2) and (p1->p3)
    // This is equivalent to the Z-component of the cross product of 2D vectors.
    var pa = [ p2 [ 0 ] - p1 [ 0 ] , p2 [ 1 ] - p1 [ 1 ] ] ; // Vector p1 to p2
    var pb = [ p3 [ 0 ] - p1 [ 0 ] , p3 [ 1 ] - p1 [ 1 ] ] ; // Vector p1 to p3
    // Call helper function to compute the cross product equivalent
    return sign_s_main ( pa , pb ) ;
}

function sign_s_main ( pa , pb ) {
    // Computes the 'cross product' (z-component) of two 2D vectors pa and pb
    // This value is twice the signed area of the triangle formed by origin, pa, and pb.
    return ( pa [ 0 ] * pb [ 1 ] - pa [ 1 ] * pb [ 0 ] ) ;
}