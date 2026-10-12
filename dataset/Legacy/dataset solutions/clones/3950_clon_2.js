function ProcessInput(inputString) {
  // Parse the input string into an array of two integers
  const parsedNumbers = inputString.split(" ").map(strVal => parseInt(strVal, 10));

  let firstVal, secondVal, charOne, charTwo; // Declare variables for values and characters

  // Determine the larger value and assign characters based on comparison
  if (parsedNumbers[0] > parsedNumbers[1]) {
    firstVal = parsedNumbers[0];
    secondVal = parsedNumbers[1];
    charOne = "."; // Character for the larger value's blocks
    charTwo = "#"; // Character for the smaller value's blocks
  } else {
    secondVal = parsedNumbers[0];
    firstVal = parsedNumbers[1];
    charTwo = "."; // Character for the larger value's blocks
    charOne = "#"; // Character for the smaller value's blocks
  }

  // Calculate the grid dimension, ensuring it's a multiple of 4
  const gridDimension = Math.ceil(Math.sqrt(firstVal)) * 4;

  // Define the basic patterns for the grid blocks
  const patternA = [charOne, charOne, charOne, charTwo]; // Pattern for the 'firstVal' blocks
  const patternB = [charOne, charTwo, charOne, charTwo]; // Mixed pattern
  const patternC = [charTwo, charTwo, charTwo, charTwo]; // Pattern for the 'secondVal' blocks

  let resultGrid = []; // Initialize the 2D array for the output grid
  let countA = 1, countB = 1; // Counters for tracking 'firstVal' and 'secondVal' blocks

  // Iterate through the grid in 4x4 blocks
  for (let rowIdx = 0; rowIdx < gridDimension; rowIdx += 4) {
    // Initialize 4 rows for the current block
    resultGrid[rowIdx] = [];
    resultGrid[rowIdx + 1] = [];
    resultGrid[rowIdx + 2] = [];
    resultGrid[rowIdx + 3] = [];

    for (let colIdx = 0; colIdx < gridDimension; colIdx += 4) {
      // Special handling for the very first 4x4 block
      if (rowIdx === 0 && colIdx === 0) {
        resultGrid[rowIdx].push(...patternA);
        resultGrid[rowIdx + 1].push(...patternA);
        resultGrid[rowIdx + 2].push(...patternA);
        resultGrid[rowIdx + 3].push(...patternC);
      }
      // If all 'firstVal' blocks have been placed
      else if (countA === firstVal) {
        resultGrid[rowIdx].push(...patternC);
        resultGrid[rowIdx + 1].push(...patternC);
        resultGrid[rowIdx + 2].push(...patternC);
        resultGrid[rowIdx + 3].push(...patternC);
      }
      // If all 'secondVal' blocks have been placed
      else if (countB === secondVal) {
        resultGrid[rowIdx].push(...patternA);
        resultGrid[rowIdx + 1].push(...patternA);
        resultGrid[rowIdx + 2].push(...patternA);
        resultGrid[rowIdx + 3].push(...patternC);
        countA++; // Increment 'firstVal' block counter
      }
      // Default case: place a mixed block
      else {
        resultGrid[rowIdx].push(...patternA);
        resultGrid[rowIdx + 1].push(...patternB);
        resultGrid[rowIdx + 2].push(...patternA);
        resultGrid[rowIdx + 3].push(...patternC);
        countA++; // Increment both counters
        countB++;
      }
    }
  }

  // Join the characters in each row to form strings
  for (let finalRowIndex = 0; finalRowIndex < gridDimension; finalRowIndex++) {
    resultGrid[finalRowIndex] = resultGrid[finalRowIndex].join("");
  }

  // Output the grid dimensions and the grid itself
  console.log("%d %d\n%s", gridDimension, gridDimension, resultGrid.join("\n"));
}

// Read input from stdin, trim whitespace, and pass to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
