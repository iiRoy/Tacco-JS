function ProcessInput(rawData) {
  // Split the raw input string into an array of lines based on newline characters.
  let dataLines = rawData.split("\n");

  // Parse the first line to determine the total number of data points.
  const numPoints = parseInt(dataLines[0], 10);

  // Initialize two arrays to store the x and y coordinates of each point.
  let xCoords = [];
  let yCoords = [];

  // Iterate through the input lines, starting from the second line (index 1),
  // to extract and store the coordinates for each point.
  for (let idx = 1; idx <= numPoints; idx++) {
    // Split the current line by space, then convert each part to an integer.
    let currentPointData = dataLines[idx].split(" ").map(coordStr => parseInt(coordStr, 10));
    // Add the first parsed integer as an x-coordinate and the second as a y-coordinate.
    xCoords.push(currentPointData[0]);
    yCoords.push(currentPointData[1]);
  }

  // Create an array to hold the initial comparison counts for each point.
  let initialCounts = [];

  // First major loop: Calculate for each point how many other points it "dominates"
  // or is "dominated by" in a specific bi-directional sense.
  for (let outerIdx = 0; outerIdx < numPoints; outerIdx++) {
    let currentPointCount = 0; // Initialize a counter for the current point's comparisons.
    // Inner loop: Compare the current point (outerIdx) with every other point (innerIdx).
    for (let innerIdx = 0; innerIdx < numPoints; innerIdx++) {
      // Check if the current point's coordinates are both strictly greater than
      // or both strictly less than the compared point's coordinates.
      if ((xCoords[outerIdx] > xCoords[innerIdx] && yCoords[outerIdx] > yCoords[innerIdx]) ||
          (xCoords[outerIdx] < xCoords[innerIdx] && yCoords[outerIdx] < yCoords[innerIdx])) {
        currentPointCount++; // Increment the counter if the condition is met.
      }
    }
    // Store the calculated count for the point at outerIdx.
    initialCounts.push(currentPointCount);
  }

  // Second major loop: Calculate and output the final "rank" for each point.
  for (let outerIdx = 0; outerIdx < numPoints; outerIdx++) {
    let finalRank = 1; // Each point starts with a base rank of 1.
    // Inner loop: Re-compare the current point (outerIdx) with every other point (innerIdx).
    for (let innerIdx = 0; innerIdx < numPoints; innerIdx++) {
      // Apply the same bi-directional dominance check as in the first loop.
      if ((xCoords[outerIdx] > xCoords[innerIdx] && yCoords[outerIdx] > yCoords[innerIdx]) ||
          (xCoords[outerIdx] < xCoords[innerIdx] && yCoords[outerIdx] < yCoords[innerIdx])) {
        // If the condition is met, add the initial count of the compared point (innerIdx)
        // to the current point's final rank.
        finalRank += initialCounts[innerIdx];
      }
    }
    // Output the calculated final rank for the point at outerIdx.
    console.log(finalRank);
  }
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the ProcessInput function for execution.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
