const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputDataStore;
const rawInputLines = [];

inputProcessor.on('line', (currentLine) => {
  rawInputLines.push(currentLine);
});

inputProcessor.on('close', () => {
  inputDataStore = initializeInputParser(rawInputLines);
  // Removed extensive timing and memory debug logs for Type III
  executeGridTransformation();
});

// Helper functions for parsing input data
function retrieveInteger(){ return transformInput(getNextLine(), 10); } // 10: Parse as integer
function retrieveStringArray(){ return transformInput(getNextLine(), 20); } // 20: Split by space
function retrieveIntegerArray(){ return transformInput(getNextLine(), 40); } // 40: Split by space and map to numbers
function retrieveCharacterArray(){ return transformInput(getNextLine(), 60); } // 60: Split by character
function getNextLine(){ return inputDataStore.getNextEntry(); }
function hasMoreLines(){ return inputDataStore.hasMoreEntries(); }

/**
 * Initializes an object for sequential input line parsing.
 * @param {Array<string>} sourceLines - An array of raw input strings.
 * @returns {object} An object with methods to navigate the input.
 */
function initializeInputParser(sourceLines){  
  const parserObject = {
    storedLines : sourceLines,
    currentIndex : 0,
    maximumEntries : sourceLines.length,
    hasMoreEntries : function(){
      return (this.currentIndex < this.maximumEntries);
    },
    getNextEntry : function(){
      if(!this.hasMoreEntries()){
        // Changed error message and type
        throw new Error("InputBoundsError: No more lines available for processing.");
      }
      const currentEntry = this.storedLines[this.currentIndex];
      this.currentIndex++;
      return currentEntry;
    }
  };
  return parserObject;
}

/**
 * Outputs a message to the console.
 * @param {*} content - The content to be displayed.
 */
function outputResult(content){
  console.log(content);
}

/**
 * Logs a debug message to standard error.
 * @param {*} debugInfo - The information to log for debugging.
 */
function logDebugMessage(debugInfo){
  const util = require("util"); // Added const for util
  console.error("DEBUG_INFO:", util.inspect(debugInfo, false, null, true)); // Added color option
}

/**
 * Transforms input data based on a specified mode.
 * @param {string|Array} inputData - The data to transform.
 * @param {number} mode - The transformation mode.
 *   10: Converts to an integer.
 *   20: Splits string by space.
 *   40: Splits string by space and converts to number array.
 *   60: Splits string into individual characters.
 *   70: Splits string into individual characters and converts to number array.
 *   80: Joins array elements with a space.
 *   90: Joins array elements with a newline.
 *   00: Joins array elements without a separator.
 * @returns {*} The transformed data or original data if mode is unknown/error.
 */
function transformInput(inputData, mode){
  try{
    switch(mode){
      case 10: return parseInt(inputData, 10); // Explicit radix for parseInt
      case 20: return inputData.split(" ");
      case 40: return inputData.split(" ").map(Number);
      case 60: return inputData.split("");
      case 70: return inputData.split("").map(Number);
      case 80: return inputData.join(" ");
      case 90: return inputData.join("\n");
      case 00: return inputData.join("");
      default:
        logDebugMessage(`Warning: Unknown transformation mode '${mode}' for input: ${inputData}`);
        return inputData; // Return original if mode is unrecognized
    }
  } catch(conversionError){
    logDebugMessage(`Error during transformation (mode ${mode}): ${conversionError.message}`);
    return inputData; // Return original data on error
  }
}

// --- End of Utility/Boilerplate Code ---

/**
 * Calculates the grid position (column and row) based on an index and grid dimension.
 * @param {number} idx - The current index.
 * @param {number} dim - The dimension of the grid (N).
 * @param {number} rowOffset - An additional offset for the row position.
 * @returns {{col: number, row: number}} The calculated column and row.
 */
function calculateGridPosition(idx, dim, rowOffset = 0) {
    const col = (idx * 2) % dim;
    const row = Math.floor(idx / dim) * 2 + rowOffset;
    return { col, row };
}

/**
 * Main function to execute the grid transformation logic.
 */
function executeGridTransformation(){
    const firstLineTokens = retrieveIntegerArray();
    const countA = firstLineTokens[0];
    const countB = firstLineTokens[1];

    // Basic validation for input counts
    if (countA < 1 || countB < 1) {
        logDebugMessage("Input counts A and B must be at least 1. Exiting.");
        return;
    }

    const GRID_DIMENSION = 100; // Renamed N to GRID_DIMENSION and made it a constant
    const HALF_GRID = GRID_DIMENSION / 2;
    const BLACK_CELL = '#';
    const WHITE_CELL = '.';

    // Initialize the grid map using Array.from for clearer intent
    const gridMap = Array.from({ length: GRID_DIMENSION }, (_, rowIndex) => {
        if (rowIndex < HALF_GRID) {
            return new Array(GRID_DIMENSION).fill(BLACK_CELL);
        } else {
            return new Array(GRID_DIMENSION).fill(WHITE_CELL);
        }
    });

    // Modify grid for countA
    // Changed loop condition to `idx < countA - 1`
    for(let idx = 0; idx < countA - 1; idx++){
        const { col, row } = calculateGridPosition(idx, GRID_DIMENSION);
        gridMap[row][col] = WHITE_CELL;
    }
    
    // Modify grid for countB
    // Changed loop condition to `idx < countB - 1`
    // Changed hardcoded 51 to (HALF_GRID + 1) for clarity
    for(let idx = 0; idx < countB - 1; idx++){
        const { col, row } = calculateGridPosition(idx, GRID_DIMENSION, HALF_GRID + 1);
        gridMap[row][col] = BLACK_CELL;
    }

    // Output the dimensions
    outputResult(`${GRID_DIMENSION} ${GRID_DIMENSION}`);

    // Output the modified grid, joining characters without a separator
    for(let rowIter = 0; rowIter < GRID_DIMENSION; rowIter++){
        outputResult(transformInput(gridMap[rowIter], 0)); // 0: Join without separator
    }
}