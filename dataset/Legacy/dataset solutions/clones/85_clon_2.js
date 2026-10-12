// This script reads coordinate data from standard input, processes each line,
// and determines if two line segments defined by the coordinates have identical slopes.
require("fs")
  .readFileSync("/dev/stdin", "utf8") // Read the entire standard input as a UTF-8 string
  .split('\n') // Split the input string into an array of lines
  .map(function(currentLineData) { // Iterate over each line of input
    // Split the current line by spaces to get individual coordinate components.
    // For example, "0 0 1 1 2 2 3 3" would become ["0", "0", "1", "1", "2", "2", "3", "3"].
    let coordinateParts = currentLineData.split(' ');

    // Check if the line contains at least three parts (x0, y0, x1) to ensure
    // that the first slope calculation can proceed without encountering undefined values.
    // This implicitly handles empty lines or lines with insufficient data.
    if (coordinateParts[2]) {
      // Calculate the slope of the first line segment.
      // Points are (x0, y0) and (x1, y1), which correspond to coordinateParts[0] through coordinateParts[3].
      // Slope = (y1 - y0) / (x1 - x0)
      let firstSegmentSlope = ((coordinateParts[3] - coordinateParts[1]) / (coordinateParts[2] - coordinateParts[0])).toFixed(6);

      // Calculate the slope of the second line segment.
      // Points are (x2, y2) and (x3, y3), which correspond to coordinateParts[4] through coordinateParts[7].
      // Slope = (y3 - y2) / (x3 - x2)
      let secondSegmentSlope = ((coordinateParts[7] - coordinateParts[5]) / (coordinateParts[6] - coordinateParts[4])).toFixed(6);

      // Compare the calculated slopes. Using toFixed(6) ensures a consistent string representation
      // for floating-point comparison, mitigating potential precision issues.
      // Output 'YES' if slopes are identical, 'NO' otherwise.
      console.log(firstSegmentSlope === secondSegmentSlope ? 'YES' : 'NO');
    }
  });
