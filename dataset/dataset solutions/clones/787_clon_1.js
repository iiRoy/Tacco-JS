/*
 * This JavaScript code processes geometric line segments provided via standard input.
 * Its primary goal is to count the total number of unique points, which include
 * the endpoints of the segments themselves, and any valid intersection points
 * between them.
 *
 * The input is expected to define multiple test cases, where each test case
 * begins with an integer indicating the number of line segments to follow.
 * A zero indicates the end of input.
 */

var lines = []; /* This global array will temporarily hold all raw input lines
                   before they are processed by the main function. */

/*
 * Initialize the readline interface to handle input from stdin.
 * This allows reading input line by line.
 */
var reader = require('readline').createInterface( {
  input  : process.stdin, /* Use standard input stream for reading. */
  output : process.stdout /* Standard output stream, though not directly
                              used by `reader` for output in this context. */
} );

/*
 * Event handler for each line read from stdin.
 * Pushes the received line string into the `lines` array.
 */
reader.on( 'line', function ( line ) {
  // A previously commented-out `reader.close()` call was here.
  // reader.close(); /* This line was commented out in the original code. */
  lines.push( line ); /* Add the current line to our collection. */
} );

/*
 * The following block was originally commented out. It shows an alternative
 * way to handle the 'close' event for the reader, but the final implementation
 * uses the 'end' event of `process.stdin` instead.
 *
// reader.on('close', function () {
//     reader.close();
//   console.log(lines);
//   main(lines);
// });
*/

/*
 * Event handler for the 'end' of the standard input stream.
 * Once all input has been received, this function triggers the main processing logic.
 */
process.stdin.on( 'end', function () {
  // Another commented-out `console.log(lines)` was here.
  // console.log(lines); /* This line was also commented out in the original. */
  main( lines ); /* Invoke the primary function to process all collected input. */
} );


/*
 * A small constant value used for floating-point comparisons.
 * Essential for checking equality of coordinates due to potential precision issues.
 */
var EPSILON = Math.pow( 10, -10 ); /* Defines a tolerance for comparing floating-point numbers. */


/**
 * Calculates the intersection point of two line segments.
 * If the segments are parallel, collinear, or if the intersection point
 * falls outside a predefined bounding box ([-100, 100] for both x and y),
 * it returns null.
 *
 * @param {Array<Object>} line1 - The first line segment, represented as an array
 *                                containing two point objects: [{x: x1, y: y1}, {x: x2, y: y2}].
 * @param {Array<Object>} line2 - The second line segment, in the same format.
 * @returns {Object|null} An object `{x: x_coord, y: y_coord}` representing the
 *                        intersection point, or `null` if no valid intersection exists.
 */
function findXPoint( line1, line2 ) {
  /*
   * Extract coordinates of the endpoints for easier readability.
   * line1: A(a.x, a.y) to B(b.x, b.y)
   * line2: C(c.x, c.y) to D(d.x, d.y)
   */
  var a = line1[0],
      b = line1[1],
      c = line2[0],
      d = line2[1];

  var r, s, x, y, temp; /* Declare variables used in intersection calculation. */

  // Calculate the denominator for the intersection formula.
  // If this value is zero, the lines are parallel or collinear.
  temp = ( b.x - a.x ) * ( d.y - c.y ) - ( b.y - a.y ) * ( d.x - c.x );

  if ( temp === 0 ) {
    return null; /* Lines are parallel or collinear; they do not have a unique
                    intersection point in this context. */
  }

  /*
   * These console.log statements were present and commented out in the original code.
   * They could be used for debugging purposes.
   *
  // console.log(a,b,c,d);
  // console.log((d.y - c.y),(c.x - a.x),(d.x - c.x),(c.y - a.y));
  */

  /*
   * Calculate the parameters 'r' and 's' for the intersection point.
   * The intersection point P can be expressed as:
   * P = A + r * (B - A)
   * P = C + s * (D - C)
   * Where r and s are scalar values.
   */
  r = ( ( d.y - c.y ) * ( c.x - a.x ) - ( d.x - c.x ) * ( c.y - a.y ) ) / temp;
  s = ( ( b.y - a.y ) * ( c.x - a.x ) - ( b.x - a.x ) * ( c.y - a.y ) ) / temp;

  // Calculate the actual (x, y) coordinates of the intersection point.
  x = a.x * ( 1 - r ) + b.x * r;
  y = a.y * ( 1 - r ) + b.y * r;

  /*
   * Check if the calculated intersection point lies within the specified bounds.
   * The problem statement likely imposes limits on the coordinate values.
   */
  if ( x < -100 || x > 100 || y < -100 || y > 100 ) {
    return null; /* The intersection point is outside the allowed coordinate range. */
  }

  return { x: x, y: y }; /* Return the valid intersection point object. */
}


/**
 * Solves the main problem for a given set of line segments:
 * counts the total number of unique points, including endpoints of the segments
 * and unique intersection points among them.
 *
 * @param {Array<Array<Object>>} lines - An array where each element is a line segment,
 *                                       formatted as `[{x: x1, y: y1}, {x: x2, y: y2}]`.
 * @returns {number} The total count of unique points.
 */
function solve( lines ) {
  var xPointsList, /* Stores unique intersection points found *for the current line* with previous lines. */
      count = 1, /* Initializes the point count. It starts at 1, possibly accounting for the first point of the first line. */
      i, j, /* Loop iterators for processing lines. */
      xPoint, /* Temporary variable to hold a potential intersection point. */
      linedList = []; /* Stores line segments that have already been processed and added to the count. */

  /*
   * Iterate through each line segment provided in the input `lines` array.
   * This outer loop processes one line at a time.
   */
  for ( i = 0; i < lines.length; i++ ) {
    count++; /* Increment count for the second endpoint of the current line (or just another point). */
    xPointsList = []; /* Reset the list of intersection points for the current line. */

    /*
     * Inner loop: compare the current line (`lines[i]`) with all previously
     * processed lines (`linedList[j]`) to find intersections.
     */
    for ( j = 0; j < linedList.length; j++ ) {
      xPoint = findXPoint( lines[i], linedList[j] ); /* Attempt to find an intersection. */

      if ( xPoint == null ) {
        continue; /* If no valid intersection, move to the next pair of lines. */
      }

      /*
       * Check if the found `xPoint` is already present in `xPointsList`.
       * If it's a new unique intersection point (within EPSILON tolerance),
       * add it to `xPointsList`.
       * The `|| xPointsList.push(xPoint)` uses short-circuiting: if `some` returns
       * true (point is found), `push` is not executed. If `some` returns false
       * (point is new), `push` is executed.
       */
      xPointsList.some( function ( point ) {
        return ( Math.abs( xPoint.x - point.x ) < EPSILON &&
                 Math.abs( xPoint.y - point.y ) < EPSILON );
      } ) || xPointsList.push( xPoint );

    } /* End of inner loop (j). */

    linedList.push( lines[i] ); /* Add the current line to the list of processed lines. */
    count += xPointsList.length; /* Add the number of *new, unique* intersection points
                                      found for this line to the total count. */

    // This console.log was commented out in the original code.
    // console.log(lines[i],count); /* For debugging: shows the current line and count. */
  } /* End of outer loop (i). */

  return count; /* Return the final accumulated count of unique points. */
}

/**
 * The main entry point function that orchestrates the entire process.
 * It reads input test cases, parses them, calls the `solve` function,
 * and prints the results to the console.
 *
 * @param {Array<string>} input - An array of raw string lines read from stdin.
 */
function main( input ) {
  var nLines, /* Number of line segments for the current test case. */
      i, /* Loop counter for reading line segments. */
      temp, /* Temporary array to hold split string coordinates. */
      lines; /* Array to store parsed line segment objects for the current test case. */

  /*
   * Loop through the input array until a test case with 0 lines is encountered.
   * `+input.shift()` parses the first element of `input` to a number and removes it.
   */
  while ( ( nLines = +input.shift() ) !== 0 ) {
    lines = []; /* Initialize an empty array to store line segments for the current test case. */

    /*
     * Read `nLines` number of line segments for the current test case.
     * Each line consists of four space-separated numbers: x1 y1 x2 y2.
     */
    for ( i = 0; i < nLines; i++ ) {
      // Example: "10 20 30 40" -> temp = ["10", "20", "30", "40"]
      temp = input.shift().split( ' ' );

      /*
       * Parse the string coordinates into numbers and create point objects.
       * Push the two point objects as a line segment array into the `lines` array.
       * The unary plus operator `+` converts string to number.
       */
      lines.push( [
        { x: +temp[0], y: +temp[1] }, /* First endpoint {x1, y1} */
        { x: +temp[2], y: +temp[3] }  /* Second endpoint {x2, y2} */
      ] );
    }

    /*
     * Call the `solve` function with the parsed line segments for the current test case.
     * Print the returned count of unique points to standard output.
     */
    console.log( solve( lines ) );
  }
}