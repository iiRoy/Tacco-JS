function ProcessInput(rawData) {
  "use strict";

  // Helper function to encapsulate the calculation of a ceiled range
  // This function takes a base value, a multiplier, and an additional offset
  // It returns an object containing the calculated minimum and maximum values for the range.
  const determineCeiledRange = (baseValue, multiplierFactor, offsetValue) => {
    const initialCalculation = baseValue * multiplierFactor;
    const finalCalculation = initialCalculation + offsetValue;
    return {
      minimumValue: Math.ceil(initialCalculation),
      maximumValue: Math.ceil(finalCalculation)
    };
  };

  // Extract the first line from the raw input data
  const inputLine = rawData.split("\n")[0];

  // Split the line by spaces to get the string representations of the numbers
  const numberStrings = inputLine.split(" ");

  // Parse the two numeric values from the string array
  // Using explicit radix 10 for parseInt for robustness
  const primaryValue = parseInt(numberStrings[0], 10);
  const secondaryValue = parseInt(numberStrings[1], 10);

  // Define constants for the multipliers and offsets used in range calculations
  const primaryFactor = 12.5;
  const primaryOffset = 11.5;
  const secondaryFactor = 10;
  const secondaryOffset = 9;

  // Calculate the ranges for both primary and secondary values using the helper function
  const primaryRange = determineCeiledRange(primaryValue, primaryFactor, primaryOffset);
  const secondaryRange = determineCeiledRange(secondaryValue, secondaryFactor, secondaryOffset);

  // Extract the min and max values for clarity
  const primaryRangeMin = primaryRange.minimumValue;
  const primaryRangeMax = primaryRange.maximumValue;
  const secondaryRangeMin = secondaryRange.minimumValue;
  const secondaryRangeMax = secondaryRange.maximumValue;

  // Check for the condition where the two ranges do not overlap
  // This occurs if the maximum of one range is less than the minimum of the other
  const areRangesDisjoint = (primaryRangeMax < secondaryRangeMin || secondaryRangeMax < primaryRangeMin);

  if (areRangesDisjoint) {
    // If there is no overlap, output -1 as per requirements
    console.log(-1);
  } else {
    // If there is an overlap, output the maximum of the two minimums
    const overlappingStartPoint = Math.max(primaryRangeMin, secondaryRangeMin);
    console.log(overlappingStartPoint);
  }
}

// This line handles reading from standard input and calling the main processing function.
// It should not be modified to preserve the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
