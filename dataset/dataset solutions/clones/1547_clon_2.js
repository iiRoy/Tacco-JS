// This function processes the provided input to determine if a journey can be completed within a given time.
const processInputData = sourceText => {
  // Parse the input string, which contains journey length, maximum allowed time, and average travel speed.
  let [ journeyLength, maximumDuration, averageVelocity ] = sourceText.split(" ");

  // Convert string values to numbers for arithmetic operations.
  journeyLength = parseFloat(journeyLength);
  maximumDuration = parseFloat(maximumDuration);
  averageVelocity = parseFloat(averageVelocity);

  // Calculate the minimum time required for the journey.
  const necessaryTravelTime = journeyLength / averageVelocity;

  /*
   * Check if the maximum allowed duration is greater than or equal to the calculated
   * minimum time needed for the entire trip.
   */
  if ( maximumDuration >= necessaryTravelTime ) {
    console.log("Feasible"); // Output indicating a successful trip within limits.
  }

  else {
    console.log("Infeasible"); // Output indicating the trip cannot be completed on time.
  }
};

// Retrieve data from standard input and pass it to the processing function for evaluation.
processInputData(
  require('fs')
    .readFileSync('/dev/stdin', 'utf8')
);