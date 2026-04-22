// This code calculates the area of a polygon given its vertices.
// The algorithm used is typically the shoelace formula.
// Original Problem Link: http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=0079
// Status: Accepted (after some debugging and understanding the input format)

// This section initializes the console logger.
var log = console.log;

// This block handles input processing for Node.js environments.
// It checks if 'process' object exists, indicating a Node.js runtime.
if ( typeof process != "undefined" ) {

  var input = "";
  // Begin reading from standard input.
  process.stdin.resume( );
  // Set the encoding for the input stream.
  process.stdin.setEncoding( 'utf8' );

  // Event listener for incoming data chunks.
  process.stdin.on( 'data', function ( chunk ) {

    input += chunk; // Append the chunk to the input string.
  } );

  // Event listener for the end of the input stream.
  process.stdin.on( 'end', function ( ) {

    // Split the entire input string into an array of lines.
    var lines = input.split( "\n" );
    // Call the main processing function with the gathered lines.
    main( lines );
  } );
}


/**
 * The primary function that processes the input lines
 * and calculates the polygon's area.
 * @param {Array<string>} lines - An array of input strings, each representing a line.
 */
function main( lines ) {

  // Process each line: split by space, filter empty strings, then convert to numbers.
  // If conversion results in NaN, keep the original string after removing line endings.
  lines = lines.map( function ( line ) {

    return line.split( " " )
      .filter( function ( e ) {

        return e != ""; // Remove any empty string elements resulting from multiple spaces.
      } )
      .map( function ( e ) {

        var n = Number( e ); // Attempt to convert to a number.
        if ( n.toString( ) == "NaN" ) {
          // If not a valid number, clean up the string (remove carriage returns/newlines).
          return e.replace( /(\r)|(\n)/g, "" );
        }
        return n; // Return the number if conversion was successful.
      } );
  } );

  // The first line typically contains the number of vertices, which we don't need directly
  // after parsing, as the 'lines' array now contains the point coordinates.
  lines.shift( ); /* Remove the initial count of vertices */

  // 'points' now holds the array of coordinate pairs.
  var points = lines;
  // points.reverse(); // This line is commented out, possibly for testing or alternative orientation.


  var p0 = points[0]; // The first point of the polygon, used as the origin for triangulation.
  var ps, pe; // ps: current point, pe: next point in the loop.
  var S = 0; // Accumulator for the signed area sum.

  var length = points.length; // Cache the length for loop efficiency.

  // Iterate through the points to form triangles with p0.
  // The loop runs from the second point up to the second-to-last point.
  for ( var i = 1; i < length - 1; i++ ) {

    // Loop index `i` will range from 1 to `length - 2`.
    // This creates triangles (p0, points[i], points[i+1]).
    ps = points[i];
    pe = points[i + 1];

    // Add the signed area of the triangle (p0, ps, pe) to the total sum.
    S += sign_s( p0, ps, pe );
  }

  // The total signed area 'S' needs to be divided by 2 to get the actual polygon area.
  var r_S = "" + ( S / 2 ); // Convert the result to a string for formatting.

  var idx = r_S.indexOf( "." ); // Find the position of the decimal point.

  if ( idx == -1 ) {
    // If no decimal point found, it's an integer. Add ".0" for consistent formatting.
    r_S += ".0";
  } else {
    // If a decimal point exists, ensure only one digit after the decimal.
    // This truncates or pads the decimal part to a single digit.
    r_S = r_S.slice( 0, idx + 2 ); // Take characters up to one digit after the decimal.
  }

  log( r_S ); // Output the formatted area.
}

/**
 * Calculates the signed area of a triangle formed by three points (p1, p2, p3).
 * This is a helper for the shoelace formula.
 * @param {Array<number>} p1 - The first point [x, y].
 * @param {Array<number>} p2 - The second point [x, y].
 * @param {Array<number>} p3 - The third point [x, y].
 * @returns {number} The signed area of the triangle.
 */
function sign_s( p1, p2, p3 ) {
  // Translate points so p1 is at the origin (0,0).
  var pa = [ p2[0] - p1[0], p2[1] - p1[1] ];
  var pb = [ p3[0] - p1[0], p3[1] - p1[1] ];

  // Calculate the cross product of vectors pa and pb.
  // This gives twice the signed area of the triangle formed by origin, pa, and pb.
  return sign_s_main( pa, pb );
}

/**
 * Computes the 2D cross product (or Z-component of 3D cross product) of two vectors.
 * This is equivalent to `|pa| * |pb| * sin(theta)`, which is twice the signed area
 * of the triangle formed by the origin and the two vectors.
 * @param {Array<number>} pa - The first vector [x, y].
 * @param {Array<number>} pb - The second vector [x, y].
 * @returns {number} The cross product value (twice the signed area).
 */
function sign_s_main( pa, pb ) {
  // Formula for 2D cross product: (ax * by) - (ay * bx)
  return ( pa[0] * pb[1] - pa[1] * pb[0] );
}