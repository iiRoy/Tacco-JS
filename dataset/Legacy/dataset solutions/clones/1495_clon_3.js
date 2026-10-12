function ProcessInput(rawData) {
  // Step 1: Parse the raw input string into a 2D array of strings.
  // Each line becomes an array of space-separated values.
  const processedData = rawData.split("\n").map(lineString => lineString.split(" "));

  // Step 2: Extract the total count of points from the first element of the first line.
  // Convert it to a number as it will be used for loop bounds.
  const totalPointCount = Number(processedData[0][0]);

  // Step 3: Define a constant for the repetitive separator message.
  const SEPARATOR_OUTPUT_STRING = "xxxxxxx";

  // Step 4: Introduce a small helper function to encapsulate the core comparison logic.
  // This improves readability and modularity by abstracting the conditional check.
  const checkQuadrantRelation = (coord1X, coord1Y, coord2X, coord2Y) => {
    // Explicitly convert string coordinates to numbers for accurate comparison.
    const numCoord1X = Number(coord1X);
    const numCoord1Y = Number(coord1Y);
    const numCoord2X = Number(coord2X);
    const numCoord2Y = Number(coord2Y);

    // The condition checks if one point is strictly "above and to the right"
    // or "below and to the left" of the other.
    return (numCoord1X < numCoord2X && numCoord1Y < numCoord2Y) ||
           (numCoord2X < numCoord1X && numCoord2Y < numCoord1Y);
  };

  // Step 5: Refactor the inner loop logic into a dedicated function.
  // This function calculates how many other points satisfy the quadrant relation
  // with a given 'current' point.
  const calculateRelatedPointsCount = (currentPointIndex, currentPointX, currentPointY) => {
    // Initialize the count. The current point itself is included in the count,
    // as per the original logic ("現在地含むなので1から開始").
    let relatedPointsCounter = 1;

    // Iterate through all points, starting from index 1 (skipping the 'n' value).
    for (let otherPointIndex = 1; otherPointIndex <= totalPointCount; otherPointIndex++) {
      // Skip comparison if the 'other' point is the same as the 'current' point.
      if (currentPointIndex === otherPointIndex) {
        continue;
      }

      // Retrieve coordinates of the 'other' point from the processed data.
      const otherPointX = processedData[otherPointIndex][0];
      const otherPointY = processedData[otherPointIndex][1];

      // Use the helper function to check the quadrant relation.
      if (checkQuadrantRelation(currentPointX, currentPointY, otherPointX, otherPointY)) {
        // If the condition is met, log the coordinates of the 'other' point.
        console.log(otherPointX, otherPointY);
        relatedPointsCounter++; // Increment the count of related points.
      }
    }
    return relatedPointsCounter; // Return the total count.
  };

  // Step 6: Implement the main loop that iterates through each point.
  // This loop processes each point as the 'current' point.
  for (let mainIterationIndex = 1; mainIterationIndex <= totalPointCount; mainIterationIndex++) {
    // Output the predefined separator string before processing each point.
    console.log(SEPARATOR_OUTPUT_STRING);

    // Extract the coordinates of the current point for this iteration.
    const currentIterationX = processedData[mainIterationIndex][0];
    const currentIterationY = processedData[mainIterationIndex][1];

    // Call the refactored function to get the count of related points for the current point.
    const finalRelatedCount = calculateRelatedPointsCount(mainIterationIndex, currentIterationX, currentIterationY);

    // Log the final count returned by the function.
    console.log(finalRelatedCount);
  }
}

// Standard boilerplate for reading input from /dev/stdin in Node.js environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
