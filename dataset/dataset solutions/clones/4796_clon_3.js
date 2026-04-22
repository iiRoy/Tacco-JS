// This initial block sets up the environment for reading input from the standard input stream.
// It is designed to capture all lines of input before processing them.
const dataInputChannel = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let processedInputContainer; // This will hold our structured input data for sequential access.
const collectedRawLines = []; // A temporary buffer to store each line as it's read.

// Attaches an event listener to capture each line of text entered by the user or piped into stdin.
dataInputChannel.on('line', function(currentLine){
  collectedRawLines.push(currentLine); // Adds the current line to our collection.
});

// Attaches an event listener that triggers when the input stream has ended (e.g., user presses Ctrl+D or EOF is reached).
dataInputChannel.on('close', function(){
  processedInputContainer = buildInputIterator(collectedRawLines); // Constructs an iterable object from the collected lines.
  console.error('\n--- Input processing complete. Initiating core algorithm. ---'); // A diagnostic message.
  executeMainProgramLogic(); // Invokes the primary function to perform computations.
});

/**
 * Constructs an iterator-like object to sequentially access input lines.
 * This function encapsulates the state of reading through the input data.
 * @param {string[]} sourceLines An array of strings representing the raw input lines.
 * @returns {object} An object with methods to check for more data and retrieve the next line.
 */
function buildInputIterator(sourceLines){
  let currentReadIndex = 0; // Internal pointer to the current line being read.
  const totalLineCount = sourceLines.length; // The total number of lines available.

  return {
    rawLineStorage : sourceLines, // Reference to the original array of input lines.
    currentIndex : currentReadIndex,
    maximumLines : totalLineCount,

    /**
     * Determines if there are more lines remaining to be read.
     * @returns {boolean} True if more lines are available, false otherwise.
     */
    canFetchNext : function(){
      return (this.currentIndex < this.maximumLines);
    },

    /**
     * Retrieves the next available input line and advances the internal pointer.
     * Throws an error if an attempt is made to read beyond the end of the input.
     * @returns {string} The next line from the input.
     */
    pullNextLine : function(){
      if(this.canFetchNext()){
        return this.rawLineStorage[this.currentIndex++]; // Returns the current line and then increments the index.
      } else {
        // Custom error for when input is exhausted.
        throw new Error('InputExhaustionError: Attempted to read past the end of the provided input data.');
      }
    }
  };
}

/**
 * Prints a given message to the standard output console.
 * @param {*} message The data or string to be displayed as output.
 */
function displayProgramResult(message){
  console.log(message);
}

// Helper functions for parsing and retrieving specific data types from the input iterator.

/**
 * Fetches the next raw line from the input iterator.
 * @returns {string} The next raw input line.
 */
function retrieveNextRawInput(){
  return processedInputContainer.pullNextLine();
}

/**
 * Parses the next input line into an array of numbers, assuming space-separated values.
 * Handles multiple spaces and ensures valid number conversion.
 * @returns {number[]} An array of numerical values.
 */
function acquireNumericSequence(){
  const lineContent = retrieveNextRawInput();
  // Basic check to ensure the line is a non-empty string before attempting to parse.
  if (typeof lineContent !== 'string' || lineContent.trim() === '') {
      return []; // Returns an empty array for invalid or empty lines.
  }
  // Splits the string by one or more whitespace characters, filters out any empty strings
  // that might result (e.g., from leading/trailing spaces), and converts to numbers.
  return lineContent.split(/\s+/).filter(segment => segment !== '').map(Number);
}

// ----------------------------------------------------------------------------------------------------
// This marks the boundary between input/output boilerplate and the actual problem-solving logic.

/**
 * The primary function containing the core business logic of the application.
 * It processes the input to calculate and display the final desired score.
 */
function executeMainProgramLogic(){
  // Expects a single line of input containing seven space-separated integers.
  const allCounts = acquireNumericSequence();

  // A basic validation step to ensure the expected number of input values is present.
  if (allCounts.length < 7) {
      console.error('Error: Insufficient data points. Expected 7 distinct counts, received ' + allCounts.length + '.');
      displayProgramResult(0); // Outputs a default error value.
      return;
  }

  // Destructures the input array into meaningfully named constants for block counts.
  // These correspond to different types of tetrominoes (I, O, T, J, L, S, Z).
  const [
    countOfIBlocks,
    countOfOBlocks,
    countOfTBlocks,
    countOfJBlocks,
    countOfLBlocks,
    countOfSBlocks,
    countOfZBlocks
  ] = allCounts;

  // A utility function to compute the largest even number less than or equal to a given value.
  // This is equivalent to Math.floor(val / 2) * 2 or val - (val % 2).
  // Using a bitwise AND with ~1 (which is -2) efficiently clears the least significant bit,
  // effectively rounding down to the nearest even number.
  const getEvenRounded = (val) => val & ~1;

  // Calculation for the first scenario (Scenario A):
  // Sums up the even components of I, J, and L blocks. This represents forming
  // pairs of these blocks, maximizing their contribution without special combinations.
  // T, S, Z blocks are not directly used in this specific score component.
  let scenarioA_Score = getEvenRounded(countOfIBlocks) +
                        getEvenRounded(countOfJBlocks) +
                        getEvenRounded(countOfLBlocks);

  // Calculation for the second scenario (Scenario B):
  // This scenario considers a special combination requiring at least one of each I, J, and L block.
  // If this condition is met, one of each is 'consumed' for a special bonus of 3 points.
  // The remaining blocks then contribute their even components to the score.
  let scenarioB_Score = 0;
  if (countOfIBlocks >= 1 && countOfJBlocks >= 1 && countOfLBlocks >= 1) {
      // Calculate remaining blocks after using one of each for the special combination.
      const remainingI = countOfIBlocks - 1;
      const remainingJ = countOfJBlocks - 1;
      const remainingL = countOfLBlocks - 1;

      // Sum the even parts of the remaining blocks and add the fixed bonus for the special combination.
      scenarioB_Score = getEvenRounded(remainingI) +
                        getEvenRounded(remainingJ) +
                        getEvenRounded(remainingL) + 3;
  }
  // If the condition for Scenario B is not met, scenarioB_Score remains 0,
  // ensuring it doesn't negatively impact the final maximum score.

  // The 'O' block (square) can always be added independently to the score,
  // regardless of other combinations. It does not interfere with I, J, L logic.
  // The final score is the maximum of Scenario A and Scenario B, plus the count of O blocks.
  const overallOptimalScore = Math.max(scenarioA_Score, scenarioB_Score) + countOfOBlocks;

  // Displays the computed optimal score as the program's final output.
  displayProgramResult(overallOptimalScore);
}