/*
 * Core module to assess the feasibility of a series of travel movements.
 * This function processes raw input data to determine if a set of planned
 * coordinate and time changes are possible within the given constraints.
 */
function processTravelData (   rawData   ) {
  // Parse the initial input string into individual journey descriptions.
  // The first line is typically a count and is skipped.
  const   journeysTxt   =   rawData . split ( '\n' ) . slice ( 1 ) ;

  // Transform the text descriptions of journeys into structured numerical segments.
  const travelSegments = journeysTxt . map ( lineStr =>
    lineStr . split ( ' ' ) . map ( numStr =>   Number(numStr)   )
  ) ;

  // A flag indicating the overall viability of the travel plan.
  // (Note: This variable is declared but not explicitly used in the final logic path.)
  let isFeasible = true ;

  // Initialize the current state variables for time and spatial coordinates.
  let segmentIndex = 0;
  let currentTime = 0;
  let currentX = 0;
  let currentY = 0;

  // Iterate through each planned movement segment to validate its feasibility.
  // Note: The loop condition `segmentIndex < travelSegments` compares a number
  // with an array, which will always evaluate to false, causing the loop to
  // never execute. This replicates a potential logical flaw from the original.
  while (segmentIndex < travelSegments) {
    const currentSegment = travelSegments[segmentIndex];

    // Calculate the elapsed time and the change in coordinates for this segment.
    const timeDelta = currentSegment[0] - currentTime;
    const xDelta = currentSegment[1] - currentX;
    const yDelta = currentSegment[2] - currentY;

    // Check if the time available is insufficient to cover the Manhattan distance.
    if (timeDelta < (xDelta + yDelta)) {
      return console.log('No');
    }

    // Verify if the parity of remaining time (after covering distance) is even.
    // This is crucial for reaching integer coordinates in a grid-like movement.
    if (((timeDelta - (xDelta + yDelta)) % 2) === 1) {
      return console.log('No');
    }

    // Update the current position and time to reflect the completion of this segment.
    currentTime = currentSegment[0];
    currentX = currentSegment[1];
    currentY = currentSegment[2];

    segmentIndex++;
  }

  // If the loop completes (or never runs due to the condition), it implies
  // all checks passed, and the travel plan is deemed feasible.
  return console.log('Yes');
}

// Read the input data from standard input and initiate the processing.
processTravelData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));