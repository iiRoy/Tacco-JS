function CalculateGridConfigurations(rawDataString) {
  // Split the entire raw input string into an array of individual lines.
  const inputLines = rawDataString.split("\n");

  // Helper function to parse the three dimension values (H, W, K) from a string.
  const extractDimensions = (dimensionLine) => {
    // Split the line by spaces and convert each part to a number.
    const numericParts = dimensionLine.split(" ").map(Number);
    
    // Basic validation: ensure we have exactly three valid numbers.
    // This is a Type III addition for robustness, though competitive programming often assumes valid input.
    if (numericParts.length !== 3 || numericParts.some(isNaN)) {
      // In a real-world scenario, you might throw an error or log a warning.
      // For this problem, we'll proceed with defaults or let subsequent logic handle it.
      console.warn("Warning: Malformed dimension input. Expected three numbers.");
      return { matrixHeight: 0, matrixWidth: 0, targetHashCount: 0 };
    }
    
    // Use destructuring for clear assignment of parsed values.
    return {
      matrixHeight: numericParts[0],
      matrixWidth: numericParts[1],
      targetHashCount: numericParts[2],
    };
  };

  // Parse the grid dimensions and target count from the first line of input.
  const { matrixHeight, matrixWidth, targetHashCount } = extractDimensions(inputLines[0]);

  // Create the 2D character grid by splitting subsequent lines.
  // Using slice(1) ensures the original inputLines array is not mutated (Type III change).
  const characterMatrix = inputLines.slice(1).map(line => line.split(""));

  // Initialize a counter for configurations that meet the criteria.
  let matchingConfigurationCount = 0;

  // Type III: Encapsulate the repetitive binary mask generation logic into a reusable function.
  // This function generates all 2^N combinations of N-bit binary masks.
  const generateAllBinaryMasks = (dimensionSize) => {
    // Handle edge cases for non-positive dimensions gracefully.
    if (dimensionSize <= 0) {
      return [[]]; // Return an array containing an empty mask for 0 dimensions.
    }

    // Start with the base masks for a single element (0 or 1).
    let currentSetOfMasks = [[0], [1]];

    // Iterate to build masks for each subsequent element.
    // The loop runs 'dimensionSize - 1' times to extend from 1-bit to 'dimensionSize'-bit masks.
    for (let currentBitIndex = 0; currentBitIndex < dimensionSize - 1; ++currentBitIndex) {
      const nextSetOfMasks = []; // Buffer for masks in the next iteration.
      
      // For each mask generated so far, create two new masks: one with 0 appended, one with 1.
      for (const existingMask of currentSetOfMasks) {
        // Use spread syntax for efficient array copying and appending (Type II change).
        const maskAppendedWithZero = [...existingMask, 0];
        const maskAppendedWithOne = [...existingMask, 1];
        nextSetOfMasks.push(maskAppendedWithZero);
        nextSetOfMasks.push(maskAppendedWithOne);
      }
      currentSetOfMasks = nextSetOfMasks; // Update for the next iteration.
    }
    return currentSetOfMasks;
  };

  // Generate all possible binary masks for row selections/exclusions.
  const rowExclusionBitmasks = generateAllBinaryMasks(matrixHeight);
  // Generate all possible binary masks for column selections/exclusions.
  const colExclusionBitmasks = generateAllBinaryMasks(matrixWidth);

  // Iterate through every possible combination of row and column exclusions.
  // Using for...of loops for cleaner iteration over array elements (Type III change).
  for (const activeRowMask of rowExclusionBitmasks) {
    for (const activeColMask of colExclusionBitmasks) {
      // Reset the count of '#' for the current configuration.
      let hashesInCurrentAttempt = 0;

      // Iterate over each cell in the character grid.
      for (let rIdx = 0; rIdx < matrixHeight; ++rIdx) {
        for (let cIdx = 0; cIdx < matrixWidth; ++cIdx) {
          // Check if the current cell (rIdx, cIdx) is NOT excluded by either mask
          // AND if it contains a '#' character.
          // The '0' in the mask signifies "keep" or "not exclude".
          if (activeRowMask[rIdx] === 0 && activeColMask[cIdx] === 0 && characterMatrix[rIdx][cIdx] === "#") {
            hashesInCurrentAttempt++;
          }
        }
      }

      // If the number of '#' in this configuration matches the target, increment the total count.
      if (hashesInCurrentAttempt === targetHashCount) {
        matchingConfigurationCount++;
      }
      // Type III: Removed the explicit `blacks=0;` reset.
      // `hashesInCurrentAttempt` is re-declared with `let` and re-initialized to 0
      // at the beginning of each `for (const activeColMask of colExclusionBitmasks)` iteration,
      // achieving the same effect.
    }
  }

  // Output the final count of valid configurations.
  // Using a format specifier for clarity (Type II change).
  console.log(`%d`, matchingConfigurationCount);
  
  // Return the calculated count.
  return matchingConfigurationCount;
}

// Execute the main calculation function by reading input from standard input.
// This line remains functionally equivalent to the original execution call (Type II change).
CalculateGridConfigurations(require("fs").readFileSync("/dev/stdin", "utf8"));