/*
 * This file processes standard input to calculate the Euclidean distance
 * between two points in a 2D plane.
 *
 * Input format: "x1 y1 x2 y2" (space-separated numbers)
 * Output: The calculated distance to standard output.
 */


// Ensure the standard input stream remains open
process.stdin.resume();


// Set the encoding for incoming data to UTF-8
process.stdin.setEncoding( 'utf8' );


/*
 * Register an event listener for 'data' events on the standard input stream.
 * This function will be executed whenever new data is available.
 */
process.stdin.on(
  'data',
  function ( chunk )
  {
    // Declare a variable to store the parsed input array.
    var x = chunk.split( " " ); // Split the input string by spaces to get individual coordinate values.

    // Parse the first coordinate values.
    x1 = parseFloat( x[0] ); // x-coordinate of the first point.
    y1 = parseFloat( x[1] ); // y-coordinate of the first point.

    // Parse the second coordinate values.
    x2 = parseFloat( x[2] ); // x-coordinate of the second point.
    y2 = parseFloat( x[3] ); // y-coordinate of the second point.

    // Calculate the Euclidean distance using the distance formula:
    // sqrt((x2 - x1)^2 + (y2 - y1)^2)
    console.log(
      Math.sqrt(
        Math.pow( ( x1 - x2 ), 2 ) +
        Math.pow( ( y1 - y2 ), 2 )
      )
    );
  }
);