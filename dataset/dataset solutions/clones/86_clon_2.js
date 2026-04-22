const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8'); // Retrieve content from the standard input path.

// Break down the entire input string into an array of individual lines.
let lineCollection = (dataSource.trim()).split("\n");

/*
 * Remove the very first element from the collection of lines.
 * This is often done to skip header information or a line count.
 */
lineCollection.shift();

// Iterate through each remaining entry in the processed line collection.
lineCollection.forEach(function(currentEntry) {
  // Convert the current line string into an array of numbers.
  let numericValues = currentEntry.split(" ").map(Number);

  // Apply a uniform scaling factor to each numerical component.
  numericValues = numericValues.map(function(numComponent) {
    return numComponent * 100000;
  });

  // Extract the coordinates for the first line segment (Point A to Point B).
  const p1X = numericValues[0];
  const p1Y = numericValues[1];
  const p2X = numericValues[2];
  const p2Y = numericValues[3];

  // Extract the coordinates for the second line segment (Point C to Point D).
  const p3X = numericValues[4];
  const p3Y = numericValues[5];
  const p4X = numericValues[6];
  const p4Y = numericValues[7];

  // Initialize the parallelism outcome string.
  let outcomeString = "NO";

  // Check if both line segments are non-vertical to compute their slopes.
  if ((p2X - p1X !== 0) && (p4X - p3X !== 0)) {
    // Calculate the gradient (slope) of the first line segment.
    const gradientA = (p2Y - p1Y) / (p2X - p1X);
    // Calculate the gradient (slope) of the second line segment.
    const gradientB = (p4Y - p3Y) / (p4X - p3X);

    // If the gradients are identical, the segments are considered parallel.
    if (gradientA === gradientB) {
      outcomeString = "YES";
    }
  }
  // Display the determined outcome for the current set of line segments.
  console.log(outcomeString);
});