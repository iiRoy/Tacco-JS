const fileSystem = require("fs");

/**
 * A utility module for processing structured string input.
 * It provides methods to parse lines, tokens, and numerical data.
 * The internal implementation manages the input lines and current reading position.
 */
const InputUtility = (() => {
  /**
   * Represents an input stream reader, designed for competitive programming style input.
   * It handles reading values, lines, and matrices from a given string.
   * Some methods modify the internal line buffer for efficiency, mimicking the original behavior.
   */
  class InputReaderService {
    #bufferedInputLines; // Private field: Array of input lines, can be modified in-place.
    #currentLinePosition; // Private field: Index of the current line being processed.

    /**
     * Initializes the InputReaderService with the raw input string.
     * @param {string} sourceContent - The entire input as a single string.
     * @throws {TypeError} If the sourceContent is not a string.
     */
    constructor(sourceContent) {
      if (typeof sourceContent !== 'string') {
        throw new TypeError("Input source content must be a string for processing.");
      }
      this.#bufferedInputLines = sourceContent.trim().split('\n');
      this.#currentLinePosition = 0;
    }

    /**
     * Reads a single value (token) from the current line, consuming from right-to-left.
     * This method modifies the internal representation of the current line.
     * If the line is exhausted, it advances to the next line.
     * @param {boolean} [returnAsString=false] - If true, returns the value as a string; otherwise, as a number.
     * @returns {string|number} The extracted value.
     * @throws {Error} If attempting to read beyond the end of the input.
     */
    consumeNextValue(returnAsString = false) {
      // Ensure we haven't exhausted the input.
      if (this.#currentLinePosition >= this.#bufferedInputLines.length) {
        throw new Error("End of input reached while trying to consume a single value.");
      }

      // If the current line is still a string, split and reverse it in place
      // to support right-to-left token consumption.
      if (typeof this.#bufferedInputLines[this.#currentLinePosition] === 'string') {
        this.#bufferedInputLines[this.#currentLinePosition] =
          this.#bufferedInputLines[this.#currentLinePosition].split(' ').reverse();
      }

      const currentLineTokens = this.#bufferedInputLines[this.#currentLinePosition];

      // Check if the current line (now an array of tokens) is empty or invalid.
      if (!Array.isArray(currentLineTokens) || currentLineTokens.length === 0) {
        // This case should ideally not happen with well-formed input if the line was a string.
        // If an empty line is encountered, `pop()` will return `undefined`.
        // The original code would then attempt `+undefined`, resulting in `NaN`.
        this.#currentLinePosition++; // Advance the pointer even if the line was empty or malformed.
        return returnAsString ? '' : NaN; // Return a default value for consistency.
      }

      const extractedValue = currentLineTokens.pop();

      // If all tokens from the current line have been consumed, move to the next line.
      if (currentLineTokens.length === 0) {
        this.#currentLinePosition++;
      }

      return returnAsString ? extractedValue : Number(extractedValue);
    }

    /**
     * Reads an entire line as an array of values, consuming from left-to-right.
     * Advances the internal line pointer.
     * Handles lines that might have been partially processed by `consumeNextValue`.
     * @param {boolean} [asTextArray=false] - If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<string|number>} An array of values from the line.
     */
    fetchNextLineValues(asTextArray = false) {
      if (this.#currentLinePosition >= this.#bufferedInputLines.length) {
        // Type III: Add a console warning for robustness instead of throwing.
        console.warn("Input exhausted: No more lines to fetch. Returning an empty array.");
        return [];
      }

      const lineContent = this.#bufferedInputLines[this.#currentLinePosition++];
      let tokens;

      // If the line was modified by `consumeNextValue`, it's an array of reversed tokens.
      // Reverse it back to get the original order for left-to-right reading.
      if (Array.isArray(lineContent)) {
        tokens = lineContent.reverse();
      } else {
        tokens = lineContent.split(' ');
      }

      return asTextArray ? tokens : tokens.map(item => Number(item));
    }

    /**
     * Reads a specified number of lines and parses them into a 2D array (matrix).
     * Each line is split by spaces. Advances the internal line pointer by `rowCount`.
     * Assumes these lines have not been modified by `consumeNextValue`.
     * @param {number} rowCount - The number of rows (lines) to read.
     * @param {boolean} [outputAsStrings=false] - If true, returns a matrix of strings; otherwise, numbers.
     * @returns {Array<Array<string|number>>} The parsed matrix.
     */
    retrieveValueMatrix(rowCount, outputAsStrings = false) {
      // Type III: Add a guard clause for insufficient lines.
      if (this.#currentLinePosition + rowCount > this.#bufferedInputLines.length) {
        console.error(`Error: Not enough lines (${rowCount}) available for matrix read. Input exhausted.`);
        return []; // Return an empty matrix in case of error.
      }

      const segment = this.#bufferedInputLines.slice(this.#currentLinePosition, this.#currentLinePosition + rowCount);
      this.#currentLinePosition += rowCount; // Advance the pointer.

      const processedMatrix = segment.map(line => {
        // These lines are expected to be raw strings as per the typical usage pattern
        // where `consumeNextValue` and `fetchNextLineValues` advance the pointer past their lines.
        const tokens = line.split(' ');
        return outputAsStrings ? tokens : tokens.map(token => Number(token));
      });
      return processedMatrix;
    }

    /**
     * Reads a specified number of lines and parses them into a 1D array.
     * Each line is treated as a single value. Advances the internal line pointer by `numLinesToRead`.
     * Assumes these lines have not been modified by `consumeNextValue`.
     * @param {number} numLinesToRead - The number of lines to read.
     * @param {boolean} [returnAsRawText=false] - If true, returns an array of strings; otherwise, numbers.
     * @returns {Array<string|number>} The parsed array.
     */
    acquireLineArray(numLinesToRead, returnAsRawText = false) {
      // Type III: Add a guard clause for insufficient lines.
      if (this.#currentLinePosition + numLinesToRead > this.#bufferedInputLines.length) {
        console.error(`Error: Not enough lines (${numLinesToRead}) available for array read. Input exhausted.`);
        return []; // Return an empty array in case of error.
      }

      const extractedLines = this.#bufferedInputLines.slice(this.#currentLinePosition, this.#currentLinePosition + numLinesToRead);
      this.#currentLinePosition += numLinesToRead; // Advance the pointer.

      return returnAsRawText ? extractedLines : extractedLines.map(line => Number(line));
    }
  }

  /**
   * Factory function to create a new input handler instance.
   * @param {string} inputData - The raw string content to be parsed.
   * @returns {InputReaderService} An instance of the input reader.
   */
  function createInputHandler(inputData) {
    return new InputReaderService(inputData);
  }

  return createInputHandler;
})();

// Instantiate the input data handler.
const inputDataHandler = InputUtility(fileSystem.readFileSync("/dev/stdin", "utf8"));

/**
 * Executes the core problem-solving logic.
 * This function calculates the number of "generations" or "levels" in a directed graph
 * by performing a reverse traversal from nodes that are not sources of any edge.
 * It effectively finds the length of the longest path from any node to a 'sink' node (a node without outgoing edges in the input).
 *
 * @returns {number} The calculated maximum number of generations.
 */
function processSolver() {
  // Read graph dimensions.
  const totalNodes = inputDataHandler.consumeNextValue();
  const totalEdges = inputDataHandler.consumeNextValue();

  // Read all edge connections as a 2D array.
  const edgeConnections = inputDataHandler.retrieveValueMatrix(totalEdges);

  // Initialize a boolean array to track nodes that are NOT source nodes (i.e., potential sinks or roots in reverse traversal).
  // `true` means a node has not been identified as a source of any edge.
  const isPotentialSink = new Array(totalNodes + 1).fill(true);

  // Initialize an adjacency list for the reverse graph (predecessors).
  // `adjacencyListReverse[destination]` will contain a list of `source` nodes pointing to `destination`.
  const adjacencyListReverse = new Array(totalNodes + 1).fill(null).map(() => []);

  // Process each edge to build the graph's reverse adjacency list and identify true source nodes.
  for (let edgeIndex = 0; edgeIndex < totalEdges; edgeIndex++) {
    const sourceNode = edgeConnections[edgeIndex][0];
    const destinationNode = edgeConnections[edgeIndex][1];

    // Mark the source node as having an outgoing edge, meaning it is NOT a "potential sink".
    isPotentialSink[sourceNode] = false;

    // Add the source node to the destination's list of predecessors.
    adjacencyListReverse[destinationNode].push(sourceNode);
  }

  let calculatedGenerationLevel = -1; // Initialize the generation counter.

  // Initialize the first generation with all nodes that are not sources of any edge.
  // These are the starting points for our reverse traversal.
  const nodesInCurrentGeneration = [];
  for (let nodeIdentifier = 1; nodeIdentifier <= totalNodes; nodeIdentifier++) {
    if (isPotentialSink[nodeIdentifier]) {
      nodesInCurrentGeneration.push(nodeIdentifier);
    }
  }

  // Perform a breadth-first-search-like traversal in reverse.
  // Each iteration of this loop represents a new "generation" or "level".
  while (nodesInCurrentGeneration.length > 0) {
    const nodesForNextGeneration = []; // Stores nodes for the subsequent generation.

    // A set to keep track of nodes already processed in the *current* generation.
    // This handles cases where `nodesInCurrentGeneration` might contain duplicates
    // or a node's predecessors are processed through multiple paths in the same generation.
    const nodesProcessedInThisCycle = new Set();

    calculatedGenerationLevel++; // Increment the generation counter for this level.

    // Iterate through all nodes identified for the current generation.
    for (const currentNode of nodesInCurrentGeneration) {
      // If this node has already been processed in the current cycle (due to duplicates), skip it.
      if (nodesProcessedInThisCycle.has(currentNode)) {
        continue;
      }
      nodesProcessedInThisCycle.add(currentNode); // Mark node as processed for this cycle.

      // Collect all nodes that directly point to the `currentNode`.
      const predecessors = adjacencyListReverse[currentNode];
      if (predecessors && predecessors.length > 0) {
        nodesForNextGeneration.push(...predecessors);
      }
    }

    // Clear the current generation nodes and populate it with the newly found predecessors.
    nodesInCurrentGeneration.length = 0;
    nodesInCurrentGeneration.push(...nodesForNextGeneration);
  }

  return calculatedGenerationLevel;
}

// Execute the solver and print the result to the console.
console.log(processSolver());