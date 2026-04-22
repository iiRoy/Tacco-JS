const fileSystemManager = require('node:fs'); // Utilize Node.js 'node:fs' module for file operations
const pathUtility = require('node:path');     // Include 'path' module for potential path manipulation, though not directly used here

// --- Configuration Constants ---
// Renamed from COLORS to HUE_PALETTE, made immutable, and changed data type representation
const HUE_PALETTE = Object.freeze(['red', 'green', 'blue']);
const SHORT_HUE_MAP = Object.freeze({
  'r': 'red',
  'g': 'green',
  'b': 'blue',
  'red': 'r',
  'green': 'g',
  'blue': 'b'
});

/**
 * Determines the third, distinct hue given two different hues from a palette.
 * This is a helper function to encapsulate the color-replacement logic.
 * @param {string} hueA - The first hue.
 * @param {string} hueB - The second hue.
 * @param {string[]} palette - The array of all valid hues.
 * @returns {string|null} The replacement hue, or null if inputs are invalid or identical.
 */
function findComplementaryHue(hueA, hueB, palette) {
  // Guard clause: Validate inputs
  if (!palette.includes(hueA) || !palette.includes(hueB)) {
    console.error(`[HueResolver] Invalid hue detected: '${hueA}' or '${hueB}' not in palette.`);
    return null;
  }
  // If hues are identical, no complementary hue is needed for replacement.
  if (hueA === hueB) {
    return null;
  }
  // Iterate through the palette to find the one not matching hueA or hueB
  for (const h of palette) {
    if (h !== hueA && h !== hueB) {
      return h;
    }
  }
  // This case should ideally not be reached if the palette has at least 3 distinct colors.
  console.warn(`[HueResolver] Could not find a complementary hue for '${hueA}', '${hueB}'.`);
  return null;
}

/**
 * Represents a sequence of colors, akin to a 'worm' state in the problem.
 * Utilizes private class fields for encapsulation.
 */
class ColorSequence {
  #identifierKey; // Renamed from 'id', now a private field
  #traversalLength; // Renamed from 'depth', now a private field
  #hueSegments; // Renamed from 'colors', now a private field storing full color names

  /**
   * Constructs a new ColorSequence instance.
   * @param {string} keyString - The string identifier for this sequence (e.g., "rgb").
   * @param {number} [pathLength=0] - The number of steps taken to reach this sequence.
   * @throws {Error} If the keyString is invalid or contains unknown color characters.
   */
  constructor(keyString, pathLength = 0) { // Default parameter for pathLength
    // Input validation for the key string
    if (typeof keyString !== 'string' || keyString.length === 0) {
      throw new Error("ColorSequence: Identifier key must be a non-empty string.");
    }
    if (!/^[rgb]+$/.test(keyString)) { // Added regex validation for allowed characters
      throw new Error(`ColorSequence: Identifier key "${keyString}" contains invalid characters. Only 'r', 'g', 'b' are allowed.`);
    }

    this.#identifierKey = keyString;
    this.#traversalLength = pathLength;
    // Convert short char keys ('r', 'g', 'b') to full names ('red', 'green', 'blue') for internal representation
    this.#hueSegments = keyString.split('').map(char => {
      const fullHue = SHORT_HUE_MAP[char];
      if (!fullHue) {
        // This should theoretically be caught by the regex test above, but acts as a safeguard
        throw new Error(`ColorSequence: Unknown short color character '${char}' encountered.`);
      }
      return fullHue;
    });
  }

  // Public getters for accessing private properties
  get id() { return this.#identifierKey; }
  get length() { return this.#traversalLength; }
  get segments() { return [...this.#hueSegments]; } // Return a shallow copy to prevent external modification

  /**
   * Computes all valid next states (successor ColorSequence identifiers) from the current state.
   * This method replaces 'getNextWormIds' and incorporates Type III changes.
   * @returns {string[]} An array of string identifiers for the next possible states.
   */
  calculatePossibleNextStates() {
    const generatedSuccessors = [];
    const segmentCount = this.#hueSegments.length;

    // Guard clause: A sequence needs at least two segments to perform the replacement operation.
    if (segmentCount < 2) {
      // No possible next states if the sequence is too short.
      return generatedSuccessors;
    }

    // Iterate through adjacent pairs of segments
    // Rewritten from a standard 'for' loop to a 'while' loop for structural variation.
    let currentPosition = 0;
    while (currentPosition < segmentCount - 1) {
      const firstSegment = this.#hueSegments[currentPosition];
      const secondSegment = this.#hueSegments[currentPosition + 1];

      // Condition: If adjacent segments are identical, no transformation can occur at this position.
      if (firstSegment === secondSegment) {
        currentPosition++; // Advance the position counter
        continue;
      }

      // Use the dedicated helper function to find the replacement hue.
      const replacementHue = findComplementaryHue(firstSegment, secondSegment, HUE_PALETTE);

      // Guard against cases where a replacement hue could not be determined (e.g., invalid palette setup).
      if (replacementHue === null) {
        console.warn(`[ColorSequence] Skipping transformation at position ${currentPosition} for sequence '${this.#identifierKey}' due to missing complementary hue.`);
        currentPosition++;
        continue;
      }

      // Create the new sequence of segments using array slicing and spread syntax.
      // This is a more functional approach than 'splice', avoiding in-place modification.
      const newSegmentsArray = [
        ...this.#hueSegments.slice(0, currentPosition),      // Segments before the current pair
        replacementHue, replacementHue,                       // The two new, identical segments
        ...this.#hueSegments.slice(currentPosition + 2)      // Segments after the current pair
      ];

      // Convert the new internal 'red'/'green'/'blue' representation back to 'r'/'g'/'b' for the key string.
      const newKeyString = newSegmentsArray.map(fullHue => SHORT_HUE_MAP[fullHue]).join('');

      // Add a validation step for the generated key (e.g., ensure it's not empty, though unlikely here).
      if (newKeyString.length > 0) {
        generatedSuccessors.push(newKeyString);
      } else {
        console.warn(`[ColorSequence] Generated an empty key string from '${this.#identifierKey}' at position ${currentPosition}.`);
      }

      currentPosition++; // Move to the next pair of segments
    }
    return generatedSuccessors;
  }
}

/**
 * Manages the exploration of ColorSequence states using a Breadth-First Search (BFS) approach.
 * Renamed from 'Graph' to 'EvolutionaryPathfinder'.
 */
class EvolutionaryPathfinder {
  #discoveredStates; // Renamed from 'map', private field for visited states
  #pendingExplorationQueue; // Renamed from 'queue', private field for BFS queue
  #maximumExplorationDepth; // New parameter to limit search depth
  #maximumStatesToVisit;    // New parameter to limit total states explored

  /**
   * Initializes the Pathfinder.
   * @param {number} [maxDepth=1000] - The maximum depth to explore in the state graph.
   * @param {number} [maxVisited=100000] - The maximum number of unique states to visit.
   */
  constructor(maxDepth = 1000, maxVisited = 100000) {
    this.#discoveredStates = new Map();
    this.#pendingExplorationQueue = [];
    this.#maximumExplorationDepth = maxDepth;
    this.#maximumStatesToVisit = maxVisited;
  }

  /**
   * Performs a BFS to find the first 'terminal' ColorSequence state reachable from a starting key.
   * A terminal state is defined as one from which no further valid transformations can be made.
   * This method replaces 'bfs' and includes Type III structural changes.
   * @param {string} startKey - The initial ColorSequence identifier string.
   * @returns {ColorSequence|null} The first terminal ColorSequence found, or null if none found within limits.
   */
  findTerminalState(startKey) {
    // Input validation for the starting key
    if (typeof startKey !== 'string' || startKey.length === 0) {
      console.error("[Pathfinder] Starting state key must be a non-empty string.");
      return null;
    }

    // Reset internal state for a new search, ensuring isolation between calls.
    this.#discoveredStates.clear();
    this.#pendingExplorationQueue = [];

    let initialSequence;
    try {
      initialSequence = new ColorSequence(startKey, 0); // Create initial sequence with depth 0
    } catch (error) {
      console.error(`[Pathfinder] Failed to initialize starting sequence "${startKey}": ${error.message}`);
      return null;
    }

    this.#discoveredStates.set(initialSequence.id, initialSequence);
    this.#pendingExplorationQueue.push(initialSequence.id);

    let totalStatesProcessed = 0; // Counter for newly added states

    // Main BFS loop with added limits for depth and total states.
    while (this.#pendingExplorationQueue.length > 0 && totalStatesProcessed < this.#maximumStatesToVisit) {
      const currentSequenceKey = this.#pendingExplorationQueue.shift(); // Dequeue the next state key
      const currentSequenceObject = this.#discoveredStates.get(currentSequenceKey);

      // Guard against unexpected nulls (shouldn't happen if map is consistent)
      if (!currentSequenceObject) {
        console.warn(`[Pathfinder] Encountered a queue entry for a non-existent state: ${currentSequenceKey}. Skipping.`);
        continue;
      }

      // Generate potential next states for the current sequence.
      const potentialNextKeys = currentSequenceObject.calculatePossibleNextStates();

      // Core logic: If no next states can be generated, this is a terminal state.
      // Return it immediately as per original problem specification.
      if (potentialNextKeys.length === 0) {
        return currentSequenceObject;
      }

      // Iterate through the newly generated successor keys.
      // Rewritten from forEach to a for...of loop for structural variation.
      for (const nextStateKey of potentialNextKeys) {
        // Validate the generated key string (should ideally be handled by ColorSequence constructor)
        if (!nextStateKey || nextStateKey.length === 0) {
          console.warn(`[Pathfinder] Skipping an invalid (empty) successor key generated from "${currentSequenceKey}".`);
          continue;
        }

        // Only process states that have not been visited yet to avoid cycles and redundant work.
        if (!this.#discoveredStates.has(nextStateKey)) {
          const newTraversalLength = currentSequenceObject.length + 1;

          // Guard clause: Check if adding this new state would exceed the maximum allowed depth.
          if (newTraversalLength > this.#maximumExplorationDepth) {
            // console.log(`[Pathfinder] Skipping state "${nextStateKey}" as it exceeds max depth (${this.#maximumExplorationDepth}).`);
            continue; // Do not add this state to the queue or map.
          }

          // Guard clause: Check if adding this new state would exceed the maximum allowed visited states.
          if (totalStatesProcessed + 1 >= this.#maximumStatesToVisit) {
            console.warn(`[Pathfinder] Max states to visit (${this.#maximumStatesToVisit}) reached. Terminating search early.`);
            return null; // Return null as no terminal state was found within limits.
          }

          try {
            const newSequenceObject = new ColorSequence(nextStateKey, newTraversalLength);
            this.#discoveredStates.set(nextStateKey, newSequenceObject);
            this.#pendingExplorationQueue.push(nextStateKey);
            totalStatesProcessed++; // Increment the counter only for truly new states added.
          } catch (error) {
            console.error(`[Pathfinder] Error creating new ColorSequence for key "${nextStateKey}": ${error.message}. Skipping.`);
          }
        }
      }
    }

    // If the queue becomes empty and no terminal state was returned, or max states were hit,
    // it means no terminal state was found within the exploration limits.
    return null;
  }
}

// --- Input/Output Handling and Main Execution Logic ---

/**
 * Safely reads input from a specified file path and parses it into an array of cleaned strings.
 * Adds robust error handling and line cleaning.
 * @param {string} [filePath='/dev/stdin'] - The path to the input file.
 * @returns {string[]} An array of cleaned input lines.
 */
function readAndSanitizeInput(filePath = '/dev/stdin') {
  let fileContent;
  try {
    // Read file content with specified encoding
    fileContent = fileSystemManager.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
  } catch (error) {
    console.error(`[InputHandler] Failed to read input from "${filePath}": ${error.message}`);
    return []; // Return an empty array on error
  }

  // Split content by various newline characters, trim whitespace, and filter out empty lines.
  const rawLines = fileContent.split(/\r?\n/); // Handles both Windows (CRLF) and Unix (LF) newlines
  const sanitizedLines = [];
  for (const line of rawLines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length > 0) { // Only consider non-empty lines after trimming
      sanitizedLines.push(trimmedLine);
    }
  }
  return sanitizedLines;
}

/**
 * Prints the result of a state exploration to standard output.
 * Uses process.stdout.write for potentially faster output than console.log in competitive programming.
 * @param {ColorSequence|null} finalSequence - The terminal ColorSequence object or null.
 * @param {string} originalInputKey - The original input key for context (optional, not used in output).
 */
function outputResult(finalSequence, originalInputKey) {
  if (finalSequence && finalSequence.length !== undefined) {
    process.stdout.write(`${finalSequence.length}\n`);
  } else {
    process.stdout.write('NA\n');
  }
}

/**
 * Main function to orchestrate reading inputs, performing state analysis, and outputting results.
 */
function executeAnalysisWorkflow() {
  const problemStatements = readAndSanitizeInput();

  if (problemStatements.length === 0) {
    console.warn("[Main] No valid problem statements found in the input. Exiting.");
    return;
  }

  // Iterate over each problem statement provided in the input.
  for (const statement of problemStatements) {
    const currentProblemKey = statement;

    // Special handling for the '0' termination signal, as per original code's behavior.
    if (currentProblemKey === '0') {
      // If '0' is encountered, stop processing further inputs.
      break;
    }

    // Additional validation for the format of the problem key.
    if (!/^[rgb]+$/.test(currentProblemKey)) {
      console.warn(`[Main] Skipping problem key "${currentProblemKey}" due to invalid format. Expected only 'r', 'g', 'b' characters.`);
      outputResult(null, currentProblemKey); // Output 'NA' for invalid formats
      continue;
    }

    // Create a new pathfinder instance for each problem to ensure a fresh search scope.
    // Explicitly setting limits for robustness.
    const stateNavigator = new EvolutionaryPathfinder(1000, 1000000);
    let discoveredTerminalState = null;

    try {
      // Attempt to find the terminal state using the pathfinder.
      discoveredTerminalState = stateNavigator.findTerminalState(currentProblemKey);
    } catch (error) {
      // Catch any unexpected errors during the BFS process.
      console.error(`[Main] An unexpected error occurred during state exploration for "${currentProblemKey}": ${error.message}`);
      // Ensure 'NA' is printed even if an error occurs.
      discoveredTerminalState = null;
    }
    
    // Output the result for the current problem statement.
    outputResult(discoveredTerminalState, currentProblemKey);
  }
}

// Initiate the analysis workflow when the script is executed.
executeAnalysisWorkflow();