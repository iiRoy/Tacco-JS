'use strict'

// Function to analyze grid movement and boundary adjustments
function analyzePathBoundaries(rawDataString) {
  // Parse the raw input data string into tokens
  const dataTokens = rawDataString.split(/\s+/);

  // Helper function to extract and parse a numeric token from the input array
  const getNumericToken = () => parseInt(dataTokens.shift(), 10);
  // Helper function to extract a string token from the input array
  const getStringToken = () => dataTokens.shift();

  // Extract grid dimensions and movement parameters
  const gridHeight = getNumericToken(); // Corresponds to H in original
  const gridWidth = getNumericToken();  // Corresponds to W in original
  const totalSteps = getNumericToken(); // Corresponds to N in original
  let startRowPosition = getNumericToken(); // Corresponds to sr in original
  let startColPosition = getNumericToken(); // Corresponds to sc in original
  const entityMovementSequence = getStringToken(); // Corresponds to S in original
  const restrictionSequence = getStringToken();    // Corresponds to T in original

  // --- Initial Guard Clauses and Input Validations ---
  // Ensure grid dimensions and step count are positive
  if (totalSteps < 0 || gridHeight <= 0 || gridWidth <= 0) {
      // In a competitive programming context, this might not be checked,
      // but it's a good practice for robust code.
      console.log('ERROR: Invalid grid or step parameters provided.');
      return;
  }
  // Validate the starting position is within the grid boundaries
  if (startRowPosition < 1 || startRowPosition > gridHeight ||
      startColPosition < 1 || startColPosition > gridWidth) {
      console.log('ERROR: Starting position is outside the defined grid boundaries.');
      return;
  }
  // If there are no steps, the entity remains within bounds
  if (totalSteps === 0) {
      console.log('YES');
      return;
  }

  // An array of objects to store the reachable boundary states at each step.
  // Each object represents: { minColumn, maxColumn, minRow, maxRow }
  // This replaces the nested array 'dp' from the original code for better readability.
  const reachableBoundsHistory = [];

  // Initialize the first state (at step 0, before any moves)
  // The entity starts at a single point, so min/max for row/col are identical.
  reachableBoundsHistory[0] = {
    minColumn: startColPosition,
    maxColumn: startColPosition,
    minRow: startRowPosition,
    maxRow: startRowPosition
  };

  // --- Main Loop: Process each movement and restriction step ---
  for (let currentStepIndex = 0; currentStepIndex < totalSteps; currentStepIndex++) {
    // Retrieve the boundary state from the previous step
    const previousStepBounds = reachableBoundsHistory[currentStepIndex];

    // Create a new object for the current step's boundaries, initialized with previous step's values
    const currentStepBounds = {
      minColumn: previousStepBounds.minColumn,
      maxColumn: previousStepBounds.maxColumn,
      minRow: previousStepBounds.minRow,
      maxRow: previousStepBounds.maxRow
    };

    // Apply the entity's movement (from the 'S' sequence)
    // This shifts the entire reachable range.
    const moveInstruction = entityMovementSequence[currentStepIndex];
    switch (moveInstruction) {
      case 'L': // Move Left: Decrease the minimum column boundary
        currentStepBounds.minColumn--;
        break;
      case 'R': // Move Right: Increase the maximum column boundary
        currentStepBounds.maxColumn++;
        break;
      case 'U': // Move Up: Decrease the minimum row boundary
        currentStepBounds.minRow--;
        break;
      case 'D': // Move Down: Increase the maximum row boundary
        currentStepBounds.maxRow++;
        break;
      // Assuming valid input, no default case is strictly necessary.
    }

    // --- Immediate Boundary Check after 'S' Movement ---
    // If any part of the reachable area falls outside the 1-indexed grid,
    // it's an immediate failure condition.
    if (currentStepBounds.minColumn < 1 || currentStepBounds.maxColumn > gridWidth ||
        currentStepBounds.minRow < 1 || currentStepBounds.maxRow > gridHeight) {
      console.log('NO');
      return; // Terminate execution early
    }

    // --- Apply Boundary Adjustments/Restrictions (from 'T' sequence) ---
    // NOTE: This section replicates a potentially unconventional or buggy behavior from the original code.
    // The original code updates dp[i+1][0] (minColumn), and then uses this *updated* value
    // as the base for calculating dp[i+1][1], dp[i+1][2], and dp[i+1][3].
    // This exact sequence and dependency are preserved here to ensure functional similarity.
    const restrictionInstruction = restrictionSequence[currentStepIndex];

    // Temporary variable to hold the minColumn value after its T-update,
    // as it is used as a base for subsequent boundary calculations.
    let minColumnAfterTUpdate = currentStepBounds.minColumn;

    // First, apply 'T' effect to minColumn (corresponds to original dp[i+1][0])
    // Original: dp[i+1][0]=Math.min(dp[i+1][0]+(T[i]==='R'?1:0), W)
    if (restrictionInstruction === 'R') {
        minColumnAfterTUpdate++; // If 'R', minColumn increases
    }
    currentStepBounds.minColumn = Math.min(minColumnAfterTUpdate, gridWidth); // Clamp minColumn with gridWidth
    minColumnAfterTUpdate = currentStepBounds.minColumn; // Update temp variable to the final minColumn for this step

    // Second, apply 'T' effect to maxColumn (corresponds to original dp[i+1][1])
    // Original: dp[i+1][1]=Math.max(dp[i+1][0]-(T[i]==='L'?1:0), 1)
    // IMPORTANT: Replicating the bug, this uses `minColumnAfterTUpdate` (the *updated* minColumn) as its base.
    let maxColumnCalculationBase = minColumnAfterTUpdate;
    if (restrictionInstruction === 'L') {
        maxColumnCalculationBase--; // If 'L', maxColumn decreases
    }
    currentStepBounds.maxColumn = Math.max(maxColumnCalculationBase, 1); // Clamp maxColumn with 1

    // Third, apply 'T' effect to minRow (corresponds to original dp[i+1][2])
    // Original: dp[i+1][2]=Math.min(dp[i+1][0]+(T[i]==='D'?1:0), H)
    // IMPORTANT: Replicating the bug, this uses `minColumnAfterTUpdate` (the *updated* minColumn) as its base.
    let minRowCalculationBase = minColumnAfterTUpdate;
    if (restrictionInstruction === 'D') {
        minRowCalculationBase++; // If 'D', minRow increases
    }
    currentStepBounds.minRow = Math.min(minRowCalculationBase, gridHeight); // Clamp minRow with gridHeight

    // Fourth, apply 'T' effect to maxRow (corresponds to original dp[i+1][3])
    // Original: dp[i+1][3]=Math.max(dp[i+1][0]-(T[i]==='U'?1:0), 1)
    // IMPORTANT: Replicating the bug, this uses `minColumnAfterTUpdate` (the *updated* minColumn) as its base.
    let maxRowCalculationBase = minColumnAfterTUpdate;
    if (restrictionInstruction === 'U') {
        maxRowCalculationBase--; // If 'U', maxRow decreases
    }
    currentStepBounds.maxRow = Math.max(maxRowCalculationBase, 1); // Clamp maxRow with 1

    // Store the fully updated boundary state for the current step
    reachableBoundsHistory[currentStepIndex + 1] = currentStepBounds;

    // --- Additional Validation: Check for an empty reachable area ---
    // If the minimum boundary exceeds the maximum boundary, the reachable area is empty.
    // This implicitly means the entity cannot exist within the specified constraints.
    // This is an added check for robustness, not explicitly present in the original's failure conditions.
    if (currentStepBounds.minColumn > currentStepBounds.maxColumn ||
        currentStepBounds.minRow > currentStepBounds.maxRow) {
        console.log('NO');
        return;
    }
  }

  // If the loop completes without any boundary violations, the entity successfully navigated.
  console.log('YES');
}

// Entry point for execution: Read input from standard input and pass it to the main logic.
analyzePathBoundaries(require('fs').readFileSync('/dev/stdin', 'utf8'));