const INPUT_READ_INTERFACE = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let parsedInputSource;
const rawInputLines = [];

// Custom logging utility for debugging
const debugLogger = (message) => {
  // Using console.error to ensure it goes to stderr, useful for competitive programming
  console.error(`[DEBUG]: ${require("util").inspect(message, false, null)}`);
};

// Custom output utility for results
const outputResult = (data) => {
  console.log(data);
};

// Enum-like object for input conversion types
const ConversionTypes = {
  AS_INTEGER: 1,
  SPLIT_BY_SPACE_STRINGS: 2,
  SPLIT_BY_SPACE_INTEGERS: 4,
  SPLIT_BY_CHARACTERS_STRINGS: 6,
  SPLIT_BY_CHARACTERS_INTEGERS: 7,
  JOIN_BY_SPACE: 8,
  JOIN_BY_NEWLINE: 9,
  JOIN_NO_DELIMITER: 0,
  DEFAULT: -1 // For unknown or no specific conversion
};

INPUT_READ_INTERFACE.on('line', function(singleLineInput){
  if (singleLineInput !== null && singleLineInput !== undefined) {
    rawInputLines.push(singleLineInput);
  }
});

INPUT_READ_INTERFACE.on('close', function(){
  parsedInputSource = initializeInputParser(rawInputLines);
  debugLogger("\n--- Program Execution Start ---");
  const startTime = Date.now();
  solveGraphProblem();
  const endTime = Date.now() - startTime;
  debugLogger(`Execution time: ${endTime}ms`);
  debugLogger(`Memory usage: ${Math.round(process.memoryUsage().heapTotal / 1024)}KB`);
  debugLogger("--- Program Execution End ---");
});

/**
 * Initializes an object to handle sequential reading of input lines.
 * @param {string[]} inputSource An array of strings representing input lines.
 * @returns {object} An input handler object with methods to read lines.
 */
function initializeInputParser(inputSource){
  // Ensure inputSource is an array, even if empty
  const processedSource = Array.isArray(inputSource) ? inputSource : [];

  const inputHandler = {
    sourceLines : processedSource,
    currentLineIndex : 0,
    totalLines : processedSource.length,

    /**
     * Checks if there are more lines to read.
     * @returns {boolean} True if more lines exist, false otherwise.
     */
    hasMoreLines : function(){
      return (this.currentLineIndex < this.totalLines);
    },

    /**
     * Retrieves the next available input line.
     * @returns {string} The next line from the input source.
     * @throws {Error} If no more input lines are available.
     */
    getNextLine : function(){
      if(!this.hasMoreLines()){
        throw new Error("EndOfInputException: No more input lines to process.");
      }
      const currentInputLine = this.sourceLines[this.currentLineIndex];
      this.currentLineIndex++; // Advance the pointer
      return currentInputLine;
    }
  };
  return inputHandler;
}

/**
 * Reads the next input line and attempts to convert it to an integer.
 * @returns {number} The parsed integer.
 */
function readInteger(){
  const line = parsedInputSource.getNextLine();
  return convertInputFormat(line, ConversionTypes.AS_INTEGER);
}

/**
 * Reads the next input line, splits it by spaces, and converts parts to integers.
 * @returns {number[]} An array of parsed integers.
 */
function readIntArray(){
  const line = parsedInputSource.getNextLine();
  return convertInputFormat(line, ConversionTypes.SPLIT_BY_SPACE_INTEGERS);
}

/**
 * Reads the next input line, splits it by spaces, and returns parts as strings.
 * (Not used in this problem, but kept for Type III variation)
 * @returns {string[]} An array of strings.
 */
function readStringArray(){
  const line = parsedInputSource.getNextLine();
  return convertInputFormat(line, ConversionTypes.SPLIT_BY_SPACE_STRINGS);
}

/**
 * Reads the next input line, splits it into individual characters.
 * (Not used in this problem, but kept for Type III variation)
 * @returns {string[]} An array of single-character strings.
 */
function readCharacterArray(){
  const line = parsedInputSource.getNextLine();
  return convertInputFormat(line, ConversionTypes.SPLIT_BY_CHARACTERS_STRINGS);
}

/**
 * Converts an input value based on a specified conversion type.
 * @param {*} inputValue The value to convert.
 * @param {number} conversionType An identifier from ConversionTypes specifying the desired format.
 * @returns {*} The converted value.
 */
function convertInputFormat(inputValue, conversionType){
  if (inputValue === null || inputValue === undefined) {
    debugLogger("Warning: Attempted to convert null/undefined input value.");
    return inputValue;
  }

  try {
    switch(conversionType){
      case ConversionTypes.AS_INTEGER:
        // Use Number() for more robust conversion than parseInt, also handles floats (though not expected here)
        return Number(inputValue);
      case ConversionTypes.SPLIT_BY_SPACE_STRINGS:
        return String(inputValue).split(" ");
      case ConversionTypes.SPLIT_BY_SPACE_INTEGERS:
        return String(inputValue).split(" ").map(Number);
      case ConversionTypes.SPLIT_BY_CHARACTERS_STRINGS:
        return String(inputValue).split("");
      case ConversionTypes.SPLIT_BY_CHARACTERS_INTEGERS:
        return String(inputValue).split("").map(Number);
      case ConversionTypes.JOIN_BY_SPACE:
        if (Array.isArray(inputValue)) return inputValue.join(" ");
        break;
      case ConversionTypes.JOIN_BY_NEWLINE:
        if (Array.isArray(inputValue)) return inputValue.join("\n");
        break;
      case ConversionTypes.JOIN_NO_DELIMITER:
        if (Array.isArray(inputValue)) return inputValue.join("");
        break;
      default:
        // For unknown or default, return as is
        return inputValue;
    }
  } catch(error) {
    debugLogger(`Error during input conversion (type: ${conversionType}): ${error.message}`);
    // Fallback to returning original value on error
    return inputValue;
  }
  return inputValue; // Default return if switch cases don't catch
}

/**
 * Main function to solve the graph problem: find shortest path in a specific graph.
 */
function solveGraphProblem(){
  const firstInputLine = readIntArray();
  const nodeCount = firstInputLine[0];
  const edgeCount = firstInputLine[1];

  // Initialize graph nodes with their properties
  const graphNodes = Array.from({ length: nodeCount }, () => ({
    children : [], // Nodes reachable directly from this node
    parents : new Set(), // Nodes that can reach this node (via a path of length 3)
    isVisited : false, // Used in BFS to track visited nodes
    distanceFromTarget : 0 // Distance in BFS from the target node
  }));

  // Build graph edges (children connections)
  for(let i = 0; i < edgeCount; i++){
    const edgeData = readIntArray();
    if (edgeData.length < 2) {
      debugLogger(`Warning: Malformed edge data encountered: ${edgeData}`);
      continue; // Skip invalid edge
    }
    const fromNode = edgeData[0] - 1; // Adjust to 0-indexed
    const toNode = edgeData[1] - 1;   // Adjust to 0-indexed

    // Basic validation for node indices
    if (fromNode >= 0 && fromNode < nodeCount && toNode >= 0 && toNode < nodeCount) {
      graphNodes[fromNode].children.push(toNode);
    } else {
      debugLogger(`Warning: Invalid node index for edge: (${edgeData[0]}, ${edgeData[1]})`);
    }
  }

  // Populate 'parents' sets using a modified DFS for paths of length exactly 3
  for(let startingNodeIdx = 0; startingNodeIdx < nodeCount; startingNodeIdx++){
    explorePathRecursive(startingNodeIdx, startingNodeIdx, 0);
  }

  const startTargetPair = readIntArray();
  const sourceNodeIndex = startTargetPair[0] - 1; // S
  const targetNodeIndex = startTargetPair[1] - 1; // T

  // Validate start and target nodes
  if (sourceNodeIndex < 0 || sourceNodeIndex >= nodeCount ||
      targetNodeIndex < 0 || targetNodeIndex >= nodeCount) {
    outputResult(-1);
    return;
  }

  // Perform a Breadth-First Search (BFS) starting from the target node
  // to find the shortest path to the source node using 'parent' connections.
  const bfsQueue = [];
  // Initialize target node for BFS
  graphNodes[targetNodeIndex].isVisited = true;
  graphNodes[targetNodeIndex].distanceFromTarget = 0;
  bfsQueue.push(targetNodeIndex);

  let shortestPathLength = -1; // Initialize with -1 to indicate no path found

  while(bfsQueue.length > 0){
    const currentNodeIndex = bfsQueue.shift(); // Dequeue the front node

    // If we've reached the source node, we've found the shortest path
    if(currentNodeIndex === sourceNodeIndex){
      shortestPathLength = graphNodes[currentNodeIndex].distanceFromTarget;
      break; // Exit BFS as shortest path is found
    }

    // Iterate through nodes that can reach the current node (parents)
    // Using spread operator for Set to Array conversion, more modern syntax
    const parentNodes = [...graphNodes[currentNodeIndex].parents];

    for(const potentialParentIndex of parentNodes){
      // Ensure the neighbor is valid and not yet visited
      if (potentialParentIndex >= 0 && potentialParentIndex < nodeCount &&
          !graphNodes[potentialParentIndex].isVisited){

        graphNodes[potentialParentIndex].isVisited = true;
        graphNodes[potentialParentIndex].distanceFromTarget = graphNodes[currentNodeIndex].distanceFromTarget + 1;
        bfsQueue.push(potentialParentIndex);
      }
    }
  }

  // Output the result
  outputResult(shortestPathLength);

  /**
   * Performs a Depth-First Search to find nodes reachable in exactly 3 steps.
   * If a node `initialNode` can reach `currentNode` in `currentDepth` steps,
   * and `currentDepth` is 3, then `initialNode` is added to `currentNode`'s parents set.
   * This function is nested to have access to `graphNodes`.
   * @param {number} initialNode The starting node index for the current DFS path.
   * @param {number} currentNode The node currently being visited.
   * @param {number} currentDepth The current depth of the path from `initialNode`.
   */
  function explorePathRecursive(initialNode, currentNode, currentDepth){
    // Guard clause for invalid node or excessive depth
    if (currentNode < 0 || currentNode >= nodeCount || currentDepth > 3) {
      return;
    }

    // Base case: If path length is exactly 3, add initialNode to currentNode's parents.
    if(currentDepth === 3){
      graphNodes[currentNode].parents.add(initialNode);
      return;
    }

    // Recursive step: Explore children
    const childConnections = graphNodes[currentNode].children;
    for(const nextChildNode of childConnections){
      explorePathRecursive(initialNode, nextChildNode, currentDepth + 1);
    }
    // No explicit return value needed for this void function
  }
}