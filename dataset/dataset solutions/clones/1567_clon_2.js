/**
 * @param {string} inputData Raw input from a source.
 */
function ExecuteSimulation(inputData)
{
  // Split the entire input into initial and subsequent segments.
  const [ initialLine, ...remainingLines ] = inputData.split("\n");

  // Extract grid dimensions (height and width) from the first line.
  const [gridHeight, gridWidth] = parseNumbers( initialLine );

  // Process the rest of the lines to form a grid of exclusion zones.
  // Each inner array represents a row's blocked segment [start, end].
  const exclusionZones = createGrid(remainingLines, ' ').map(rowStr =>
    rowStr.map(cellStr => parseInt(cellStr, 10))
  );

  // Add a placeholder at the beginning of the exclusionZones array
  // to align with 1-based indexing for 'currentY' in the main loop.
  exclusionZones.unshift(null);

  /**
   * Stores the minimum steps to reach the bottom row for each starting column.
   * Initialized with a default 'not-found' value.
   * @type number[]
   */
  let pathLengths = new Array(gridHeight).fill(-1);

  // Iterate through each possible starting column 'currentCol' from 1 to gridWidth.
  for ( let currentCol = 1; currentCol <= gridWidth; currentCol++ )
  {
    let currentX = currentCol; // Current X-coordinate (column)
    let currentY = 1;         // Current Y-coordinate (row)
    let stepCounter = 0;      // Count of movements made

    // Simulate movement until the path exits the grid or a condition is met.
    while ( true )
    {
      // Determine if a downward movement is possible from the current position.
      // A downward move is blocked if the current X is within the exclusion zone for the current Y.
      const canDescend = !(exclusionZones[currentY][0] <= currentX && currentX <= exclusionZones[currentY][1]);

      stepCounter++; // Increment step count for each movement.

      if ( canDescend )
      {
        currentY++; // Move downwards to the next row.

        // If this path found a shorter way to reach this row, update pathLengths.
        // Note: (currentY - 2) because results are 0-indexed for gridHeight-1 rows, and currentY is 1-indexed.
        if ( pathLengths[currentY - 2] === -1 || stepCounter < pathLengths[currentY - 2] )
        {
          pathLengths[currentY - 2] = stepCounter;
        }

        // If the path has gone beyond the grid height, terminate this simulation.
        if ( currentY > gridHeight ) break ;
      } else {
        currentX++; // Move rightwards to bypass the obstruction.

        // If the path has gone beyond the grid width, terminate this simulation.
        if ( currentX > gridWidth ) break ;
      }
    }

  }

  // Output the calculated path lengths, each on a new line.
  console.log(pathLengths.join("\n"));


  // This helper function was defined but not utilized in the main logic.
  // It checks if a downward move is permissible at a given (x, y) coordinate.
  function isPathClearBelow(xCoord, yCoord)
  {
    const [startBlock, endBlock] = exclusionZones[yCoord];
    return !(startBlock <= xCoord && xCoord <= endBlock);
  }
}

// Do not alter the following execution block; it handles standard I/O.
ExecuteSimulation(require("fs").readFileSync("/dev/stdin", "utf8"));

////////// Utility Functions

/**
 * Converts a space-separated string of numbers into an array of integers.
 * @param {string} inputString The string containing numbers.
 * @param {string} [separatorChar=' '] The character used to split the string.
 * @returns {number[]} An array of parsed integers.
 */
function parseNumbers(inputString, separatorChar = ' ') {
  return inputString.split(separatorChar).map(segment => parseInt(segment, 10));
}

/**
 * Transforms a string into an array of BigInts.
 * @param {string} inputString The string to convert.
 * @param {string} [separatorChar=' '] The delimiter for splitting.
 * @returns {BigInt[]} An array of BigInt values.
 */
function parseLargeInts(inputString, separatorChar = ' ') {
  return inputString.split(separatorChar).map(segment => BigInt(segment));
}

/**
 * Creates a 2D array (matrix) from an array of strings.
 * Each string in the input array represents a row, which is then split by a delimiter.
 * @param {string[]} lineArray An array where each element is a string representing a row.
 * @param {string} [separatorChar=' '] The character used to split each row string.
 * @returns {string[][]} A 2D array of strings.
 */
function createGrid(lineArray, separatorChar = ' ') {
  const resultingGrid = lineArray.map(lineValue => lineValue.split(separatorChar));
  return resultingGrid;
}

/**
 * Computes the sum of all numbers within a given array.
 * @param {number[]} numberList An array of numeric values.
 * @returns {number} The total sum of the elements.
 */
function calculateTotal(numberList) {
  return numberList.reduce((accumulator, currentValue) => accumulator + currentValue);
}