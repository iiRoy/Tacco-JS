function processInput(rawData) {
  // Split the entire input string into individual lines.
  rawData = rawData.split('\n');

  // Parse the first line to get the number of entries and the maximum distance.
  const [numEntries, maxDistance] = rawData[0].split(' ').map(Number);

  // Process subsequent lines to extract coordinate pairs.
  // Each line is converted into an object with 'horiz' and 'vert' properties.
  const coordinatePairs = rawData.slice(1, numEntries + 1).map(lineStr => {
    let coordsArr = lineStr.split(' ').map(Number);
    return {
      horiz: coordsArr[0],
      vert: coordsArr[1]
    };
  });

  // Calculate the square of the maximum allowed distance for efficiency.
  let maxDistanceSquared = maxDistance * maxDistance;

  // Initialize a counter for points within the specified range.
  let withinRangeCount = 0;

  // Iterate over each coordinate pair to check if it's within the distance.
  coordinatePairs.forEach(currentPoint => {
    // Calculate the square of the Euclidean distance from the origin (0,0).
    // If the squared distance is less than or equal to the squared max distance, increment the counter.
    if ((currentPoint.horiz * currentPoint.horiz + currentPoint.vert * currentPoint.vert) <= maxDistanceSquared) {
      withinRangeCount++;
    }
  });

  // Output the final count of points that are within the allowed range.
  console.log(withinRangeCount);
}

// Read input from standard input, trim any leading/trailing whitespace, and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
