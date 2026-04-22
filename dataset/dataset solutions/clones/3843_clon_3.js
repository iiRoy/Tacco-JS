const convertToNumber = (value) => {
  if (value === null || value === undefined) {
    return NaN;
  }
  const numericValue = Number(value);
  return isNaN(numericValue) ? value : numericValue;
};

/**
 * Manages reading input lines and tokens from a given string source.
 * This class provides methods to extract tokens one by one, read entire lines,
 * or read multiple lines as arrays of tokens. It handles whitespace and line breaks.
 */
class InputLineProcessor {
  // Internal array holding all trimmed, non-empty lines from the input string.
  #sourceTextLines;
  // Index indicating the current line being processed within #sourceTextLines.
  #currentLineIdx;
  // Array of tokens from the currently active line, processed from right to left using pop().
  #activeLineTokens;

  /**
   * Initializes the InputLineProcessor with the provided raw input string.
   * @param {string} rawInputContent - The complete input string, typically read from a file.
   */
  constructor(rawInputContent) {
    if (typeof rawInputContent !== 'string') {
      console.error("Initialization Error: Input content must be a string.");
      this.#sourceTextLines = [];
      this.#currentLineIdx = 0;
      this.#activeLineTokens = [];
      return;
    }

    // Split the input into lines, trim whitespace from each line,
    // and filter out any lines that become empty after trimming.
    this.#sourceTextLines = rawInputContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    this.#currentLineIdx = 0;
    // Initialize activeLineTokens as an empty array; it will be populated on demand.
    this.#activeLineTokens = [];
  }

  /**
   * Extracts the next single token from the input stream. If the current line's tokens
   * are exhausted, it automatically advances to the next available line. Tokens are
   * processed from right to left within a line to mimic a stack-like pop behavior.
   * @param {boolean} [returnAsText=false] - If true, the token is returned as a string;
   *                                         otherwise, an attempt is made to convert it to a number.
   * @returns {string|number|null} The extracted token, or null if no more input tokens are available.
   */
  fetchNextToken(returnAsText = false) {
    // If the current line's token array is empty, we need to load tokens from the next line.
    if (this.#activeLineTokens.length === 0) {
      // Check if there are any more lines remaining to process.
      if (this.#currentLineIdx >= this.#sourceTextLines.length) {
        return null; // No more input lines available.
      }

      // Retrieve the next line, split it by spaces, and reverse the resulting array
      // so that pop() extracts tokens in their original order.
      this.#activeLineTokens = this.#sourceTextLines[this.#currentLineIdx]
        .split(' ')
        .filter(token => token.length > 0) // Filter out empty strings from multiple spaces
        .reverse();

      // If, after splitting and filtering, the line is still empty (e.g., a line with only spaces),
      // advance the line index and recursively try to fetch a token from the subsequent line.
      if (this.#activeLineTokens.length === 0) {
        this.#currentLineIdx++;
        return this.fetchNextToken(returnAsText);
      }
    }

    // Extract the last token from the reversed array (which is the first token in original order).
    const extractedToken = this.#activeLineTokens.pop();

    // If the active line has now been fully consumed, increment the line index for the next read.
    if (this.#activeLineTokens.length === 0) {
      this.#currentLineIdx++;
    }

    // Return the token, either as its original string value or after conversion to a number.
    return returnAsText ? extractedToken : convertToNumber(extractedToken);
  }

  /**
   * Reads all tokens present on the current line and then advances the internal pointer
   * to the beginning of the next line. This method clears any partially processed tokens
   * from the previous `fetchNextToken` calls for the current line.
   * @param {boolean} [keepAsStrings=false] - If true, tokens are returned as strings;
   *                                          otherwise, they are converted to numbers.
   * @returns {Array<string|number>|null} An array containing all tokens from the line,
   *                                      or null if no more lines are available to read.
   */
  readAllLineTokens(keepAsStrings = false) {
    // Clear any leftover tokens from previous `fetchNextToken` calls for the current line.
    this.#activeLineTokens = [];

    // Check if there are any lines left to read.
    if (this.#currentLineIdx >= this.#sourceTextLines.length) {
      return null; // No more lines.
    }

    // Get the content of the current line.
    const lineContent = this.#sourceTextLines[this.#currentLineIdx];
    this.#currentLineIdx++; // Immediately advance to the next line.

    // Split the line by spaces and filter out any empty strings that result from multiple spaces.
    const tokensOnLine = lineContent.split(' ').filter(token => token.length > 0);

    // Convert tokens to numbers if requested, otherwise return them as strings.
    return keepAsStrings ? tokensOnLine : tokensOnLine.map(val => convertToNumber(val));
  }

  /**
   * Reads a specified number of consecutive lines, returning each line as an array of tokens.
   * This method utilizes `readAllLineTokens` internally for consistent line processing.
   * @param {number} numLinesToRead - The count of lines to read sequentially.
   * @param {boolean} [returnTokensAsStrings=false] - If true, tokens in each line array are strings;
   *                                                 otherwise, they are converted to numbers.
   * @returns {Array<Array<string|number>>} An array where each element is an array of tokens
   *                                        corresponding to one of the read lines.
   */
  readManyLines(numLinesToRead, returnTokensAsStrings = false) {
    const collectedLines = [];
    // Basic validation: if numLinesToRead is non-positive, return an empty array.
    if (numLinesToRead <= 0) {
      return collectedLines;
    }

    // Determine the actual number of lines we can read, ensuring we don't go out of bounds.
    const actualLinesAvailable = this.#sourceTextLines.length - this.#currentLineIdx;
    const effectiveLinesToProcess = Math.min(numLinesToRead, actualLinesAvailable);

    // Loop to read each line.
    for (let lineCounter = 0; lineCounter < effectiveLinesToProcess; lineCounter++) {
      // Use readAllLineTokens to handle fetching, splitting, and advancing the line index.
      const lineTokens = this.readAllLineTokens(returnTokensAsStrings);
      if (lineTokens !== null) {
        collectedLines.push(lineTokens);
      } else {
        // This case should ideally not be reached due to effectiveLinesToProcess calculation,
        // but it acts as a robust safeguard.
        break;
      }
    }
    return collectedLines;
  }
}

/**
 * Implements a Disjoint Set Union (DSU) data structure, also known as Union-Find.
 * It provides efficient operations for grouping elements into sets and checking
 * if two elements belong to the same set. Includes path compression and union by size
 * for optimized performance.
 */
class DisjointSetUnion {
  // Stores the parent of each element. If parentArray[i] === i, then i is a root.
  #parentArray;
  // Stores the size of the set rooted at each element. Only valid for root elements.
  #setSizes;

  /**
   * Initializes the DSU structure for a specified number of elements.
   * Each element is initially placed into its own distinct set.
   * @param {number} numElements - The total number of elements the DSU will manage.
   *                               Elements are typically 0-indexed or 1-indexed based on problem context.
   */
  constructor(numElements) {
    if (numElements < 0) {
      throw new Error("DSU Initialization Error: Number of elements must be non-negative.");
    }
    // Initialize each element to be its own parent.
    this.#parentArray = Array.from({
      length: numElements
    }, (_, i) => i);
    // Each set initially contains one element, so its size is 1.
    this.#setSizes = Array(numElements).fill(1);
  }

  /**
   * Finds the representative (root) of the set that a given element belongs to.
   * This method applies path compression, which flattens the tree structure
   * by making every node on the path from the element to the root point directly to the root.
   * @param {number} element - The element whose set representative is to be found.
   * @returns {number} The representative (root) of the set containing the element.
   * @throws {Error} If the element index is out of bounds.
   */
  findSetRepresentative(element) {
    // Validate element index to prevent out-of-bounds access.
    if (element < 0 || element >= this.#parentArray.length) {
      throw new Error(`DSU Error: Element ${element} is out of bounds.`);
    }

    // Base case: If the element is its own parent, it is the root of its set.
    if (this.#parentArray[element] === element) {
      return element;
    }

    // Recursive step with path compression:
    // Find the root of the parent, and then set the current element's parent directly to that root.
    return (this.#parentArray[element] = this.findSetRepresentative(this.#parentArray[element]));
  }

  /**
   * Determines whether two given elements belong to the same disjoint set.
   * This is done by comparing their set representatives.
   * @param {number} elementOne - The first element.
   * @param {number} elementTwo - The second element.
   * @returns {boolean} True if both elements are in the same set, false otherwise.
   */
  areElementsInSameSet(elementOne, elementTwo) {
    // Elements are in the same set if their representatives are identical.
    return this.findSetRepresentative(elementOne) === this.findSetRepresentative(elementTwo);
  }

  /**
   * Merges the sets containing `elementOne` and `elementTwo` into a single set.
   * This operation uses the union by size heuristic: the smaller tree is attached
   * as a child of the root of the larger tree. This helps in keeping the tree depth minimal.
   * @param {number} elementOne - An element from the first set to be merged.
   * @param {number} elementTwo - An element from the second set to be merged.
   */
  uniteSets(elementOne, elementTwo) {
    let rootOne = this.findSetRepresentative(elementOne);
    let rootTwo = this.findSetRepresentative(elementTwo);

    // If the elements are already in the same set, no union operation is needed.
    if (rootOne === rootTwo) {
      return;
    }

    // Union by size heuristic: Always attach the root of the smaller tree
    // to the root of the larger tree. This ensures the resulting tree is flatter.
    if (this.#setSizes[rootOne] < this.#setSizes[rootTwo]) {
      // Swap roots to ensure rootOne always refers to the larger set.
      [rootOne, rootTwo] = [rootTwo, rootOne];
    }

    // Make rootTwo's parent point to rootOne, effectively merging set Two into set One.
    this.#parentArray[rootTwo] = rootOne;
    // Update the size of the combined set (rooted at rootOne).
    this.#setSizes[rootOne] += this.#setSizes[rootTwo];
  }
}

// --- Main application execution block ---

// Define the path for standard input. This is common in competitive programming environments.
const INPUT_FILE_PATH = "/dev/stdin";

/**
 * The main function that orchestrates the problem-solving process.
 * It reads input, initializes data structures, performs graph operations (using DSU),
 * and computes the final answer based on the problem's requirements.
 * @returns {number} The final calculated result of the problem.
 */
function processProblemSolution() {
  let rawInputData;
  try {
    // Attempt to read the entire content of the standard input file synchronously.
    rawInputData = require("fs").readFileSync(INPUT_FILE_PATH, "utf8");
  } catch (error) {
    console.error(`File Read Error: Could not read input from ${INPUT_FILE_PATH}.`, error);
    // In a real contest setting, an error here typically means termination or specific error output.
    return -1; // Return an error indicator.
  }

  // Initialize the InputLineProcessor to handle parsing the raw input data.
  const dataStreamReader = new InputLineProcessor(rawInputData);

  // Read the first two numerical tokens from the input. These typically represent
  // the number of nodes (N) and the number of edges (M) in a graph.
  const numberOfNodes = dataStreamReader.fetchNextToken();
  const numberOfEdges = dataStreamReader.fetchNextToken();

  // Read the next line, which is expected to contain a permutation of node values.
  // This is stored as an array of numbers.
  const targetPermutation = dataStreamReader.readAllLineTokens();

  // Initialize the Disjoint Set Union structure. We use `numberOfNodes + 1`
  // elements to support 1-indexed node numbering, if applicable.
  const connectivityManager = new DisjointSetUnion(numberOfNodes + 1);

  // Process a series of edge definitions. Each edge implies a union operation
  // between two nodes, connecting their respective sets.
  for (let edgeIdx = 0; edgeIdx < numberOfEdges; ++edgeIdx) {
    // Read the two nodes that form the current edge from a single line.
    const currentEdgeNodes = dataStreamReader.readAllLineTokens();
    // Perform the union operation to merge the sets containing these two nodes.
    connectivityManager.uniteSets(currentEdgeNodes[0], currentEdgeNodes[1]);
  }

  let countOfCorrectlyPlacedElements = 0;
  // Iterate through each node, typically from 1 up to numberOfNodes (inclusive).
  for (let nodeIdentifier = 1; nodeIdentifier <= numberOfNodes; ++nodeIdentifier) {
    // Check if the current node (`nodeIdentifier`) and its target position (value in `targetPermutation`)
    // belong to the same connected component (set) within the DSU structure.
    // Note: `targetPermutation` is usually 0-indexed, so `nodeIdentifier - 1` is used for access.
    if (connectivityManager.areElementsInSameSet(targetPermutation[nodeIdentifier - 1], nodeIdentifier)) {
      countOfCorrectlyPlacedElements++;
    }
  }

  // Return the final count of elements that satisfy the condition.
  return countOfCorrectlyPlacedElements;
}

// Execute the main solution function and print its return value to standard output.
console.log(processProblemSolution());