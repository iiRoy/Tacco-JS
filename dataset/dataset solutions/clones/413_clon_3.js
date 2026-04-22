const { readFileSync } = require('node:fs');

/**
 * Helper function to determine the third color given two distinct colors.
 * This abstracts the logic for finding the complementary color in the 'r', 'g', 'b' palette.
 * @param {string} charA - The first color character ('r', 'g', or 'b').
 * @param {string} charB - The second color character ('r', 'g', or 'b').
 * @returns {string} The third color character that is not charA or charB.
 */
function identifyComplementaryColor(charA, charB) {
  // A direct lookup or conditional structure can be more explicit than filtering.
  if (charA === 'r' && charB === 'g' || charA === 'g' && charB === 'r') {
    return 'b';
  } else if (charA === 'r' && charB === 'b' || charA === 'b' && charA === 'r') {
    return 'g';
  } else if (charA === 'g' && charB === 'b' || charA === 'b' && charA === 'g') {
    return 'r';
  }
  // In a robust system, an error might be thrown here if invalid inputs are possible.
  // For this problem context, it's assumed valid distinct color pairs are always provided.
  return '';
}

/**
 * Represents a specific state of a color sequence, including its identifier
 * and the number of transformations applied to reach it from an initial state.
 */
class ColorSequence {
  /**
   * Constructs a new ColorSequence instance.
   * @param {string} sequenceIdentifier - The string representation of the color sequence (e.g., "rrgb").
   * @param {number} transformationDepth - The depth in the transformation tree, starting from 0 for the initial sequence.
   */
  constructor(sequenceIdentifier, transformationDepth) {
    // Validate input to ensure basic correctness.
    if (typeof sequenceIdentifier !== 'string' || sequenceIdentifier.length === 0) {
      throw new Error("ColorSequence identifier must be a non-empty string.");
    }
    if (typeof transformationDepth !== 'number' || transformationDepth < 0) {
      throw new Error("Transformation depth must be a non-negative number.");
    }

    this.sequenceIdentifier = sequenceIdentifier;
    this.transformationDepth = transformationDepth;
    // Convert the sequence string into an array of characters for easier manipulation.
    this.sequenceCharacters = Array.from(sequenceIdentifier);
    this.sequenceLength = this.sequenceCharacters.length; // Cache length for efficiency.
  }

  /**
   * Generates all possible immediate successor sequences by applying the transformation rule.
   * The rule states: if two adjacent characters are different, they are replaced by the third color.
   * @returns {string[]} An array of strings, where each string is a valid successor sequence identifier.
   */
  generateSuccessorSequences() {
    const successorIdentifiers = [];
    const currentChars = this.sequenceCharacters;
    const lastPossibleIndex = this.sequenceLength - 1;

    // A sequence must have at least two characters to perform any transformation.
    if (this.sequenceLength < 2) {
      return successorIdentifiers; // No transformations possible for short sequences.
    }

    // Iterate through all adjacent pairs of characters in the sequence.
    for (let currentIdx = 0; currentIdx < lastPossibleIndex; currentIdx++) {
      const charAtCurrent = currentChars[currentIdx];
      const charAtNext = currentChars[currentIdx + 1];

      // The transformation rule only applies if the two adjacent characters are different.
      if (charAtCurrent === charAtNext) {
        continue; // Skip if characters are identical.
      }

      // Determine the replacement character using the helper function.
      const replacingChar = identifyComplementaryColor(charAtCurrent, charAtNext);

      // Create a new array of characters for the modified sequence.
      // Using spread syntax for a shallow copy is clear and efficient.
      const modifiedCharsArray = [...currentChars];
      modifiedCharsArray[currentIdx] = replacingChar;
      modifiedCharsArray[currentIdx + 1] = replacingChar;

      // Join the modified characters back into a string and add it to the results.
      successorIdentifiers.push(modifiedCharsArray.join(''));
    }
    return successorIdentifiers;
  }
}

/**
 * Implements a Breadth-First Search (BFS) algorithm to explore color sequence transformations.
 * It tracks visited sequences to avoid redundant computations and find the shortest path.
 */
class SequencePathfinder {
  /**
   * Initializes a new SequencePathfinder instance.
   */
  constructor() {
    // `visitedSequences` stores ColorSequence objects, keyed by their string identifier.
    // This acts as both a visited set and a way to retrieve sequence data (like depth).
    this.visitedSequences = new Map();
    // `explorationQueue` holds sequence identifiers to be processed in BFS order.
    this.explorationQueue = [];
  }

  /**
   * Checks if a given sequence identifier has already been encountered during the search.
   * @param {string} identifier - The sequence string to check.
   * @returns {boolean} True if the sequence is in `visitedSequences`, false otherwise.
   */
  isSequenceVisited(identifier) {
    return this.visitedSequences.has(identifier);
  }

  /**
   * Retrieves a `ColorSequence` object from the `visitedSequences` map.
   * @param {string} identifier - The sequence string to retrieve.
   * @returns {ColorSequence | undefined} The `ColorSequence` object, or `undefined` if not found.
   */
  retrieveSequenceData(identifier) {
    return this.visitedSequences.get(identifier);
  }

  /**
   * Records a new sequence into the `visitedSequences` map and creates its `ColorSequence` object.
   * @param {string} identifier - The sequence string to record.
   * @param {number} depth - The transformation depth of this sequence.
   */
  recordNewSequence(identifier, depth) {
    // Basic validation to prevent recording malformed data.
    if (!identifier || typeof depth !== 'number' || depth < 0) {
      console.warn(`Attempted to record invalid sequence: ID='${identifier}', Depth=${depth}.`);
      return;
    }
    this.visitedSequences.set(identifier, new ColorSequence(identifier, depth));
  }

  /**
   * Executes a Breadth-First Search starting from an initial sequence.
   * The goal is to find the first sequence encountered that has no further possible transformations.
   * @param {string} initialSequenceId - The starting color sequence string.
   * @returns {ColorSequence | null} The terminal `ColorSequence` object if found, otherwise `null`.
   */
  findShortestPathToTerminalState(initialSequenceId) {
    // Clear previous search data to ensure a fresh BFS run.
    this.visitedSequences.clear();
    this.explorationQueue = [];

    // Guard clause for invalid starting input.
    if (!initialSequenceId || initialSequenceId.length === 0) {
      console.error("BFS initiated with an empty or invalid starting sequence ID.");
      return null;
    }

    // Initialize the BFS: add the starting sequence to the map and the queue.
    this.recordNewSequence(initialSequenceId, 0);
    this.explorationQueue.push(initialSequenceId);

    // Main BFS loop: continue as long as there are sequences to explore.
    while (this.explorationQueue.length > 0) {
      // Dequeue the next sequence identifier to process.
      const currentSequenceIdentifier = this.explorationQueue.shift();
      // Retrieve the full `ColorSequence` object for current processing.
      const currentSequenceObject = this.retrieveSequenceData(currentSequenceIdentifier);

      // This check acts as a safeguard, though a sequence in the queue should always be in visitedSequences.
      if (!currentSequenceObject) {
        console.error(`Internal error: Sequence ID '${currentSequenceIdentifier}' found in queue but not in visited map.`);
        continue;
      }

      // Generate all possible next states (successor sequences).
      const immediateSuccessorIds = currentSequenceObject.generateSuccessorSequences();

      // If a sequence generates no successors, it means it's a terminal state.
      // This is our target, so return it.
      if (immediateSuccessorIds.length === 0) {
        return currentSequenceObject;
      }

      // Calculate the transformation depth for the next level of sequences.
      const nextLevelDepth = currentSequenceObject.transformationDepth + 1;

      // Process each generated successor.
      for (const nextSeqId of immediateSuccessorIds) {
        // If this successor has not been visited before, it means we found a new shortest path to it.
        if (!this.isSequenceVisited(nextSeqId)) {
          // Record the new sequence with its depth and add it to the queue for future exploration.
          this.recordNewSequence(nextSeqId, nextLevelDepth);
          this.explorationQueue.push(nextSeqId);
        }
        // If `nextSeqId` has already been visited, it means we've already found an equal or shorter path,
        // so we don't need to re-add it to the queue or update its depth.
      }
    }

    // If the queue becomes empty and no terminal state was found,
    // it means there's no path from the initial sequence to a terminal state.
    return null;
  }
}

/**
 * Orchestrates the reading of input, processing each sequence, and outputting results.
 */
function runSequenceAnalysisProgram() {
  let rawInputContent;
  try {
    // Attempt to read all input data from standard input.
    rawInputContent = readFileSync('/dev/stdin', 'utf8');
  } catch (error) {
    // Provide an informative error message if input reading fails.
    console.error(`Failed to read input from /dev/stdin: ${error.message}`);
    return; // Terminate execution if input cannot be processed.
  }

  // Pre-process the raw input: remove leading/trailing whitespace, split into lines,
  // and filter out any empty lines that might result from splitting.
  const inputSequenceLines = rawInputContent
    .trim()
    .split('\n')
    .filter(line => line.length > 0);

  let totalSequencesProcessed = 0; // Keep track of how many sequences were analyzed.

  // Iterate over each line provided in the input.
  for (const currentLine of inputSequenceLines) {
    // The original problem uses '0' as a sentinel value to indicate end or skip.
    if (currentLine === '0') {
      continue; // Skip processing this line.
    }

    totalSequencesProcessed++; // Increment the counter for each actual sequence processed.

    // For each input sequence, instantiate a new pathfinder to ensure an independent search.
    const currentPathfinder = new SequencePathfinder();
    const finalSequenceResult = currentPathfinder.findShortestPathToTerminalState(currentLine);

    // Output the transformation depth if a terminal sequence was found, otherwise 'NA'.
    if (finalSequenceResult) {
      console.log(finalSequenceResult.transformationDepth);
    } else {
      console.log('NA');
    }
  }

  // Optional: A summary message after all processing is complete.
  // console.log(`\n--- Analysis Summary ---`);
  // console.log(`Total starting sequences analyzed: ${totalSequencesProcessed}`);
}

// Execute the main program function.
runSequenceAnalysisProgram();