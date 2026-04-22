// A constant representing the magic point cost incurred for each merge operation.
const MERGE_OPERATION_COST = 10;

// This recursive function calculates the minimum magic points required
// to achieve the target bamboo lengths by combining available segments.
//
// Parameters:
//   idx: The current index of the segment being considered from the 'pieceList'.
//   totalSegmentsCount: The total number of segments available.
//   desiredLengths: An array [targetA, targetB, targetC] representing the goal lengths.
//   currentBambooState: An array [lenA, lenB, lenC] representing the current lengths of bamboos.
//   pieceList: An array of available bamboo segment lengths.
//
// Returns: The minimum magic points, or Infinity if an impossible state is reached.
function determineOptimalBambooScore(
  idx,
  totalSegmentsCount,
  desiredLengths,
  currentBambooState,
  pieceList
) {
  // Base case: If all segments have been processed.
  if (idx === totalSegmentsCount) {
    // Check if any target bamboo was not formed (i.e., its current length is 0
    // but a non-zero target length was specified). If so, this path is invalid.
    if (
      (desiredLengths[0] > 0 && currentBambooState[0] === 0) ||
      (desiredLengths[1] > 0 && currentBambooState[1] === 0) ||
      (desiredLengths[2] > 0 && currentBambooState[2] === 0)
    ) {
      return Infinity; // Indicate an invalid or impossible configuration.
    }

    // Calculate the total cost for length adjustments.
    const adjustmentCostA = Math.abs(desiredLengths[0] - currentBambooState[0]);
    const adjustmentCostB = Math.abs(desiredLengths[1] - currentBambooState[1]);
    const adjustmentCostC = Math.abs(desiredLengths[2] - currentBambooState[2]);

    return adjustmentCostA + adjustmentCostB + adjustmentCostC;
  }

  // Retrieve the length of the current segment being evaluated.
  const currentSegmentLength = pieceList[idx];

  // Option 1: Skip the current segment; do not use it for any bamboo.
  const costPathSkipSegment = determineOptimalBambooScore(
    idx + 1,
    totalSegmentsCount,
    desiredLengths,
    currentBambooState,
    pieceList
  );

  // Option 2: Add the current segment to bamboo A.
  // Create a new state to avoid modifying the original array for other paths.
  const nextStateForA = [...currentBambooState];
  nextStateForA[0] += currentSegmentLength;
  const costPathAddA =
    determineOptimalBambooScore(
      idx + 1,
      totalSegmentsCount,
      desiredLengths,
      nextStateForA,
      pieceList
    ) + MERGE_OPERATION_COST; // Adding a segment always costs 10 MP.

  // Option 3: Add the current segment to bamboo B.
  const nextStateForB = [...currentBambooState];
  nextStateForB[1] += currentSegmentLength;
  const costPathAddB =
    determineOptimalBambooScore(
      idx + 1,
      totalSegmentsCount,
      desiredLengths,
      nextStateForB,
      pieceList
    ) + MERGE_OPERATION_COST; // Adding a segment always costs 10 MP.

  // Option 4: Add the current segment to bamboo C.
  const nextStateForC = [...currentBambooState];
  nextStateForC[2] += currentSegmentLength;
  const costPathAddC =
    determineOptimalBambooScore(
      idx + 1,
      totalSegmentsCount,
      desiredLengths,
      nextStateForC,
      pieceList
    ) + MERGE_OPERATION_COST; // Adding a segment always costs 10 MP.

  // Return the minimum cost found among all four possible paths.
  return Math.min(costPathSkipSegment, costPathAddA, costPathAddB, costPathAddC);
}

// A fixed cost associated with the initial formation of three bamboos (A, B, C).
// This is typically 3 * 10 MP, as implied by the problem structure.
const IMPLICIT_INITIAL_FORMATION_COST = 30;

// The primary function to handle input parsing, orchestrate the solution, and output results.
function processBambooChallenge(problemInputString) {
  // Guard clause for empty or invalid input.
  if (!problemInputString || problemInputString.trim().length === 0) {
    console.error("Input data is missing or empty. Please provide valid problem data.");
    return;
  }

  const allInputLines = problemInputString.split('\n');

  // Basic validation for the number of lines.
  if (allInputLines.length < 1) {
    console.error("Input data is malformed; expected at least one line.");
    return;
  }

  // Parse the first line containing N (number of segments) and target lengths A, B, C.
  const headerValues = allInputLines[0].split(' ').map(s => parseInt(s, 10));

  // Destructure for readability.
  const [numSegments, targetLengthA, targetLengthB, targetLengthC] = headerValues;

  // Validate parsed numerical values.
  if (
    isNaN(numSegments) ||
    isNaN(targetLengthA) ||
    isNaN(targetLengthB) ||
    isNaN(targetLengthC)
  ) {
    console.error("Failed to parse numerical values from the first line of input.");
    return;
  }

  // Extract the individual bamboo segment lengths from the subsequent lines.
  // We use slice(1) to skip the header line and filter out any empty lines.
  const individualSegmentLengths = allInputLines
    .slice(1)
    .filter(line => line.trim() !== '')
    .map(s => parseInt(s, 10));

  // Perform a sanity check on the number of provided segments.
  if (individualSegmentLengths.length !== numSegments) {
    console.warn(
      `Warning: Expected ${numSegments} segments based on input, but found ${individualSegmentLengths.length}.`
    );
    // Depending on problem requirements, this could be an error or just a warning.
    // We proceed assuming the problem expects us to use the actual number of segments found.
  }

  // Define the target bamboo lengths as an array.
  const targetDimensionLengths = [targetLengthA, targetLengthB, targetLengthC];
  // Initialize the current lengths of the three bamboos to zero.
  const initialBambooDimensions = [0, 0, 0];

  // Invoke the recursive solver to find the raw minimum cost.
  const rawMinimumMagicPoints = determineOptimalBambooScore(
    0, // Start processing from the first segment (index 0).
    numSegments, // Total number of segments to consider.
    targetDimensionLengths, // The target lengths for A, B, C.
    initialBambooDimensions, // The current lengths of A, B, C, starting at [0,0,0].
    individualSegmentLengths // The list of available segment lengths.
  );

  // If the raw calculated cost is Infinity, it means no valid combination was found.
  if (rawMinimumMagicPoints === Infinity) {
    console.log(-1); // Output -1 to indicate an impossible scenario.
  } else {
    // Adjust the raw cost by subtracting the implicit initial formation cost.
    // This accounts for the 3 * 10 MP "creation" cost of the three target bamboos.
    const finalAdjustedScore = rawMinimumMagicPoints - IMPLICIT_INITIAL_FORMATION_COST;
    console.log(finalAdjustedScore);
  }
}

// Read input from standard in and execute the challenge.
processBambooChallenge(require('fs').readFileSync('/dev/stdin', 'utf8'));