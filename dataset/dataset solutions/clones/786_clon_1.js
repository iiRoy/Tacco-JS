var lines = []; // This array will store all input lines read from stdin.

// Initialize a readline interface to handle input from the standard input stream.
var reader = require('readline').createInterface({
    input: process.stdin,  // The input source is standard input.
    output: process.stdout // The output destination is standard output (not used for this problem's input logic).
});

// Register an event listener for each 'line' of input received.
reader.on(
  'line',
  function (line) {
    // reader.close(); // Original commented line - keeping it commented but re-indented.
    lines.push(line); // Add the read line to our 'lines' array.
  }
); // End of 'line' event handler.

// reader.on('close', function () { // Another original commented block.
//    reader.close(); // This line was also commented out.
//  console.log(lines); // Log all lines when the reader closes.
//  main(lines); // Call the main processing function.
//});

// Register an event listener for the 'end' of the standard input stream.
process.stdin.on(
  'end',
  function () {
    // console.log(lines); // Optional: log all collected lines before processing.
    main(lines); // Once all input is received, call the main function to process it.
  }
); // End of 'end' event handler.


// Define a small constant for floating-point comparisons, often used for epsilon-equality.
var EPSILON = 1e-10; // A very small number to account for floating-point inaccuracies.

/**
 * Calculates the intersection point of two line segments.
 *
 * @param {Array<Object>} line1 - The first line segment, represented as an array of two point objects {x, y}.
 * @param {Array<Object>} line2 - The second line segment, represented as an array of two point objects {x, y}.
 * @returns {Object|null} An object {x, y} representing the intersection point, or null if segments are parallel
 *                        or intersect outside the allowed bounds (-100 to 100 for x and y).
 */
function findXPoint(line1, line2) {

  // Extract individual points from the line segments for easier access.
  var a = line1[0],    // Start point of line 1.
      b = line1[1],    // End point of line 1.
      c = line2[0],    // Start point of line 2.
      d = line2[1];    // End point of line 2.

  var r, s,             // Parameters for line equations.
      x, y,             // Coordinates of the intersection point.
      temp;             // Temporary variable for denominator calculation.


  // Calculate the denominator for the intersection formula.
  // This value determines if the lines are parallel or collinear.
  temp = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);

  // If temp is 0, the lines are parallel or collinear.
  // In this context, we consider them not to have a unique intersection point.
  if (temp === 0) {
    return null; // No unique intersection point found.
  }

//  console.log(a,b,c,d); // Debugging line for points.
//  console.log((d.y - c.y),(c.x - a.x),(d.x - c.x),(c.y - a.y)); // Debugging line for intermediate calculations.

  // Calculate parameters r and s.
  // r represents the position of the intersection point along line1.
  r = ( (d.y - c.y) * (c.x - a.x) - (d.x - c.x) * (c.y - a.y) ) / temp;
  // s represents the position of the intersection point along line2.
  s = ( (b.y - a.y) * (c.x - a.x) - (b.x - a.x) * (c.y - a.y) ) / temp;

  // If r or s are outside the [0, 1] range, the intersection point
  // lies outside one or both of the line segments.
  // The problem statement implies we are looking for line *intersections* not segment intersections,
  // but the original code doesn't check r and s for [0,1].
  // Assuming it's looking for line intersections, not segment intersections.

  // Calculate the actual (x, y) coordinates of the intersection point
  // using parameter r and line1's points.
  x = a.x * (1 - r) + b.x * r;
  y = a.y * (1 - r) + b.y * r;

  // Check if the calculated intersection point falls within the specified bounds.
  // Points outside [-100, 100] for both x and y are considered invalid for this problem.
  if (x < -100 || x > 100 || y < -100 || y > 100) {
    return null; // Intersection point is out of bounds.
  }

  // If an intersection point is found and is within bounds, return it.
  return { x: x, y: y }; // Return the intersection point as an object.
} // End of findXPoint function.


/**
 * Solves the problem for a given set of line segments.
 * This function calculates the number of distinct points (endpoints + intersection points).
 *
 * @param {Array<Array<Object>>} lines - An array of line segments, where each segment is an array of two point objects.
 * @returns {number} The total count of distinct points (endpoints plus unique intersection points).
 */
function solve(lines) {

  var xPointsList, // List to store unique intersection points found.
      count = 1,   // Initialize count with 1 (for the first point, or just a base value).
      i, j,        // Loop counters.
      xPoint;      // Variable to hold a single intersection point.

  // Iterate through each line segment.
  for (i = 0; i < lines.length; i++) {
    count++; // Increment count for the current line's endpoint (or some other logic).
    xPointsList = []; // Reset the list of intersection points for the current line.

    // Compare the current line segment (lines[i]) with all previous line segments (lines[j]).
    for (j = 0; j < i; j++) {

      // Find the intersection point between lines[i] and lines[j].
      xPoint = findXPoint(lines[i], lines[j]);

      // If no valid intersection point is found, skip to the next pair.
      if (xPoint == null) {
        continue; // Move to the next iteration of the inner loop.
      }

      // Check if this intersection point is already in xPointsList.
      // If not, add it. This uses a functional approach with 'some' and logical OR.
      xPointsList.some(
        function (point) {
          // Compare points using EPSILON for floating-point equality.
          return (Math.pow(xPoint.x - point.x, 2) + Math.pow(xPoint.y - point.y, 2) < EPSILON * EPSILON);
        }
      ) || xPointsList.push(xPoint); // If 'some' returns false (point is unique), push it to the list.

    } // End of inner loop (j).

    // Add the number of unique intersection points found for the current line
    // to the total count.
    count += xPointsList.length;

//    console.log(xPointsList,count); // Debugging line to show points and current count.

  } // End of outer loop (i).

  return count; // Return the final calculated count of distinct points.
} // End of solve function.


/**
 * The main function to process input and orchestrate the solution.
 *
 * @param {Array<string>} input - An array of strings, where each string is a line from standard input.
 */
function main(input) {

  var nLines, // Number of line segments for the current test case.
      i,      // Loop counter.
      temp,   // Temporary array to hold split input values.
      lines;  // Array to store line segments for the current test case.

  // Loop until '0' is encountered as the number of lines, indicating the end of input.
  while ((nLines = +input.shift()) !== 0) { // '+input.shift()' converts the string to a number.

    lines = []; // Initialize an empty array to store line segments for the current test case.

    // Read 'nLines' line segments for the current test case.
    for (i = 0; i < nLines; i++) {

      // x1 line[0] y1 line[1] // Original comment for input format.
      // x2 line[2] y2 line[3] // Added for clarity.
      temp = input.shift().split(' '); // Read a line, split it by space.

      // Parse the coordinates and create point objects, then push the segment to the 'lines' array.
      lines.push([
        {x: +temp[0], y: +temp[1]}, // First point {x1, y1}.
        {x: +temp[2], y: +temp[3]}  // Second point {x2, y2}.
      ]);
    } // End of inner loop for reading lines.

    // Solve the problem for the current set of line segments and print the result.
    console.log(solve(lines));

  } // End of while loop for test cases.
} // End of main function.