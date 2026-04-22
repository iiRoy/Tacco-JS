function ProcessCoordinateData(rawInputLines) {
  // This function processes geographical coordinate data to find the maximum number of collinear points.
  // The input string contains lines of data, with the first line indicating the total count of points.
  rawInputLines = rawInputLines.split('\n').filter(Boolean); // Split input into individual lines and remove any empty ones.

  // Extract the total number of data points from the first line.
  const totalPoints = +rawInputLines[0];

  // Handle edge cases where the number of points is too small to form meaningful displacements.
  if (totalPoints <= 2) {
    console.log(1); // With 1 or 2 points, the maximum collinear set is trivially 1.
    return;
  }

  // Parse the subsequent lines to get the actual (x, y) coordinate pairs.
  const pointCoordinates = rawInputLines
    .slice(1)
    .map(lineStr => lineStr.split(' ').map(valStr => +valStr)); // Convert string coordinates to numbers.

  // Initialize an object to store the frequency of each unique displacement vector.
  const vectorFrequency = {};

  // Iterate through all possible ordered pairs of points (P_alpha, P_beta).
  pointCoordinates.forEach(pointAlpha => {
    pointCoordinates.forEach(pointBeta => {
      // Skip self-comparison as a point cannot form a displacement vector with itself.
      if (pointAlpha === pointBeta) {
        return;
      }

      // Calculate the displacement vector components (delta_x, delta_y).
      const deltaVector = [pointBeta[0] - pointAlpha[0], pointBeta[1] - pointAlpha[1]];

      // Create a unique string representation for the displacement vector.
      const vectorKey = deltaVector.join('_');

      // Increment the counter for this specific vector, or initialize it if seen for the first time.
      vectorFrequency[vectorKey] = (vectorFrequency[vectorKey] === undefined) ? 1 : vectorFrequency[vectorKey] + 1;
    });
  });

  // Determine the displacement vector that occurs with the highest frequency.
  const maxFrequencyData = Object.keys(vectorFrequency).reduce((currentMaxInfo, vectorIdString) => {
    const currentFrequency = vectorFrequency[vectorIdString];

    // If the current vector's frequency is higher than the previously recorded maximum, update.
    return currentFrequency > currentMaxInfo[0] ? [currentFrequency, vectorIdString] : currentMaxInfo;
  }, [1, '']); // Initial maximum frequency set to 1, with an empty placeholder for the vector ID.

  // The final answer is the total number of points minus the maximum frequency of any displacement vector.
  // This represents the minimum number of points that need to be removed to make all remaining points collinear.
  console.log(totalPoints - maxFrequencyData[0]);
}