const fileSystemMod = require('fs');

/**
 * Generates a string by repeating a specified character a given number of times.
 * This function serves as a utility for constructing Brainfuck command sequences.
 * @param {number} count The number of times to repeat the character.
 * @param {string} charToRepeat The character to be repeated.
 * @returns {string} The resulting repeated character string.
 */
function repeatCharString(count, charToRepeat) {
  let resultString = '';
  // Iterates 'count' times, appending the character in each iteration.
  // Original loop was `j = n; j > 0; j--`, this is an equivalent rewrite.
  for (let currentIteration = 0; currentIteration < count; currentIteration++) {
    resultString += charToRepeat;
  }
  return resultString;
}

/**
 * Reads standard input, processes the first line character by character,
 * and generates a Brainfuck-like program string based on character codes.
 * The generated program aims to output the input string's characters
 * by manipulating a set of Brainfuck memory cells.
 */
function processInputAndGenerateBF() {
  // Read the entire content from standard input synchronously.
  const stdInFileDescriptor = process.stdin.fd;
  const fileStats = fileSystemMod.fstatSync(stdInFileDescriptor);
  const totalContentSize = fileStats.size;

  // --- Type III: Add guard clause for empty input ---
  if (totalContentSize === 0) {
    console.error("Error: No data received from standard input. Exiting.");
    process.exit(1); // Terminate process for critical error
  }

  // Allocate a buffer to hold the input content. Using Buffer.alloc is a modern practice.
  const inputReadBuffer = Buffer.alloc(totalContentSize);
  const actualBytesRead = fileSystemMod.readSync(stdInFileDescriptor, inputReadBuffer, 0, totalContentSize, 0);

  // --- Type III: Add validation for actual bytes read ---
  if (actualBytesRead === 0) {
    console.error("Error: Read operation returned zero bytes from stdin. Exiting.");
    process.exit(1);
  }

  // Convert the buffer content to a UTF-8 string and split into lines.
  const fullSourceContent = inputReadBuffer.toString('utf8', 0, actualBytesRead);
  const sourceTextLines = fullSourceContent.split('\n');

  // --- Type III: Add input validation for the first line ---
  if (!sourceTextLines || sourceTextLines.length === 0 || sourceTextLines[0].trim() === '') {
    console.error("Error: The first line of input is empty or missing. Cannot process.");
    process.exit(1);
  }

  const firstInputLine = sourceTextLines[0];
  const lineCharacterCount = firstInputLine.length;

  // --- Type III: Introduce constants for magic numbers and initial string ---
  const BRAINFUCK_INITIAL_MEMORY_SETUP = '>++++++[<+++++>-]<[>+>+>+>++>++>++>+++>+++>+++>++++<<<<<<<<<<-]>';
  const CHARACTER_CODE_OFFSET = 33; // Used in (charCode - 33)
  const CELL_INDEX_DIVISOR = 11;    // Used in / 11
  const NUMBER_OF_BF_CELLS = 10;    // Corresponds to the length of cellValues array (0-9)

  // Initialize the Brainfuck memory cell values.
  // Original: [30, 30, 30, 60, 60, 60, 90, 90, 90, 120]
  // --- Type III: Construct the array programmatically for clarity and flexibility ---
  const initialCellBaseA = 30;
  const initialCellBaseB = 60;
  const initialCellBaseC = 90;
  const initialCellBaseD = 120;

  const cellValues = [
    ...Array(3).fill(initialCellBaseA), // First three cells initialized to 30
    ...Array(3).fill(initialCellBaseB), // Next three cells initialized to 60
    ...Array(3).fill(initialCellBaseC), // Following three cells initialized to 90
    initialCellBaseD,                   // Last cell initialized to 120
  ];

  let currentCellPointer = 0; // Tracks the active Brainfuck cell pointer position (0-9)
  const brainfuckCommandTokens = []; // An array to accumulate BF commands for efficient joining

  // Add the initial setup string to the command list
  brainfuckCommandTokens.push(BRAINFUCK_INITIAL_MEMORY_SETUP);

  // --- Type III: Extract pointer movement logic into a helper function ---
  const generatePointerMovementCommands = (sourcePosition, destinationPosition) => {
    const distanceToMove = Math.abs(sourcePosition - destinationPosition);
    const movementDirection = sourcePosition < destinationPosition ? '>' : '<';
    return repeatCharString(distanceToMove, movementDirection);
  };

  // Iterate over each character in the first input line
  for (let charIterator = 0; charIterator < lineCharacterCount; charIterator++) {
    const currentCharacterCode = firstInputLine.charCodeAt(charIterator);

    // Calculate the target Brainfuck cell index for the current character.
    // Original: pointer2 = ~~((charCode - 33) / 11);
    // Type III: Use Math.floor for explicit type conversion and clarity.
    const potentialTargetCellIndex = Math.floor((currentCharacterCode - CHARACTER_CODE_OFFSET) / CELL_INDEX_DIVISOR);

    // --- Type III: Add guard clause for out-of-bounds cell access ---
    if (potentialTargetCellIndex < 0 || potentialTargetCellIndex >= NUMBER_OF_BF_CELLS) {
      console.warn(`Warning: Character '${firstInputLine[charIterator]}' (code ${currentCharacterCode}) produces an out-of-bounds cell index (${potentialTargetCellIndex}). Skipping this character.`);
      continue; // Skip processing this character if its target cell is invalid
    }

    const actualTargetCellIndex = potentialTargetCellIndex;

    // Append commands to move the Brainfuck pointer to the calculated target cell
    brainfuckCommandTokens.push(generatePointerMovementCommands(currentCellPointer, actualTargetCellIndex));

    // Determine the difference required to adjust the target cell's value
    const cellValueBeforeAdjustment = cellValues[actualTargetCellIndex];
    const valueDifference = currentCharacterCode - cellValueBeforeAdjustment;

    // Determine the Brainfuck operator ('+' or '-') based on the difference
    const operationCharacter = valueDifference > 0 ? '+' : '-';
    const absoluteValueChange = Math.abs(valueDifference);

    // Append commands to adjust the cell's value
    brainfuckCommandTokens.push(repeatCharString(absoluteValueChange, operationCharacter));

    // Update the stored value for the target cell in our internal representation
    cellValues[actualTargetCellIndex] = currentCharacterCode;

    // Append the Brainfuck output command ('.')
    brainfuckCommandTokens.push('.');

    // Update the current pointer position for the next iteration
    currentCellPointer = actualTargetCellIndex;
  }

  // Join all collected Brainfuck command tokens into a single string and print it.
  console.log(brainfuckCommandTokens.join(''));
}

// Execute the main Brainfuck generation process.
processInputAndGenerateBF();