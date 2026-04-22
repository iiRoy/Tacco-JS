const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let inputSource;
const rawInputLines = [];

// Event handler for each line of input received
inputReader.on('line', (currentLine) => {
  rawInputLines.push(currentLine);
});

// Event handler for when input stream closes
inputReader.on('close', () => {
  // Initialize the input processing utility once all lines are gathered
  inputSource = initializeInputProcessor(rawInputLines);
  // Provide a visual separator for clarity between input processing and program output
  console.error('\n↑ Input Data Stream ↓ Program Execution Output');
  // Execute the primary combat simulation logic
  ExecuteCombatSimulation();
});

/**
 * Creates a deep clone of a given object or Set.
 * Supports Set objects by converting to array and back.
 * For other objects, it uses JSON stringify/parse for a deep copy.
 * @param {any} originalObject - The object to be cloned.
 * @returns {any} A deep copy of the original object.
 */
function deepCopyValue(originalObject) {
  return (originalObject instanceof Set)
    ? new Set(Array.from(originalObject))
    : JSON.parse(JSON.stringify(originalObject));
}

// Convenience functions to retrieve and process the next line of input
function retrieveNextInteger() { return processInputSegment(fetchNextInputToken(), 1); }
function retrieveNextStringArray() { return processInputSegment(fetchNextInputToken(), 2); }
function retrieveNextIntegerArray() { return processInputSegment(fetchNextInputToken(), 4); }
function retrieveNextCharacterArray() { return processInputSegment(fetchNextInputToken(), 6); }

/**
 * Fetches the next available line of input from the initialized input source.
 * @returns {string} The next line of input.
 * @throws {Error} If there are no more input tokens available.
 */
function fetchNextInputToken() { return inputSource.getNextLine(); }

/**
 * Checks if there are more input tokens (lines) available for processing.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasMoreInputTokens() { return inputSource.isInputRemaining(); }

/**
 * Initializes an input processing utility with a given array of input lines.
 * Provides methods for checking availability, retrieving, and peeking at input lines.
 * @param {string[]} inputDataArray - An array of strings representing input lines.
 * @returns {object} An object with methods to manage input consumption.
 * @property {string[]} dataLines - The array of all input lines.
 * @property {number} currentLineIndex - The index of the next line to be read.
 * @property {number} totalLinesAvailable - The total number of input lines.
 * @property {function(): boolean} isInputRemaining - Checks if there are more lines.
 * @property {function(): string} getNextLine - Retrieves and advances to the next line.
 * @property {function(): string|null} peekNextLine - Returns the next line without advancing.
 */
function initializeInputProcessor(inputDataArray) {
  // Guard clause: Log a warning if no input lines are provided
  if (!inputDataArray || inputDataArray.length === 0) {
    console.warn("Warning: No input lines were provided. Program execution might be limited.");
  }
  return {
    dataLines: inputDataArray,
    currentLineIndex: 0,
    totalLinesAvailable: inputDataArray.length,
    /** @returns {boolean} */
    isInputRemaining: function() { return (this.currentLineIndex < this.totalLinesAvailable); },
    /** @returns {string} */
    getNextLine: function() {
      if (this.isInputRemaining()) {
        return this.dataLines[this.currentLineIndex++];
      } else {
        // Throw a specific error for out-of-bounds input access
        throw new Error('InputOutOfBoundsException: Attempted to read beyond available input lines.');
      }
    },
    /**
     * Returns the next input line without consuming it.
     * @returns {string|null} The next line or null if no more input.
     */
    peekNextLine: function() {
      if (this.isInputRemaining()) {
        return this.dataLines[this.currentLineIndex];
      }
      return null;
    }
  };
}

/**
 * Logs the final computed result to the console.
 * @param {any} message - The data or message to display as final output.
 */
function displayFinalOutput(message) { console.log(message); }

/**
 * Logs detailed diagnostic messages to the error stream.
 * Uses Node.js 'util.inspect' for structured object output.
 * @param {any} data - The data to log for debugging purposes.
 */
function logDiagnosticMessage(data) {
  console.error(`DEBUG_INFO: ${require('util').inspect(data, { depth: null, colors: true })}`);
}

/**
 * Processes an input value based on a specified conversion type.
 * @param {string|string[]} inputValue - The input value to convert.
 * @param {number} conversionType - An integer indicating the desired conversion.
 *   1: Parse as Integer (base 10).
 *   2: Split by space into a String Array.
 *   4: Split by space, then map each segment to a Number (Integer Array).
 *   6: Split into a Character Array.
 *   7: Split by character, then map each character to a Number (Integer Array). (Added new type)
 *   8: Join array elements with a space.
 *   9: Join array elements with a newline.
 *   0: Join array elements without any separator.
 *   Default: Return the input value as is.
 * @returns {any} The converted value.
 */
function processInputSegment(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(inputValue, 10);
      case 2: return inputValue.split(' ');
      case 4: return inputValue.split(' ').map(Number);
      case 6: return inputValue.split('');
      case 7: return inputValue.split('').map(Number); // New conversion type for char array to int array
      case 8: return inputValue.join(' ');
      case 9: return inputValue.join('\n');
      case 0: return inputValue.join('');
      default: return inputValue; // If conversion type is unknown, return original input
    }
  } catch (error) {
    // Log the error and attempt to return a sensible default or the original value
    logDiagnosticMessage(`Error during input processing (Type: ${conversionType}, Value: '${inputValue}'): ${error.message}`);
    // For number conversions, return 0 upon failure to prevent NaN propagation
    if ([1, 4, 7].includes(conversionType)) {
      return 0;
    }
    return inputValue; // For other types, return the original input
  }
}

// --- Main Combat Simulation Logic Starts Here ---
/**
 * Executes the core combat simulation algorithm.
 * Reads monster data, sorts it, calculates attacks needed, and applies damage.
 */
function ExecuteCombatSimulation() {
  // Retrieve the initial combat setup parameters: N, D, A
  const combatSetupParameters = retrieveNextIntegerArray();

  // Validate the number of initial parameters
  if (combatSetupParameters.length < 3) {
    throw new Error("Initialization Error: Insufficient combat parameters provided. Expected N (monster count), D (attack range factor), A (hero attack power).");
  }

  const monsterCount = combatSetupParameters[0];
  const attackRangeFactor = combatSetupParameters[1]; // D: determines the range of effect (2*D)
  const heroStrikePower = combatSetupParameters[2]; // A: damage per strike

  // Guard clause: Warn about non-positive attack power which might lead to infinite loops
  if (heroStrikePower <= 0) {
    logDiagnosticMessage("Warning: Hero's strike power is non-positive. This may lead to an infinite number of required attacks or unexpected behavior.");
    // Depending on problem constraints, one might throw an error here or set a default.
  }

  // Load and structure monster data
  // Each monster is represented as an object for clarity and future extensibility
  const foeDataCollection = [];
  for (let currentMonsterIndex = 0; currentMonsterIndex < monsterCount; currentMonsterIndex++) {
    const monsterRawData = retrieveNextIntegerArray();
    if (monsterRawData.length < 2) {
      throw new Error(`Data Error: Monster entry at index ${currentMonsterIndex} is incomplete. Expected [position, health].`);
    }
    foeDataCollection.push({
      position: monsterRawData[0],
      health: monsterRawData[1],
      // Adding an 'id' for debugging or tracking original order if needed
      originalId: currentMonsterIndex
    });
  }

  // Sort the monsters by their position (ascending order)
  // This ensures we process monsters from left to right on the battlefield
  foeDataCollection.sort((foeA, foeB) => foeA.position - foeB.position);

  let totalStrikesRequired = 0; // Accumulator for the total number of attacks

  // Iterate through each monster to determine the necessary strikes and their impact
  for (let currentFoeIterator = 0; currentFoeIterator < monsterCount; currentFoeIterator++) {
    let currentFoe = foeDataCollection[currentFoeIterator];

    // If the current monster is already defeated (health <= 0), skip it
    if (currentFoe.health <= 0) {
      continue;
    }

    const currentFoePosition = currentFoe.position;
    // Calculate the number of strikes needed to defeat this specific monster.
    // Handles cases where heroStrikePower might be 0 or negative (though warned above).
    const strikesForThisFoe = heroStrikePower > 0
      ? Math.ceil(currentFoe.health / heroStrikePower)
      : Infinity; // If no strike power, infinite strikes are needed

    // Add these strikes to the cumulative total
    totalStrikesRequired += strikesForThisFoe;

    // Calculate the effective damage value applied by this wave of attacks
    const damagePerStrikeWave = strikesForThisFoe * heroStrikePower;

    // Determine the furthest point of the attack's effective range
    // The problem defines the range as x + 2 * D
    const attackEffectiveRangeEnd = currentFoePosition + (2 * attackRangeFactor);

    // Apply damage to all subsequent monsters within the attack's effective radius
    // Start checking from the monster immediately after the current one
    for (let subsequentFoeIterator = currentFoeIterator + 1; subsequentFoeIterator < monsterCount; subsequentFoeIterator++) {
      let subsequentFoe = foeDataCollection[subsequentFoeIterator];

      // If the subsequent monster's position is within the attack range
      if (subsequentFoe.position <= attackEffectiveRangeEnd) {
        // Reduce the monster's health, ensuring it does not drop below zero
        subsequentFoe.health = Math.max(0, subsequentFoe.health - damagePerStrikeWave);
      } else {
        // Since monsters are sorted by position, any further monsters will also be out of range.
        // Therefore, we can optimize by breaking out of this inner loop.
        break;
      }
    }
    // Optional: Log state of monsters after each iteration for detailed debugging
    // logDiagnosticMessage(`State after processing foe ${currentFoe.originalId} (pos: ${currentFoe.position}): Total strikes: ${totalStrikesRequired}, Foe healths: ${foeDataCollection.map(f => `[${f.originalId} P:${f.position} H:${f.health}]`).join(', ')}`);
  }

  // Output the final calculated total number of strikes required
  displayFinalOutput(totalStrikesRequired);
}