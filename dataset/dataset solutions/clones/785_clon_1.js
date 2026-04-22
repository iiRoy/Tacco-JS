var lines = [] ; // Array to store input lines
var reader = require('readline').createInterface(
  {
    // Configuration for the readline interface
    input: process.stdin,
    output: process.stdout // Output stream (not used for reading input lines)
  }
) ; // Create a readline interface instance


reader.on('line', function (line) {
  // This event handler is triggered whenever a new line of input is received.

  // The following line was commented out in the original, so it remains commented.
  // reader.close();

  lines.push(line) ; // Add the received line to our 'lines' array.
}) ; // End of 'line' event handler


/*
 * The following 'close' event handler block was entirely commented out
 * in the original code. It remains fully commented out here,
 * preserving its original state.
 */
// reader.on('close', function () {
//     reader.close(); // This would close the reader again, potentially redundantly.
//   console.log(lines); // Log all collected lines.
//   main(lines); // Call the main function with the collected input.
// });


process.stdin.on('end',
  function () {
    // This event fires when the standard input stream has ended.

    // Original commented-out line, kept as is.
    // console.log(lines);

    // Call the main processing function with all the collected lines.
    main(lines) ;
  }
) ; // End of 'end' event handler for process.stdin


// Define a small epsilon value for floating-point comparisons
var EPS = 1e-10 ; // A very small number to handle floating point inaccuracies


// Function to find the intersection point of two line segments
function findXPoint(line1, line2) {
  // line1 and line2 are arrays, each containing two point objects {x, y}
  var a = line1[0] ; // Start point of the first line segment
  var b = line1[1] ; // End point of the first line segment
  var c = line2[0] ; // Start point of the second line segment
  var d = line2[1] ; // End point of the second line segment

  var r, s, x, y, temp ; // Declare variables for calculations

  // Check if the line segments are parallel
  // This is done by checking if the cross product of their direction vectors is zero.
  temp = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x) ;

  // If 'temp' is very close to zero, the lines are parallel or collinear.
  if (Math.abs(temp) < EPS) {
    return null ; // No unique intersection point, or lines are parallel.
  }

  // Debugging console logs, kept commented as in original.
  // console.log(a,b,c,d);
  // console.log((d.y - c.y),(c.x - a.x),(d.x - c.x),(c.y - a.y));

  // Calculate 'r' parameter for the first line segment.
  // This 'r' value indicates where along the first segment the intersection occurs.
  r = ((d.y - c.y) * (c.x - a.x) - (d.x - c.x) * (c.y - a.y)) / temp ;

  // The 's' parameter calculation for the second line segment was commented out.
  // s = ((b.y - a.y) * (c.x - a.x) - (b.x - a.x) * (c.y - a.y)) / temp;

  // Calculate the x-coordinate of the intersection point using 'r'.
  x = a.x * (1 - r) + b.x * r ;
  // Calculate the y-coordinate of the intersection point using 'r'.
  y = a.y * (1 - r) + b.y * r ;

  // Check if the intersection point lies within the first line segment (0 <= r <= 1).
  // We use EPS for comparison to account for floating-point inaccuracies.
  if (r < EPS || 1 - r < EPS) {
    return null ; // Intersection point is outside the segment.
  }

  // If all conditions are met, return the intersection point as an object.
  return { x: x, y: y } ;
} // End of findXPoint function


// Function to solve the problem: count distinct regions formed by intersecting lines.
function solve(lines) {
  var xPointsList ; // List to store distinct intersection points for the current line.
  var count = 1 ; // Initialize count of regions. Starts at 1 (the initial plane).
  var i, j, xPoint ; // Loop counters and a variable for intersection point.

  // Iterate through each line segment provided in the input.
  for (i = 0; i < lines.length; i++) {
    count++ ; // Each new line segment adds at least one new region.
    xPointsList = [] ; // Reset the list of intersection points for the current line.

    // Compare the current line segment (lines[i]) with all previous line segments (lines[j]).
    for (j = 0; j < i; j++) {
      // Find the intersection point between lines[i] and lines[j].
      xPoint = findXPoint(lines[i], lines[j]) ;

      // If no intersection point is found (e.g., parallel lines, segments don't cross), skip.
      if (xPoint == null) {
        continue ; // Move to the next pair of line segments.
      }

      // Check if this intersection point is already in xPointsList.
      // If it's a new distinct point, add it to the list.
      xPointsList.some(function (point) {
        // Compare coordinates with a small epsilon to handle float precision issues.
        return (Math.pow(xPoint.x - point.x, 2) + Math.pow(xPoint.y - point.y, 2) < EPS) ;
      }) || xPointsList.push(xPoint) ; // If 'some' returns false (point is new), push it.

    } // End of inner loop (j)

    // Each distinct intersection point on the current line adds another new region.
    count += xPointsList.length ;

    // Debugging console log, kept commented.
    // console.log(xPointsList,count);
  } // End of outer loop (i)

  return count ; // Return the total count of regions.
} // End of solve function


// Main function to process the input and output results.
function main(input) {
  var nLines ; // Number of line segments for the current test case.
  var i ; // Loop counter.
  var temp ; // Temporary variable for parsing input.
  var lines ; // Array to store line segments for the current test case.

  // Loop while the first element of input can be parsed as a number and is not 0.
  // Each iteration processes one test case.
  while ((nLines = +input.shift()) !== 0) {
    lines = [] ; // Initialize an empty array for lines of the current test case.

    // Read 'nLines' line segments for the current test case.
    for (i = 0; i < nLines; i++) {
      // Input format: "x1 y1 x2 y2"
      temp = input.shift().split(' ') ; // Get the next line and split it by space.

      // Parse coordinates and create line segment objects.
      // Each line segment is an array of two point objects: [ {x1, y1}, {x2, y2} ]
      lines.push([
        { x: +temp[0], y: +temp[1] }, // First point (x1, y1)
        { x: +temp[2], y: +temp[3] }  // Second point (x2, y2)
      ]) ; // Add the new line segment to the 'lines' array.
    } // End of loop for reading lines for a test case

    // Solve the problem for the current set of lines and print the result.
    console.log(solve(lines)) ;
  } // End of while loop for test cases
} // End of main function