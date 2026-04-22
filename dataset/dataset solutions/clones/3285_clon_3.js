const InputProcessor = (function () {
  /**
   * Manages the input stream by buffering lines and providing methods to extract tokens.
   * @param {string} rawInputContent - The entire input string, typically read from stdin.
   */
  function InputLineBuffer(rawInputContent) {
    // Stores all lines of input, trimmed and split by newline.
    this.bufferedLines = rawInputContent.trim().split("\n");
    // Pointer to the current line being processed.
    this.lineIndexPointer = 0;
  }

  /**
   * Extracts the next single token from the current input line.
   * If the current line is exhausted, it automatically advances to the next.
   * Tokens are assumed to be space-separated within a line.
   * @param {boolean} [returnAsString=false] - If true, the token is returned as a string; otherwise, it's converted to a number.
   * @returns {string|number} The extracted token.
   * @throws {Error} If attempting to read beyond the end of the input.
   */
  InputLineBuffer.prototype.retrieveNextToken = function (returnAsString = false) {
    if (this.lineIndexPointer >= this.bufferedLines.length) {
      throw new Error("Attempted to read beyond the end of the input buffer.");
    }

    let activeLineData = this.bufferedLines[this.lineIndexPointer];
    // If the current line is still a raw string, split it into tokens and reverse it.
    // Reversing allows efficient `pop()` operations from the "logical front" of the line.
    if (typeof activeLineData === "string") {
      this.bufferedLines[this.lineIndexPointer] = activeLineData.split(" ").reverse();
    }

    const tokensOnCurrentLine = this.bufferedLines[this.lineIndexPointer];
    const poppedToken = tokensOnCurrentLine.pop();

    // If the current line's token array is now empty, advance the line pointer.
    if (tokensOnCurrentLine.length === 0) {
      this.lineIndexPointer++;
    }

    // Return the token, optionally converting it to a number.
    return returnAsString ? poppedToken : Number(poppedToken);
  };

  /**
   * Reads an entire line from the input buffer as an array of tokens.
   * Advances the line pointer after reading.
   * @param {boolean} [returnAsString=false] - If true, tokens are returned as strings; otherwise, they are converted to numbers.
   * @returns {Array<string|number>} An array containing all tokens from the read line.
   * @throws {Error} If attempting to read beyond the end of the input.
   */
  InputLineBuffer.prototype.readFullLineTokens = function (returnAsString = false) {
    if (this.lineIndexPointer >= this.bufferedLines.length) {
      throw new Error("End of input reached when trying to read a complete line.");
    }

    // Extract the line, split by space, and advance the pointer.
    const lineSegments = this.bufferedLines[this.lineIndexPointer++].split(" ");
    return returnAsString ? lineSegments : lineSegments.map(segment => Number(segment));
  };

  /**
   * Reads a specified number of consecutive lines directly as an array.
   * Each line is treated as a single element in the resulting array.
   * @param {number} numberOfLines - The count of lines to read.
   * @param {boolean} [returnAsString=false] - If true, lines are returned as strings; otherwise, they are converted to numbers.
   * @returns {Array<string|number>} An array where each element corresponds to a read line.
   * @throws {Error} If attempting to read more lines than available.
   */
  InputLineBuffer.prototype.readMultipleLinesAsArray = function (numberOfLines, returnAsString = false) {
    if (this.lineIndexPointer + numberOfLines > this.bufferedLines.length) {
      throw new Error(`Insufficient lines available. Requested ${numberOfLines}, but only ${this.bufferedLines.length - this.lineIndexPointer} remain.`);
    }

    const extractedLines = this.bufferedLines.slice(this.lineIndexPointer, this.lineIndexPointer + numberOfLines);
    this.lineIndexPointer += numberOfLines; // Advance the pointer by the number of lines read.
    return returnAsString ? extractedLines : extractedLines.map(line => Number(line));
  };

  // The factory function that creates and returns an instance of InputLineBuffer.
  return function createInputReaderInstance(inputStringContent) {
    return new InputLineBuffer(inputStringContent);
  };
})();

// Create an input reader instance by reading from standard input.
const standardInputReader = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Solves the main problem: counts pairs of '.' and other characters
 * within connected components of a grid.
 * A component is formed by adjacent cells (up, down, left, right)
 * that have DIFFERENT characters.
 * @returns {number} The total sum of (dot_count * other_char_count) for all components.
 */
function solveGridConnectivityProblem() {
  // Read grid dimensions: height and width
  const gridHeight = standardInputReader.retrieveNextToken();
  const gridWidth = standardInputReader.retrieveNextToken();

  // Read the grid content. Each element is a string representing a row.
  const charGridData = standardInputReader.readMultipleLinesAsArray(gridHeight, true);

  // Initialize a 2D array to map each cell to its component ID.
  // 0 means unvisited/unassigned. Component IDs will be 1-based.
  const componentIdGrid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));

  // Counter for the unique component IDs found.
  let currentComponentIdentifier = 0;

  // Iterate through every cell in the grid.
  for (let r = 0; r < gridHeight; r++) {
    for (let c = 0; c < gridWidth; c++) {
      // If the cell has already been assigned to a component, skip it.
      if (componentIdGrid[r][c] !== 0) {
        continue;
      }

      // Found an unvisited cell, so it's the start of a new component.
      currentComponentIdentifier++;
      componentIdGrid[r][c] = currentComponentIdentifier;

      // Use a stack for Depth-First Search (DFS) traversal to find all cells in this component.
      const dfsTraversalStack = [[r, c]];
      const startingCellChar = charGridData[r][c];

      // Process cells in the current component until the stack is empty.
      while (dfsTraversalStack.length > 0) {
        const [currentRow, currentCol] = dfsTraversalStack.pop();

        // Define relative offsets for checking neighbors (up, down, left, right).
        const neighborRelativeOffsets = [
          [-1, 0], // Up
          [1, 0],  // Down
          [0, -1], // Left
          [0, 1]   // Right
        ];

        // Check each of the four potential neighbors.
        for (const [deltaY, deltaX] of neighborRelativeOffsets) {
          const neighborRow = currentRow + deltaY;
          const neighborCol = currentCol + deltaX;

          // Check if the neighbor coordinates are within grid boundaries.
          const isWithinBounds = neighborRow >= 0 && neighborRow < gridHeight &&
                                 neighborCol >= 0 && neighborCol < gridWidth;

          if (isWithinBounds) {
            // Check if the neighbor has not been visited yet (componentIdGrid is 0).
            const isNeighborUnvisited = componentIdGrid[neighborRow][neighborCol] === 0;
            // Check if the neighbor's character is different from the current cell's character.
            const neighborChar = charGridData[neighborRow][neighborCol];
            const hasDifferentCharacter = startingCellChar !== neighborChar;

            // If all conditions are met, assign the neighbor to the current component and add to stack.
            if (isNeighborUnvisited && hasDifferentCharacter) {
              componentIdGrid[neighborRow][neighborCol] = currentComponentIdentifier;
              dfsTraversalStack.push([neighborRow, neighborCol]);
            }
          }
        }
      }
    }
  }

  // Initialize an array to store counts of '.' and other characters for each component.
  // `componentCharBreakdown[componentId][0]` will store '.' count.
  // `componentCharBreakdown[componentId][1]` will store other char count.
  // Array size is `currentComponentIdentifier + 1` because component IDs are 1-based.
  const componentCharBreakdown = Array.from({ length: currentComponentIdentifier + 1 }, () => [0, 0]);

  // Iterate through the grid again to populate the character counts for each component.
  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      const assignedCompId = componentIdGrid[row][col];
      const charInCurrentCell = charGridData[row][col];

      // Increment the appropriate counter based on the character type.
      if (charInCurrentCell === '.') {
        componentCharBreakdown[assignedCompId][0]++; // Count for '.'
      } else {
        componentCharBreakdown[assignedCompId][1]++; // Count for other characters
      }
    }
  }

  // Calculate the final answer by summing the product of character counts for each component.
  let overallValidPairsCount = 0;
  // Iterate from 1 because component IDs are 1-based (index 0 in `componentCharBreakdown` is unused).
  for (let id = 1; id <= currentComponentIdentifier; id++) {
    const dotCountInComponent = componentCharBreakdown[id][0];
    const otherCharCountInComponent = componentCharBreakdown[id][1];
    overallValidPairsCount += dotCountInComponent * otherCharCountInComponent;
  }

  return overallValidPairsCount;
}

// Execute the problem-solving function and print the final result to console.
console.log(solveGridConnectivityProblem());