// This module processes input data to compute a specific numerical outcome.
// It analyzes three integer values to determine a final aggregated result.

const processComputationalTask = (inputStringData) => {
  // Parse the raw input string into numerical components.
  // We expect three space-separated integers.
  const inputComponents = inputStringData.trim().split(' ').map(Number);

  // For Type III variation, we could add robust error handling here.
  // For this clone, we assume valid input as per original design.
  if (inputComponents.length !== 3 || inputComponents.some(isNaN)) {
    // A production system might throw an error or provide defaults.
    // For this cloning exercise, we'll proceed, assuming valid input.
    console.error("Warning: Input format might be incorrect. Expected three space-separated numbers.");
  }

  // Assign descriptive names to the initial values for clarity.
  let [initialValueA, initialValueB, initialValueC] = inputComponents;

  // Initialize the accumulator for the final result.
  let finalCalculatedResult = 0;

  // --- Phase 1: Process initialValueB and initialValueC based on their relative magnitudes. ---
  // This phase prioritizes combining or utilizing 'initialValueB' in conjunction with 'initialValueC'.
  let scoreContributionFromPhase1 = 0;

  // Evaluate if 'initialValueC' is less than or equal to 'initialValueB'.
  if (initialValueC <= initialValueB) {
    // If 'initialValueC' is smaller or equal, consume both fully and add their sum to the score.
    scoreContributionFromPhase1 = initialValueC + initialValueB;
    initialValueC = 0; // All of C is considered utilized.
    initialValueB = 0; // All of B is considered utilized. (Added for explicitness in Type III)
  } else {
    // If 'initialValueC' is greater, form pairs using all of 'initialValueB',
    // adding 2 for each unit of 'initialValueB'.
    scoreContributionFromPhase1 = initialValueB * 2;
    initialValueC -= initialValueB; // Reduce 'initialValueC' by the amount of 'initialValueB' used.
    initialValueB = 0; // All of B is considered utilized.
  }
  finalCalculatedResult += scoreContributionFromPhase1;

  // --- Phase 2: Process any remaining 'initialValueC' with 'initialValueA'. ---
  // This phase involves pairing any residual 'initialValueC' with 'initialValueA'.
  if (initialValueC > 0) {
    let unitsToTransferFromC = 0;

    // Determine the minimum quantity that can be 'transferred' or paired.
    // This is a rewrite of Math.min(initialValueC, initialValueA) for Type III.
    if (initialValueC < initialValueA) {
      unitsToTransferFromC = initialValueC;
    } else {
      unitsToTransferFromC = initialValueA;
    }

    // Update the remaining 'initialValueC' and add the transferred quantity to the result.
    initialValueC = initialValueC - unitsToTransferFromC;
    finalCalculatedResult = finalCalculatedResult + unitsToTransferFromC;
  }

  // --- Phase 3: Final check for any residual 'initialValueC'. ---
  // If even a single unit of 'initialValueC' remains after all pairings, it contributes an additional point.
  const hasAnyResidualC = (initialValueC > 0);
  if (hasAnyResidualC) {
    finalCalculatedResult += 1; // Explicitly adding 1 instead of using a unary increment operator.
  }

  // Output the final computed result to standard output.
  console.log(finalCalculatedResult);
};

// Helper function to abstract the process of obtaining raw input data from a file system.
const obtainInputData = () => {
  const fileSystemModule = require('fs');
  const standardInputFilePath = '/dev/stdin';
  const textEncodingFormat = 'utf8';
  return fileSystemModule.readFileSync(standardInputFilePath, textEncodingFormat);
};

// Execute the main processing task by passing the input data obtained from standard input.
processComputationalTask(obtainInputData());