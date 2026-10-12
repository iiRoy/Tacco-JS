function ProcessInput(rawData) {
  // The raw input string is split by newlines, then each line is split by spaces.
  const parsedData = rawData.split("\n").map(lineSegment => lineSegment.split(" "));
  // The first element of the first line indicates the total number of data points.
  const pointCount = parsedData[0][0];

  // This internal routine determines how many points "dominate" or are "dominated by"
  // a specified point within the dataset.
  // A point (otherX, otherY) is considered to dominate (currentX, currentY) if
  // (currentX < otherX AND currentY < otherY) OR (otherX < currentX AND otherY < currentY).
  const calculateDominance = (currentIdx, currentX, currentY) => {
    // Initialize the count, starting with 1 because the current point itself is included in the "set" being considered.
    let dominantPoints = 1;
    // Iterate through all available data points, indexed from 1 up to the total count.
    for (let k = 1; k <= pointCount; k++) {
      // Skip the comparison if the current iteration refers to the point being evaluated.
      if (currentIdx === k) {
        continue;
      }
      // Extract the X and Y coordinates for the other point from the parsed data.
      const otherX = parsedData[k][0], otherY = parsedData[k][1];
      // Check if the dominance condition is met.
      if ((currentX < otherX && currentY < otherY) || (otherX < currentX && otherY < currentY)) {
        dominantPoints++; // Increment the count if the condition holds true.
      }
    }
    return dominantPoints; // Return the final count of dominant/dominated points.
  };

  // Loop through each point in the dataset, from the first (index 1) to the last.
  for (let j = 1; j <= pointCount; j++) {
    // For each point, call the helper function to compute its dominance count
    // and print the result to the console.
    console.log(calculateDominance(j, parsedData[j][0], parsedData[j][1]));
  }
}

// This line is responsible for reading input from standard input and passing it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
