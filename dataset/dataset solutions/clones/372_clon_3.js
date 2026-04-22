const identifyRepeatedElementPositions = (inputSequence) => {
  // Defensive programming: Ensure input is an array
  if (!Array.isArray(inputSequence)) {
    console.warn("Warning: Non-array input provided to identifyRepeatedElementPositions.");
    return [];
  }

  // Using a Map for occurrence tracking, which is more flexible than a fixed-size array
  // but for Sudoku digits (0-9), an array would also work efficiently.
  const digitFrequencyMap = new Map();

  // Populate the frequency map for each numeric element in the sequence
  for (const digit of inputSequence) {
    // Ensure the element is a valid number, primarily for robustness
    if (typeof digit === 'number' && Number.isInteger(digit) && digit >= 0 && digit <= 9) {
      digitFrequencyMap.set(digit, (digitFrequencyMap.get(digit) || 0) + 1);
    }
    // Non-numeric or out-of-range values are ignored, mimicking original behavior of 0-9 count
  }

  // Filter out digits that appear two or more times
  const problematicDigits = Array.from(digitFrequencyMap.entries())
                                 .filter(([, currentCount]) => currentCount >= 2)
                                 .map(([value]) => value);

  // Collect the original indices from the input sequence where these problematic digits occur
  const positionsOfProblematicDigits = [];
  inputSequence.forEach((digit, idx) => {
    if (problematicDigits.includes(digit)) {
      positionsOfProblematicDigits.push(idx);
    }
  });

  return positionsOfProblematicDigits;
};

// --- Main Program Execution ---

let rawFileContents;
try {
  rawFileContents = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });
} catch (fileReadError) {
  console.error(`ERROR: Could not access input stream: ${fileReadError.message}`);
  process.exit(1); // Terminate if input cannot be read
}

// Split input into lines and filter out any potential empty lines
const processedInputLines = rawFileContents.trim().split('\n').filter(Boolean); // Boolean filters out empty strings

let cumulativeOutputBuffer = '';

// The first line indicates the total number of grids to process
const totalGridCount = parseInt(processedInputLines.shift(), 10);

if (isNaN(totalGridCount) || totalGridCount < 1) {
  console.error("ERROR: Invalid or missing grid count in input.");
  process.exit(1);
}

// Iterate through each Sudoku-like grid puzzle
for (let gridIterationIndex = 0; gridIterationIndex < totalGridCount; gridIterationIndex++) {
  const currentPuzzleGrid = []; // Stores the 9x9 numeric values
  // This matrix will accumulate marks for positions with duplicates
  const duplicateMarkingsGrid = Array.from({ length: 9 }, () => new Array(9).fill(0));

  // Parse 9 lines to build the current puzzle grid
  for (let gridRowIndex = 0; gridRowIndex < 9; gridRowIndex++) {
    const lineOfNumbers = processedInputLines.shift();
    if (!lineOfNumbers) {
      console.error(`ERROR: Insufficient input lines for grid #${gridIterationIndex + 1}, row ${gridRowIndex + 1}.`);
      process.exit(1);
    }
    const rowValues = lineOfNumbers.split(' ').map(Number);

    // Basic validation for row integrity
    if (rowValues.length !== 9 || rowValues.some(isNaN)) {
      console.error(`ERROR: Malformed row data for grid #${gridIterationIndex + 1}, row ${gridRowIndex + 1}.`);
      process.exit(1);
    }
    currentPuzzleGrid.push(rowValues);
  }

  // --- Analysis Step 1: Check for duplicate numbers within each row ---
  currentPuzzleGrid.forEach((row, rIdx) => {
    const duplicateIndicesInRow = identifyRepeatedElementPositions(row);
    duplicateIndicesInRow.forEach(cIdx => {
      duplicateMarkingsGrid[rIdx][cIdx]++;
    });
  });

  // --- Analysis Step 2: Check for duplicate numbers within each column ---
  for (let colTraversalIndex = 0; colTraversalIndex < 9; colTraversalIndex++) {
    const columnContent = [];
    for (let rowTraversalIndex = 0; rowTraversalIndex < 9; rowTraversalIndex++) {
      columnContent.push(currentPuzzleGrid[rowTraversalIndex][colTraversalIndex]);
    }
    const duplicateIndicesInColumn = identifyRepeatedElementPositions(columnContent);
    duplicateIndicesInColumn.forEach(rIdx => { // rIdx here is the index within the columnContent array
      duplicateMarkingsGrid[rIdx][colTraversalIndex]++;
    });
  }

  // --- Analysis Step 3: Check for duplicate numbers within each 3x3 sub-grid (block) ---
  // Iterate through the 3x3 blocks by their top-left corner offsets
  for (let blockOffsetY = 0; blockOffsetY < 3; blockOffsetY++) {
    for (let blockOffsetX = 0; blockOffsetX < 3; blockOffsetX++) {
      const blockValues = [];
      const originalBlockCoordinates = []; // Store (row, col) for each value in the block

      // Collect values and their original coordinates for the current 3x3 block
      for (let innerBlockRow = 0; innerBlockRow < 3; innerBlockRow++) {
        for (let innerBlockCol = 0; innerBlockCol < 3; innerBlockCol++) {
          const actualGridRow = blockOffsetY * 3 + innerBlockRow;
          const actualGridCol = blockOffsetX * 3 + innerBlockCol;
          blockValues.push(currentPuzzleGrid[actualGridRow][actualGridCol]);
          originalBlockCoordinates.push([actualGridRow, actualGridCol]);
        }
      }

      const duplicateIndicesInBlock = identifyRepeatedElementPositions(blockValues);
      duplicateIndicesInBlock.forEach(posInBlockArray => {
        const [targetRow, targetCol] = originalBlockCoordinates[posInBlockArray];
        duplicateMarkingsGrid[targetRow][targetCol]++;
      });
    }
  }

  // --- Output Formatting: Apply marks based on duplicate findings ---
  const formattedGridOutput = currentPuzzleGrid.map((rowContents, rIdx) => {
    return rowContents.map((cellValue, cIdx) => {
      // A cell is marked if it was found to be a duplicate in any of the checks
      const indicatorPrefix = (duplicateMarkingsGrid[rIdx][cIdx] > 0) ? '*' : ' ';
      return `${indicatorPrefix}${cellValue}`; // Use template literals for cleaner string construction
    }).join(''); // Join individual cell strings without any separator for a row
  });

  // Append the formatted grid lines and an extra blank line to separate puzzle outputs
  cumulativeOutputBuffer += formattedGridOutput.join('\n') + '\n\n';
}

// Print the final accumulated string, removing any trailing newlines at the very end
console.log(cumulativeOutputBuffer.trim());