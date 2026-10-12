function processInputData(rawData) {
  const parsedNumericValues = rawData.split(" ").map(currentSegment => +currentSegment);

  const valueX = parsedNumericValues[0];
  const valueY = parsedNumericValues[1];
  const valueZ = parsedNumericValues[2];
  const limitThreshold = parsedNumericValues[3];

  let finalOutcome = "Yes";

  // Helper function to check if the absolute difference between two values exceeds a given limit
  const checkAbsoluteDifferenceExceedsLimit = (val1, val2, limit) => {
    return Math.abs(val1 - val2) > limit;
  };

  // Evaluate the first primary condition
  const isDirectPathTooLong = checkAbsoluteDifferenceExceedsLimit(valueX, valueZ, limitThreshold);

  // If the primary condition is met, then evaluate the secondary conditions
  if (isDirectPathTooLong) {
    const isPathViaYFromXTooLong = checkAbsoluteDifferenceExceedsLimit(valueX, valueY, limitThreshold);
    const isPathViaYFromZTooLong = checkAbsoluteDifferenceExceedsLimit(valueZ, valueY, limitThreshold);

    // If either of the secondary conditions is met, change the outcome
    if (isPathViaYFromXTooLong || isPathViaYFromZTooLong) {
      finalOutcome = "No";
    }
  }

  console.log(finalOutcome);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
