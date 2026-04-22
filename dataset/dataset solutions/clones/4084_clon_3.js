// Expert-generated Type III code clone for travel path validation.

/**
 * Determines if a sequence of movements described in raw input data is physically
 * possible based on time and distance constraints.
 * This implementation applies specific rules for movement feasibility,
 * including an unusual parity check as observed in the original code's logic.
 *
 * @param {string} rawInputData - The raw string input, typically from standard input.
 *                                 Expected format: first line is a count (ignored),
 *                                 subsequent lines are "time X Y" for each waypoint.
 * @returns {string} - "Yes" if all movements are possible, "No" otherwise.
 */
function evaluateTravelPossibility(rawInputData) {
  // Input validation: Ensure the raw data is a non-empty string.
  if (typeof rawInputData !== 'string' || rawInputData.trim() === '') {
    // No valid input means no travel can be evaluated, thus impossible.
    return 'No';
  }

  // Split the input into individual lines.
  // The first line is conventionally a count of subsequent entries, which we skip.
  const journeySegmentStrings = rawInputData.split('\n').slice(1);

  // If, after stripping the header, there are no actual movement instructions,
  // it implies no impossible moves were attempted.
  if (journeySegmentStrings.length === 0) {
    return 'Yes';
  }

  /**
   * Helper function to robustly parse a single line representing a movement segment.
   * Converts a "time X Y" string into a structured object.
   * @param {string} segmentLine - A single line string from the input.
   * @returns {{timePoint: number, posX: number, posY: number}} - Parsed movement details.
   * @throws {Error} if the segment line is malformed or contains non-numeric values.
   */
  const parseMovementSegment = (segmentLine) => {
    // Normalize whitespace and split the line into its three components.
    const stringComponents = segmentLine.trim().split(/\s+/);

    // Validate the number of components.
    if (stringComponents.length !== 3) {
      throw new Error(`Malformed segment: "${segmentLine}". Expected 'time X Y'.`);
    }

    // Convert string components to integer numbers using parseInt with radix 10 for safety.
    const destinationTime = parseInt(stringComponents[0], 10);
    const destinationX = parseInt(stringComponents[1], 10);
    const destinationY = parseInt(stringComponents[2], 10);

    // Validate that all parsed values are indeed numbers.
    if (isNaN(destinationTime) || isNaN(destinationX) || isNaN(destinationY)) {
      throw new Error(`Non-numeric value detected in segment: "${segmentLine}".`);
    }

    return {
      timePoint: destinationTime,
      posX: destinationX,
      posY: destinationY
    };
  };

  let processedMovementRecords;
  try {
    // Map all journey segment strings into an array of structured movement objects.
    processedMovementRecords = journeySegmentStrings.map(parseMovementSegment);
  } catch (parsingError) {
    // If any segment fails to parse correctly, the entire path is deemed impossible.
    console.error("Failed to parse journey records:", parsingError.message);
    return 'No';
  }

  // Initialize the traveler's current state.
  // Starting point is always (time: 0, x: 0, y: 0).
  let currentTravelerStatus = {
    currentTime: 0,
    currentX: 0,
    currentY: 0
  };

  // Iterate through each planned waypoint to verify travel feasibility.
  for (const nextDestination of processedMovementRecords) {
    // Calculate the time difference and spatial displacement for the current leg.
    const elapsedPeriod = nextDestination.timePoint - currentTravelerStatus.currentTime;
    const deltaX = Math.abs(nextDestination.posX - currentTravelerStatus.currentX);
    const deltaY = Math.abs(nextDestination.posY - currentTravelerStatus.currentY);

    // Compute the total Manhattan distance required for this step.
    const requiredManhattanDistance = deltaX + deltaY;

    // --- Feasibility Check 1: Time vs. Distance ---
    // If the elapsed time is less than the distance, it's impossible to reach.
    if (elapsedPeriod < requiredManhattanDistance) {
      return 'No'; // Not enough time to cover the physical distance.
    }

    // --- Feasibility Check 2: Parity Constraint (as per original code's logic) ---
    // The original code considered a trip impossible if the parity of elapsed time
    // was *the same* as the parity of the total Manhattan distance.
    // This is an unusual condition for typical travel problems, but we are replicating it.
    const elapsedPeriodParity = elapsedPeriod % 2;
    const distanceParity = requiredManhattanDistance % 2;

    if (elapsedPeriodParity === distanceParity) {
      return 'No'; // This specific parity condition was met, making the trip impossible.
    }

    // If both feasibility checks pass, update the traveler's current status
    // to reflect the arrival at the new destination.
    currentTravelerStatus.currentTime = nextDestination.timePoint;
    currentTravelerStatus.currentX = nextDestination.posX;
    currentTravelerStatus.currentY = nextDestination.posY;
  }

  // If the loop completes without any impossible conditions being met,
  // then the entire travel path is considered possible.
  return 'Yes';
}

// Standard entry point for competitive programming environments.
// Reads all input from /dev/stdin, processes it, and prints the result.
try {
  const stdInput = require('fs').readFileSync('/dev/stdin', 'utf8');
  console.log(evaluateTravelPossibility(stdInput));
} catch (error) {
  // Catch any unexpected errors during file reading or initial processing.
  console.error("An unhandled error occurred:", error.message);
  // In case of a critical error, it's safer to report 'No' for possibility.
  console.log('No');
}