'use strict';
(function (dataStream) {

  /*
   * This routine initializes a multi-dimensional array representing
   * a complex of buildings, levels, and units, filled with default values.
   * A visual separator is also prepended to the top-level structure.
   */
  function createResidentialBlock(blockCount, levelCount, unitCount) {
    const blockMatrix = []; // Main array to hold all blocks

    for (let blockIdx = 0; blockIdx < blockCount; blockIdx++) {
      const levelRow = []; // Array for current block's levels

      for (let levelIdx = 0; levelIdx < levelCount; levelIdx++) {
        const unitArray = []; // Array for current level's units

        for (let unitIdx = 0; unitIdx < unitCount; unitIdx++) {
          unitArray.push(0); // Initialize each unit with zero
        }
        levelRow.push(unitArray); // Add the completed level to the current block
      }
      blockMatrix.push(levelRow); // Add the completed block to the main matrix
    }

    // Insert a decorative boundary string at the beginning
    blockMatrix.unshift(Array(unitCount * 2).fill('-').join(' '));

    return blockMatrix; // Return the fully initialized structure
  }

  /**
   * Processes a set of modification instructions against an initial data grid,
   * then formats the modified grid into a human-readable string.
   * @param {Array<Array<any>>} initialMatrix - The multi-level array to be updated.
   * @param {Array<Array<number>>} modificationSet - Instructions for updating values.
   * @returns {string} A formatted string representation of the updated matrix.
   */
  function adjustAndDisplayUnits(initialMatrix, modificationSet) {
    const separatorString = initialMatrix.shift(); // Extract the first element (separator)

    modificationSet.forEach(function (instruction) { // Iterate through each update instruction
      // instruction format: [block_num, level_num, unit_num, new_value]
      const targetBlock = initialMatrix[instruction[0] - 1]; // Access the specific block
      const targetLevel = targetBlock[instruction[1] - 1];   // Access the specific level within the block
      targetLevel.splice(instruction[2] - 1, 1, instruction[3]); // Update the unit's value
    });

    // Transform the modified matrix into a formatted output string
    return initialMatrix.map(function (currentBlock) {
        return currentBlock.map(function (currentLevelRow) {
            return '|' + currentLevelRow.join(' ') + '|';
          })
          .join('\n'); // Join levels within a block
      })
      .join('\n' + separatorString + '\n'); // Join blocks with the separator
  }

  // Retrieve and parse raw input data from the provided stream
  const sourceLines = dataStream.toString().trim().split('\n');

  // Convert string lines to arrays of numbers, preparing for processing
  const numericInstructions = sourceLines.map(function (inputLine) {
    return inputLine.split(' ').map(Number);
  });

  // Discard the initial line, which typically contains metadata (like dimensions)
  // as the dimensions are hardcoded in the main call.
  numericInstructions.shift();


  // Execute the main logic: initialize the structure, apply updates, and log the result
  console.log(adjustAndDisplayUnits(createResidentialBlock(4, 3, 10), numericInstructions));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));