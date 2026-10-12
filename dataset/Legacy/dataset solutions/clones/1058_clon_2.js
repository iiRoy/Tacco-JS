let cfg = { input: '/dev/stdin', newline: '\n' }; // Configuration for input source and newline character

// Read the number of iterations from the specified input file.
// The input content is read as ASCII, trimmed of leading/trailing whitespace,
// and then converted into a numerical value.
let iterations = Number(require('fs').readFileSync(cfg.input, 'ascii').trim());

// Define a constant for a specific scaling factor used in the Koch curve generation.
// This value is equivalent to Math.sqrt(3) / 6.
const FACTOR_SQRT3_DIV6 = Math.sqrt(3.0) / 6.0;

/**
 * Calculates the four points that replace a single segment in the Koch curve construction.
 * Given two endpoints of a segment, it computes the two points that divide the segment
 * into three equal parts, and the apex point of the equilateral triangle formed on the middle third.
 *
 * @param {Array<number>} point1 - The starting point of the segment, represented as [x, y].
 * @param {Array<number>} point2 - The ending point of the segment, represented as [x, y].
 * @returns {Array<Array<number>>} An array containing four points:
 *                                  [point1, first_third_point, apex_point, second_third_point].
 */
function computeKochSegment(point1, point2) {
  // Calculate the coordinates of the first point (s) that is one-third of the way from point1 to point2.
  let segmentStart = [
    (2.0 * point1[0] + point2[0]) / 3.0,
    (2.0 * point1[1] + point2[1]) / 3.0
  ];

  // Calculate the coordinates of the second point (t) that is two-thirds of the way from point1 to point2.
  let segmentEnd = [
    (point1[0] + 2.0 * point2[0]) / 3.0,
    (point1[1] + 2.0 * point2[1]) / 3.0
  ];

  // Calculate the coordinates of the apex point (u) of the equilateral triangle.
  // This involves a rotation and scaling based on the segment's orientation.
  let midX = (point1[0] + point2[0]) / 2.0 + FACTOR_SQRT3_DIV6 * (point1[1] - point2[1]);
  let midY = (point1[1] + point2[1]) / 2.0 + FACTOR_SQRT3_DIV6 * (point2[0] - point1[0]);

  // Return the sequence of points that form the new, subdivided segment.
  return [point1, segmentStart, [midX, midY], segmentEnd];
}

// Initialize the Koch curve with a single horizontal line segment.
// This segment spans from (0,0) to (100,0).
let kochCurveSegments = [[0.0, 0.0], [100.0, 0.0]];

// Perform the Koch curve generation process for the specified number of iterations.
for (let iterCount = 0; iterCount < iterations; iterCount++) {
  // Create a new array to store the segments generated in the current iteration.
  let nextSegments = [];

  // Iterate through the existing segments (pairs of points) in the current Koch curve.
  // The loop runs up to `length - 1` because we process `kochCurveSegments[segmentIndex]` and `kochCurveSegments[segmentIndex + 1]`.
  for (let segmentIndex = 0; segmentIndex < kochCurveSegments.length - 1; segmentIndex++) {
    // For each segment, compute its four replacement points and append them to the new segments array.
    nextSegments = nextSegments.concat(computeKochSegment(kochCurveSegments[segmentIndex], kochCurveSegments[segmentIndex + 1]));
  }

  // After processing all segments, the very last point of the original curve needs to be added.
  // This is because `computeKochSegment` returns the starting point of each new sub-segment,
  // but the final endpoint of the entire curve is only included as the starting point of the *last* segment.
  // Explicitly adding it ensures the complete curve is represented.
  nextSegments.push(kochCurveSegments[kochCurveSegments.length - 1]);

  // Update the main curve segments array to reflect the results of the current iteration.
  kochCurveSegments = nextSegments;
}

// Output the coordinates of all points in the final generated Koch curve.
// Each point's x and y coordinates are joined by a space and printed on a new line.
for (let iterPoint in kochCurveSegments) {
  console.log(kochCurveSegments[iterPoint].join(' '));
}
