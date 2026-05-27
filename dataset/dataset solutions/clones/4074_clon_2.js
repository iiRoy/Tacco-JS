// This script determines if a series of movements between points is feasible within given time constraints.
function ProcessInput(rawData) {
  // Split the entire input string by newline characters to get an array of individual lines.
  const lines = rawData.split("\n");

  let currentXCoordinate = 0; // Initialize the current X position to the origin.
  let currentYCoordinate = 0; // Initialize the current Y position to the origin.
  let feasibilityOutcome = "Yes"; // Assume the journey is possible until a condition proves otherwise.
  let previousSegmentSubtractionValue = 0; // This variable stores a value used in a specific calculation for the next segment's duration.

  // Iterate through the movement instructions, skipping the first line which typically contains metadata.
  for (let instructionIndex = 1; instructionIndex < lines.length; instructionIndex++) {
    const segmentData = lines[instructionIndex].split(" "); // Split the current instruction line into its components.

    let absoluteTargetTime = parseInt(segmentData[0], 10); // The absolute time (from start) to reach this point.

    // Calculate the absolute distance needed to travel in X and Y directions.
    // Note: currentXCoordinate and currentYCoordinate might be strings due to previous assignments,
    // but the 'calculateManhattanDistance' function handles numeric coercion.
    const xDistanceRequired = calculateManhattanDistance(currentXCoordinate, segmentData[1]);
    const yDistanceRequired = calculateManhattanDistance(currentYCoordinate, segmentData[2]);

    // Calculate the effective duration for this specific movement segment.
    // This calculation method is a direct replication of the original's logic.
    let segmentTravelDuration = absoluteTargetTime - previousSegmentSubtractionValue;

    // Check if the total distance is less than the available time for this segment.
    if (xDistanceRequired + yDistanceRequired < segmentTravelDuration) {
      // If there's excess time, check if the remaining time is odd.
      // An odd remainder means it's impossible to reach the target and return to it within the time.
      if (parseInt(segmentTravelDuration - (xDistanceRequired + yDistanceRequired), 10) % 2 !== 0) {
        feasibilityOutcome = "No"; // Mark as impossible.
      }
    }
    // Check if the total distance is greater than the available time for this segment.
    // This condition in the original code sets the outcome to "Yes" if distance > time.
    else if (xDistanceRequired + yDistanceRequired > segmentTravelDuration) {
      feasibilityOutcome = "Yes"; // Replicating the original's potentially counter-intuitive logic.
    }

    // Update the current coordinates to the target coordinates for the next iteration.
    // These are stored as strings, mirroring the original's behavior.
    currentXCoordinate = segmentData[1];
    currentYCoordinate = segmentData[2];
    // Update the subtraction value for the next segment's duration calculation.
    previousSegmentSubtractionValue = segmentTravelDuration;
  }

  // Output the final feasibility determination.
  console.log(feasibilityOutcome);
}

// A utility function to compute the absolute difference between two coordinate values.
// It implicitly handles string-to-number coercion for its arguments.
function calculateManhattanDistance(startCoordinate, endCoordinate) {
  // Determine the absolute difference, regardless of direction.
  if (startCoordinate < endCoordinate) {
    return endCoordinate - startCoordinate;
  } else {
    return startCoordinate - endCoordinate;
  }
}

// Read the entire content of standard input synchronously and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
