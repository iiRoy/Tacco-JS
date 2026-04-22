const retrieveInputData = () => {
  const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
  return rawContent.split('\n');
};

let inputSourceLines = retrieveInputData();
let currentLineIndex = 0;

const parseIntegersFromLine = () => {
  return inputSourceLines[currentLineIndex++].split(' ').map(Number);
};

const parseIntegerGrid = (rowsCount) => {
  const grid = [];
  for (let i = 0; i < rowsCount; i++) {
    grid.push(inputSourceLines[currentLineIndex++].split(' ').map(Number));
  }
  return grid;
};

const deliverOutput = (valueToDisplay) => {
  let formattedResult;
  if (valueToDisplay === true) { formattedResult = 'Yes'; }
  else if (valueToDisplay === false) { formattedResult = 'No'; }
  else { formattedResult = valueToDisplay; }
  console.log(formattedResult);
};

// Ensures a positive result for modulo operations
const computePositiveModulo = (val, mod) => (val % mod + mod) % mod;

// Calculates the number of times two ants effectively "cross" each other
// based on their initial states, time, and track dimensions.
const evaluateInteractions = (
  primaryAntCurrentPosition, primaryAntTravelDirection,
  secondaryAntCurrentPosition, secondaryAntTravelDirection,
  elapsedTimeValue, trackDimension
) => {
  // Ants moving in the same direction don't effectively cross each other
  if (primaryAntTravelDirection === secondaryAntTravelDirection) {
    return 0;
  }

  let distanceForCalculation; // This corresponds to 'd' in the original code
  if (primaryAntTravelDirection === 1) { // Primary ant moves clockwise
    distanceForCalculation = secondaryAntCurrentPosition - primaryAntCurrentPosition;
  } else { // Primary ant moves counter-clockwise
    distanceForCalculation = (trackDimension - secondaryAntCurrentPosition) + primaryAntCurrentPosition;
  }

  // The formula (2 * T + L - d) / L | 0 from the original
  const numeratorTerm = (2 * elapsedTimeValue + trackDimension - distanceForCalculation);
  const rawEstimate = numeratorTerm / trackDimension;
  return Math.trunc(rawEstimate); // Math.trunc replicates the behavior of | 0
};

// Main simulation entry point
const runAntScenario = () => {
  const [populationSize, circuitLength, durationTime] = parseIntegersFromLine();
  const initialAntConfiguration = parseIntegerGrid(populationSize);

  // Phase 1: Calculate each ant's final position assuming they pass through each other
  const individualFinalCoordinates = initialAntConfiguration.map(antSpec => {
    const startCoord = antSpec[0];
    const moveDir = antSpec[1];
    const totalTravel = moveDir * durationTime;
    return computePositiveModulo(startCoord + totalTravel, circuitLength);
  });

  // Phase 2: Determine the total shift in order for the first ant (index 0)
  const firstAntDetails = initialAntConfiguration[0];
  const firstAntDirection = firstAntDetails[1];

  let accumulatedOrderShift = 0;
  initialAntConfiguration.slice(1).forEach(otherAntDetails => {
    accumulatedOrderShift = computePositiveModulo(
      accumulatedOrderShift + evaluateInteractions(
        firstAntDetails[0], firstAntDirection,
        otherAntDetails[0], otherAntDetails[1],
        durationTime, circuitLength
      ),
      populationSize
    );
  });

  // Phase 3: Map the initial ant indices to their actual final positions
  // The 'totalShiftValue' determines how the ranks are permuted.
  const totalShiftValue = (firstAntDirection === 1 ? accumulatedOrderShift : -accumulatedOrderShift);
  
  const finalSequenceOfPositions = Array(populationSize);

  for (let finalRankPosition = 0; finalRankPosition < populationSize; ++finalRankPosition) {
    // Find the initial ant index whose final rank is 'finalRankPosition'
    const originalAntIdentifier = computePositiveModulo(finalRankPosition - totalShiftValue, populationSize);
    finalSequenceOfPositions[finalRankPosition] = individualFinalCoordinates[originalAntIdentifier];
  }
  
  return finalSequenceOfPositions.join('\n');
};

deliverOutput(runAntScenario());