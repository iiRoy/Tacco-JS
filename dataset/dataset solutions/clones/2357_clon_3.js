const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let bufferedLines = []; // Stores all lines read from standard input
let parsedInputHandler; // Object to manage reading tokens from bufferedLines

// Event listener for each line of input received
inputReader.on('line', function(singleLine){
  bufferedLines.push(singleLine);
});

// Event listener when the input stream closes, indicating all input has been read
inputReader.on('close', function(){
  parsedInputHandler = initializeInputProcessor(bufferedLines); // Setup input parsing utility
  console.error('\n--- Input processing complete. Initiating core algorithm. ---'); // Debug message
  processGridData(); // Execute the primary logic of the program
});

/**
 * Generates a deep copy of an object or a Set.
 * For Set, it creates a new Set from its elements.
 * For other plain objects/arrays, it uses JSON serialization for a deep copy.
 * Note: This method has limitations (e.g., won't clone functions, Dates, RegExps).
 * @param {any} sourceObject - The entity to be duplicated.
 * @returns {any} A thoroughly cloned version of the source entity.
 */
function createDeepCopy(sourceObject){
  if (sourceObject instanceof Set) {
    return new Set(Array.from(sourceObject));
  }
  try {
    return JSON.parse(JSON.stringify(sourceObject));
  } catch (e) {
    console.warn("Warning: Attempted deep cloning via JSON.parse/stringify failed for object:", sourceObject, "Error:", e.message);
    // Fallback: return the original object reference if deep cloning fails
    return sourceObject;
  }
}

// Helper functions for convenient input retrieval, mapped to conversion types
function retrieveNextInteger(){ return performConversion(fetchNextToken(), 1); }
function retrieveNextStringArray(){ return performConversion(fetchNextToken(), 2); }
function retrieveNextIntegerArray(){ return performConversion(fetchNextToken(), 4); }
function retrieveNextCharacterArray(){ return performConversion(fetchNextToken(), 6); }

/**
 * Retrieves the subsequent token (line) from the input buffer.
 * @returns {string} The next available line of input.
 * @throws {Error} If the input buffer has been exhausted.
 */
function fetchNextToken(){ return parsedInputHandler.retrieveNext(); }

/**
 * Verifies if there are additional tokens (lines) remaining in the input buffer.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function checkMoreInputAvailable(){ return parsedInputHandler.hasMore(); }

/**
 * Sets up an input processing utility to manage sequential access to input lines.
 * @param {string[]} allInputLines - An array of strings, with each string representing one line of input.
 * @returns {object} An input processor object providing methods to check for and retrieve input lines.
 */
function initializeInputProcessor(allInputLines){
  let currentLineCursor = 0; // Internal pointer to the current line being processed
  const totalLineCount = allInputLines.length; // Total number of lines provided

  return {
    // Determines if there are more lines to be read
    hasMore : function(){
      return (currentLineCursor < totalLineCount);
    },
    // Fetches the next line from the buffer and advances the cursor
    retrieveNext : function(){
      if(this.hasMore()){
        return allInputLines[currentLineCursor++];
      } else {
        throw new Error('InputBufferExhausted: All available input lines have been processed.');
      }
    }
  };
}

/**
 * Outputs the given data to the standard output stream.
 * @param {any} outputData - The data to be displayed.
 */
function displayResult(outputData){ console.log(outputData); }

/**
 * Writes detailed debug information to the standard error stream.
 * Utilizes Node.js's `util.inspect` for comprehensive object representation.
 * @param {any} debugMessage - The data or message to log for debugging.
 */
function logDetailedDebug(debugMessage){
  console.error('DEBUG INFO: ' + require('util').inspect(debugMessage, { showHidden: false, depth: null, colors: true }));
}

/**
 * A flexible utility for converting input strings based on a specified type.
 * @param {string|string[]} rawInput - The input string or array requiring conversion.
 * @param {number} conversionSpecifier - Numeric code indicating the desired conversion:
 *   - 1: Converts string to an integer (base 10).
 *   - 2: Splits string by spaces into an array of strings.
 *   - 4: Splits string by spaces and maps parts to numbers.
 *   - 6: Splits string into an array of individual characters.
 *   - 7: Splits string into characters and attempts to convert each to a number.
 *   - 8: Joins array elements with a space.
 *   - 9: Joins array elements with a newline.
 *   - 0: Joins array elements without any separator.
 * @returns {any} The converted value, or the original input if conversion fails or type is unrecognized.
 */
function performConversion(rawInput, conversionSpecifier){
  try {
    switch(conversionSpecifier){
      case 1: return parseInt(rawInput, 10); // Explicitly specify base 10 for safety
      case 2: return rawInput.split(' ');
      case 4: return rawInput.split(' ').map(Number);
      case 6: return rawInput.split('');
      case 7: return rawInput.split('').map(Number);
      case 8: return rawInput.join(' ');
      case 9: return rawInput.join('\n');
      case 0: return rawInput.join('');
      default: return rawInput; // Returns original input for unknown conversion types
    }
  } catch(conversionError){
    console.error(`Error during input conversion (type ${conversionSpecifier}) for input "${rawInput}": ${conversionError.message}`);
    return rawInput; // Return the original input on any conversion error
  }
}

// --- End of Input/Output and Utility Functions ---

/**
 * This is the main computational function.
 * It processes grid data to find the minimum absolute sum achievable
 * by traversing the grid from top-left to bottom-right,
 * applying either addition or subtraction of cell values.
 * This function utilizes a dynamic programming approach.
 */
function processGridData(){
  // Read the dimensions of the grid: Number of rows (R) and columns (C)
  const gridDimensions = retrieveNextIntegerArray();
  const gridRows = gridDimensions[0];
  const gridCols = gridDimensions[1];

  // Initialize the primary matrix (let's call it matrixA), which will store
  // the absolute differences between two input grids.
  const matrixA = Array.from({ length: gridRows }, () => retrieveNextIntegerArray());

  // Read the second input matrix (matrixB) row by row
  // and immediately calculate the absolute differences, updating matrixA.
  for(let rIdx = 0; rIdx < gridRows; rIdx++){
    const matrixBRow = retrieveNextIntegerArray(); // Fetch a row from matrix B
    for(let cIdx = 0; cIdx < gridCols; cIdx++){
      // Update matrixA with the absolute difference between corresponding elements
      matrixA[rIdx][cIdx] = Math.abs(matrixA[rIdx][cIdx] - matrixBRow[cIdx]);
    }
  }

  // Define an upper bound for the possible sums.
  // This value must be sufficiently large to cover all potential sums encountered.
  // A typical maximum cell value (e.g., 100) multiplied by grid size (e.g., 80x80)
  // could result in sums up to 800 * 100 = 80000. 13000 is a specific problem constraint.
  const maximumTrackableSum = 13000;

  // Initialize a 3D dynamic programming table.
  // `dpTable[r][c][s]` will be `true` if sum `s` is achievable at cell `(r, c)`, otherwise `false`.
  // Dimensions are `gridRows x gridCols x maximumTrackableSum`.
  const dpTable = Array.from({ length: gridRows }, () =>
    Array.from({ length: gridCols }, () =>
      new Array(maximumTrackableSum).fill(false)
    )
  );

  // Base case for DP: The sum at the starting cell (0,0) is simply its own value.
  // This value is marked as reachable in the DP table.
  dpTable[0][0][matrixA[0][0]] = true;

  // Iterate through each cell of the grid (from top-left to bottom-right)
  // to populate the DP table based on previously computed states.
  for(let r = 0; r < gridRows; r++){
    for(let c = 0; c < gridCols; c++){

      // Skip the initial cell (0,0) as its base case has already been handled.
      if(r === 0 && c === 0){
        continue;
      }

      // Retrieve the value of the current cell from our difference matrix.
      const currentCellVal = matrixA[r][c];

      // Use a temporary Set to gather all unique reachable sums for the current cell.
      // This helps avoid redundant calculations and ensures uniqueness before updating dpTable.
      const currentCellPossibleSums = new Set();

      // Consider paths coming from the cell directly above (r-1, c).
      if(r > 0){ // If not in the first row, a path from above is possible.
        for(let prevSum = 0; prevSum < maximumTrackableSum; prevSum++){
          if(dpTable[r - 1][c][prevSum]){ // If 'prevSum' was reachable from the cell above...
            // Calculate new sums by adding or subtracting the current cell's value.
            const sumAfterAdd = prevSum + currentCellVal;
            const sumAfterSubtract = Math.abs(prevSum - currentCellVal);

            // Add these new sums to our temporary set, ensuring they are within bounds.
            if (sumAfterAdd < maximumTrackableSum) {
              currentCellPossibleSums.add(sumAfterAdd);
            }
            if (sumAfterSubtract < maximumTrackableSum) {
              currentCellPossibleSums.add(sumAfterSubtract);
            }
          }
        }
      }

      // Consider paths coming from the cell directly to the left (r, c-1).
      if(c > 0){ // If not in the first column, a path from the left is possible.
        for(let prevSum = 0; prevSum < maximumTrackableSum; prevSum++){
          if(dpTable[r][c - 1][prevSum]){ // If 'prevSum' was reachable from the cell to the left...
            // Calculate new sums by adding or subtracting the current cell's value.
            const sumAfterAdd = prevSum + currentCellVal;
            const sumAfterSubtract = Math.abs(prevSum - currentCellVal);

            // Add these new sums to our temporary set, ensuring they are within bounds.
            if (sumAfterAdd < maximumTrackableSum) {
              currentCellPossibleSums.add(sumAfterAdd);
            }
            if (sumAfterSubtract < maximumTrackableSum) {
              currentCellPossibleSums.add(sumAfterSubtract);
            }
          }
        }
      }

      // Apply all collected unique sums to the DP table for the current cell.
      // This finalizes the reachable states for (r,c) based on its predecessors.
      currentCellPossibleSums.forEach(s => {
        dpTable[r][c][s] = true;
      });
      // The temporary set can be cleared explicitly, though it will be garbage collected.
      currentCellPossibleSums.clear();
    }
  }

  // After filling the entire DP table, search for the minimum absolute sum
  // that is reachable at the bottom-right cell (gridRows-1, gridCols-1).
  for(let finalSumCandidate = 0; finalSumCandidate < maximumTrackableSum; finalSumCandidate++){
    // The first `true` value encountered corresponds to the minimum reachable sum.
    if(dpTable[gridRows - 1][gridCols - 1][finalSumCandidate]){
      displayResult(finalSumCandidate); // Output this minimum sum
      return; // Exit the function as the solution has been found
    }
  }

  // Fallback: If no reachable sum is found (this scenario should ideally not occur
  // given problem constraints, but serves as a robust error handling measure).
  logDetailedDebug("Algorithm completed, but no reachable sum was found at the target cell. Please check logic or input constraints.");
  displayResult(-1); // Indicate an error or no solution found
}