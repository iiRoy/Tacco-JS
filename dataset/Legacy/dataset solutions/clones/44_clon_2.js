// This JavaScript module processes geometric coordinate data from standard input.
// It calculates the circumcenter and circumradius for sets of three points.
require("fs")
  .readFileSync("/dev/stdin", "utf8") // Reads the entire standard input as a UTF-8 string.
  .trim() // Removes any leading or trailing whitespace from the input string.
  .split('\n') // Splits the input string into an array of individual lines.
  .some(function(currentInputLine) { // Iterates over each line of input.
    // Declare variables for line segments, coordinates, their squares, and the circumcenter/radius.
    // These variables are function-scoped, mimicking the implicit declaration behavior of the original.
    let lineSegments, point1X, point1Y, point2X, point2Y, point3X, point3Y;
    let p1XSquared, p1YSquared, p2XSquared, p2YSquared, p3XSquared, p3YSquared;
    let circumX, circumY, radiusValue;

    // Splits the current line by spaces to obtain an array of string parts.
    lineSegments = currentInputLine.split(' ');

    // Checks if the line contains exactly six segments, which are expected to be coordinates.
    if (lineSegments.length === 6)
      // All assignments, calculations, and the final output are performed within a single
      // comma-separated expression statement, mirroring the original's structure.
      point1X = lineSegments[0], point1Y = lineSegments[1],
      point2X = lineSegments[2], point2Y = lineSegments[3],
      point3X = lineSegments[4], point3Y = lineSegments[5],

      p1XSquared = point1X * point1X, p1YSquared = point1Y * point1Y,
      p2XSquared = point2X * point2X, p2YSquared = point2Y * point2Y,
      p3XSquared = point3X * point3X, p3YSquared = point3Y * point3Y,

      // Compute the x-coordinate of the circumcenter.
      // This formula is derived from the intersection of perpendicular bisectors of the triangle sides.
      circumX = ((point1Y - point3Y) * (p1YSquared - p2YSquared + p1XSquared - p2XSquared) -
                 (point1Y - point2Y) * (p1YSquared - p3YSquared + p1XSquared - p3XSquared)) /
                (2 * (point1Y - point3Y) * (point1X - point2X) -
                 2 * (point1Y - point2Y) * (point1X - point3X)),

      // Compute the y-coordinate of the circumcenter.
      // This formula is also derived from the general equation for a circumcenter.
      circumY = ((point1X - point3X) * (p1XSquared - p2XSquared + p1YSquared - p2YSquared) -
                 (point1X - point2X) * (p1XSquared - p3XSquared + p1YSquared - p3YSquared)) /
                (2 * (point1X - point3X) * (point1Y - point2Y) -
                 2 * (point1X - point2X) * (point1Y - point3Y)),

      // Calculates the distance from the circumcenter to any of the three points, which is the circumradius.
      radiusValue = Math.sqrt(
        (point1X - circumX) * (point1X - circumX) +
        (point1Y - circumY) * (point1Y - circumY)
      ),

      // Prints the calculated circumcenter coordinates and the circumradius,
      // each formatted to three decimal places, separated by spaces.
      console.log(circumX.toFixed(3), circumY.toFixed(3), radiusValue.toFixed(3));
    // The 'some' method continues iterating through all lines because the callback
    // function implicitly returns 'undefined', which is falsy.
    // Explicitly returning false ensures this behavior.
    return false;
  });
