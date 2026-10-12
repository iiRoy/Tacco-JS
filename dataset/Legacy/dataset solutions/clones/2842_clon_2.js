function ProcessInput(rawData) {
  // Split the raw input string into individual lines
  let dataRows = rawData.split("\n");

  // Remove the last (potentially empty) line
  dataRows.pop();

  // Extract the number of points from the first line and convert to a number
  const pointCount = Number(dataRows.shift());

  // Initialize an array to store coordinate objects
  let coordinates = [];

  // Populate the coordinates array from the remaining data rows
  for (let idxA = 0; idxA < pointCount; idxA++) {
    // Split each line by space to get x and y values
    const currentCoords = dataRows[idxA].split(' ');
    // Add a new point object to the array
    coordinates.push({ x: currentCoords[0], y: currentCoords[1] });
  }

  // Sort the points: first by x-coordinate, then by y-coordinate
  coordinates.sort(function(pointA, pointB) {
    // If x-coordinates are the same, sort by y
    if (pointA.x === pointB.x) {
      return pointA.y - pointB.y;
    }
    // Otherwise, sort by x
    return pointA.x - pointB.x;
  });

  // Initialize an object to store frequencies of displacement vectors
  let vectorFrequencies = {};

  // Calculate all possible displacement vectors between pairs of points
  for (let idxA = 0; idxA < pointCount; idxA++) {
    for (let idxB = 0; idxB < pointCount; idxB++) {
      // Skip if comparing a point to itself
      if (idxA === idxB) continue;

      // Calculate the x and y components of the displacement vector
      const deltaX = coordinates[idxA].x - coordinates[idxB].x;
      const deltaY = coordinates[idxA].y - coordinates[idxB].y;

      // Create a unique string key for the vector (e.g., "3,-5")
      const vectorKey = deltaX + ',' + deltaY;

      // Increment the count for this vector, or initialize to 1 if new
      if (vectorFrequencies[vectorKey]) {
        vectorFrequencies[vectorKey]++;
      } else {
        vectorFrequencies[vectorKey] = 1;
      }
    }
  }

  // Get an array of all unique vector keys
  const uniqueVectors = Object.keys(vectorFrequencies);

  // Initialize variables to find the vector with the maximum frequency
  let maxFrequency = 0;
  let maxFreqVectorKey = '';

  // Iterate through the unique vectors to find the one with the highest count
  for (let loopCounter = 0; loopCounter < uniqueVectors.length; loopCounter++) {
    const currentVectorKey = uniqueVectors[loopCounter];
    // If the current vector's frequency is greater than the current maximum
    if (maxFrequency < vectorFrequencies[currentVectorKey]) {
      // Update the maximum frequency and the corresponding vector key
      maxFrequency = vectorFrequencies[currentVectorKey];
      maxFreqVectorKey = currentVectorKey;
    }
  }

  // Split the most frequent vector key back into its x and y components
  const dominantVecX = maxFreqVectorKey.split(',')[0];
  const dominantVecY = maxFreqVectorKey.split(',')[1];

  // Initialize a counter for the number of independent sets of points
  let resultCount = 0;

  // Process points until the coordinates array is empty
  while (coordinates.length > 0) {
    // Take the first point from the array as the current reference point
    const currentPoint = coordinates.shift();

    // Iterate through the remaining points to remove those collinear with currentPoint
    for (let loopCounter = 0; loopCounter < coordinates.length; loopCounter++) {
      const otherPoint = coordinates[loopCounter];

      // Check if otherPoint is collinear with currentPoint along the dominant vector
      // This involves checking if the displacement (otherPoint - currentPoint) is a multiple of (dominantVecX, dominantVecY)
      const isCollinearX = (dominantVecX == 0 && otherPoint.x - currentPoint.x == 0) || ((otherPoint.x - currentPoint.x) % dominantVecX == 0);
      const isCollinearY = (dominantVecY == 0 && otherPoint.y - currentPoint.y == 0) || ((otherPoint.y - currentPoint.y) % dominantVecY == 0);

      if (isCollinearX && isCollinearY) {
        // If collinear, remove the point from the array
        coordinates.splice(loopCounter, 1);
        // Decrement the loop counter to account for the removed element
        loopCounter--;
      }
    }
    // Increment the count of independent sets
    resultCount++;
  }

  // Output the final count to the console
  console.log(resultCount);
}

// Read input from standard input and pass it to the Main function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
