function ProcessInput(rawData) {
  // The first line of input is rawData[0], the second is rawData[1], and so on.
  // Split the raw input by newlines and remove any empty strings that might result from extra newlines.
  rawData = rawData.split("\n").filter(Boolean);

  // Parse the total number of points from the initial line of the input data.
  const pointCount = +rawData[0];

  // Handle edge cases where the number of points is two or less.
  // In such scenarios, all points are inherently collinear, meaning only one point needs to be "removed"
  // to satisfy the condition (or rather, 1 is the minimum number of points that are not part of the largest collinear set).
  if (pointCount <= 2) {
    console.log(1);
    return; // Terminate function execution early.
  }

  // Extract the coordinate pairs from the input, starting from the second line.
  // Each line string is split by space, and each resulting part is converted into a numeric value.
  const coordinates = rawData.slice(1).map(lineStr => lineStr.split(' ').map(val => +val));

  // Initialize an object to store the frequency of each distinct vector encountered.
  // Keys will be string representations of vectors (e.g., "deltaX_deltaY"), and values will be their counts.
  const vectorCounts = {};

  // Iterate through all possible ordered pairs of distinct points to compute vectors between them.
  coordinates.forEach(coordA => {
    coordinates.forEach(coordB => {
      // Skip processing if the two points being compared are identical.
      if (coordA === coordB) {
        return;
      }

      // Calculate the components of the vector from coordA to coordB.
      const directionVector = [coordB[0] - coordA[0], coordB[1] - coordA[1]];

      // Generate a unique string key for the vector to be used in the frequency map.
      const vectorKey = directionVector.join('_');

      // Increment the count for this specific vector. If this is the first time this vector is seen,
      // initialize its count to one; otherwise, add one to its existing count.
      vectorCounts[vectorKey] = vectorCounts[vectorKey] === undefined ? 1 : vectorCounts[vectorKey] + 1;
    });
  });

  // Determine the vector that occurs with the highest frequency among all calculated vectors.
  // The 'reduce' method iterates over the keys of the 'vectorCounts' object.
  // 'accumulator' holds an array: [maximum_count_found_so_far, key_of_that_vector].
  const maxVectorInfo = Object.keys(vectorCounts).reduce((accumulator, currentVectorKey) => {
    const currentCount = vectorCounts[currentVectorKey];
    // If the count of the current vector is greater than the maximum count recorded in the accumulator,
    // update the accumulator with this new maximum count and its corresponding vector key.
    // Otherwise, retain the existing maximum count and key.
    return currentCount > accumulator[0] ? [currentCount, currentVectorKey] : [accumulator[0], accumulator[1]];
  }, [1, '']); // Initialize accumulator with a count of 1 (minimum possible) and an empty string for the key.

  // The problem asks for the minimum number of points to remove to make the remaining points collinear.
  // If 'maxVectorInfo[0]' represents the count of points that form the most frequent vector (i.e., are collinear along that direction),
  // then 'pointCount - maxVectorInfo[0]' gives the number of points that do not align with this dominant collinear set.
  // These are the points that must be removed.
  console.log(pointCount - maxVectorInfo[0]);
}

// This line should not be modified (it handles reading input from standard input and invoking the main processing function).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
