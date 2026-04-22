const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let storedInputData;
let rawInputLines = [];

// Accumulate all input lines from standard input.
inputProcessor.on('line', function(currentLine){
  rawInputLines.push(currentLine);
});

// Once all input has been received, initialize the input reader and execute the main logic.
inputProcessor.on('close', function(){
  storedInputData = initializeInputReader(rawInputLines);
  // A debug message indicating the transition from input processing to core algorithm.
  console.error('\n--- Input Processing Complete --- Commencing Main Algorithm ---');
  ProcessTreeColoring();
});

/**
 * Generates a deep copy of an arbitrary JavaScript entity.
 * Special handling for Set objects, otherwise relies on JSON serialization/deserialization.
 * Primitive values are returned directly as they are immutable.
 * @param {any} sourceEntity The object or value to be duplicated.
 * @returns {any} A new, independent copy of the sourceEntity.
 */
function deepCopyEntity(sourceEntity){
  if (sourceEntity instanceof Set) {
    // For Set objects, create a new Set from the elements of the original Set.
    return new Set(Array.from(sourceEntity));
  } else if (typeof sourceEntity === 'object' && sourceEntity !== null) {
    // For other non-null objects (e.g., arrays, plain objects), use JSON for deep cloning.
    // This method has limitations (e.g., skips functions, undefined, circular refs).
    return JSON.parse(JSON.stringify(sourceEntity));
  } else {
    // Primitive types (numbers, strings, booleans, null, undefined) are copied by value.
    return sourceEntity;
  }
}

// Helper functions to fetch and convert the next line of input into specific data types.
function fetchInteger(){ return convertData(getNextItem(), 1); }
function fetchStringArray(){ return convertData(getNextItem(), 2); }
function fetchNumArray(){ return convertData(getNextItem(), 4); }
function fetchCharList(){ return convertData(getNextItem(), 6); }

// Retrieves the next available input item (line) from the global data store.
function getNextItem(){ return storedInputData.retrieveNext(); }
// Checks if there are more input items (lines) remaining to be processed.
function hasMoreItems(){ return storedInputData.checkAvailability(); }

/**
 * Creates and returns an object responsible for managing sequential access to input lines.
 * This acts as an iterator over the raw input array.
 * @param {string[]} inputLines An array where each string represents a single line of input.
 * @returns {object} An input reader instance with methods for checking availability and retrieving lines.
 */
function initializeInputReader(inputLines){
  const defaultStartIndex = 0; // Defines the initial position for reading input.
  return {
    contentArray : inputLines,
    currentPosition : defaultStartIndex, // Tracks the current reading index.
    totalLines : inputLines.length, // Stores the total number of input lines.

    // Method to check if there are more lines left to read.
    checkAvailability : function(){
      return (this.currentPosition < this.totalLines);
    },
    // Method to retrieve the next line of input and advance the reader's position.
    retrieveNext : function(){
      if(this.checkAvailability()){
        const nextLine = this.contentArray[this.currentPosition]; // Store the current line before advancing.
        this.currentPosition++; // Move to the next line for subsequent calls.
        return nextLine;
      } else {
        // Throw a specific error if an attempt is made to read beyond available input.
        throw new Error('InputOutOfBoundsException: Attempted to read past the end of available input data.');
      }
    }
  };
}

// Outputs the final calculated result to the standard output stream.
function displayResult(resultValue){
  console.log(resultValue);
}

// Logs detailed debug messages to the standard error stream.
// Uses Node.js's 'util.inspect' for better object representation.
function logDebugMessage(debugInfo){
  console.error(`[DEBUG_INFO]: ${require('util').inspect(debugInfo, {depth: null, colors: true})}`);
}

/**
 * Converts a given input string into a specified data format based on the conversion type.
 * Includes error handling and a guard clause for invalid input.
 * @param {string} inputString The string to be converted.
 * @param {number} conversionType An integer code indicating the desired conversion.
 *   1: Parse as integer.
 *   2: Split by space into a string array.
 *   4: Split by space and map to numbers.
 *   6: Split into an array of characters.
 * @returns {any} The converted data, or the original string if conversion fails or type is unknown.
 */
function convertData(inputString, conversionType){
  // Guard clause: If input is undefined or null, log a warning and return it as is.
  if (inputString === undefined || inputString === null) {
    logDebugMessage("Warning: Attempted data conversion on an undefined or null input string.");
    return inputString;
  }
  
  try{
    switch(conversionType){
      case 1: return parseInt(inputString, 10); // Explicitly use radix 10 for parseInt.
      case 6: return inputString.split(''); // Splits string into an array of individual characters.
      case 2: return inputString.split(' '); // Splits string by spaces into an array of substrings.
      case 4: return inputString.split(' ').map(Number); // Splits by space and converts each part to a number.
      // Cases 7, 8, 9, 0 from the original `myconv` are removed as they were not utilized
      // by the `next*` functions provided in this specific context, making them non-essential.
      default: return inputString; // If conversionType is not recognized, return the original string.
    }
  } catch(conversionError){
    // Log any errors that occur during the conversion process.
    logDebugMessage(`Error during data conversion for input: '${inputString}', type: ${conversionType}. Error: ${conversionError.message}`);
    return inputString; // Return the original string on error to prevent crashing.
  }
}

// --- End of Utility Functions and Input Handling ---

/**
 * Implements the core logic for the tree coloring problem.
 * This function calculates the number of ways to color a tree with `availableColors`
 * such that no two adjacent nodes share the same color.
 * The result is computed modulo 1000000007.
 */
function ProcessTreeColoring(){
  // Read the first line of input, containing N (number of nodes) and K (number of available colors).
  const initialParameters = fetchNumArray();
  const nodeCount = initialParameters[0];
  const availableColors = initialParameters[1];

  // Input validation: Ensure valid positive node and color counts.
  if (nodeCount <= 0 || availableColors <= 0) {
      logDebugMessage(`Invalid input parameters detected: nodeCount=${nodeCount}, availableColors=${availableColors}. Terminating calculation.`);
      displayResult(0); // If parameters are invalid, no valid coloring is possible.
      return;
  }

  // Initialize a registry for all nodes in the tree. Each node object stores relevant properties.
  const nodeRegistry = Array.from({ length: nodeCount }, (_, idx) => ({
    neighbors : [],      // An array to store indices of directly connected nodes (adjacency list).
    identifier : idx,    // A unique zero-based index for this node.
    coloringWays : 0,    // Stores the calculated number of ways to color this node.
    visitedFlag : false, // A boolean flag to track if the node has been processed during traversal.
    nodeDepth: -1        // Added an additional property, 'nodeDepth', for potential future use or complexity.
  }));

  // Read the N-1 edges that define the tree structure and populate neighbor lists.
  for(let edgeIdx = 0; edgeIdx < nodeCount - 1; edgeIdx++){
    const edgeDefinition = fetchNumArray();
    const firstNodeIndex = edgeDefinition[0] - 1; // Convert to 0-based indexing.
    const secondNodeIndex = edgeDefinition[1] - 1; // Convert to 0-based indexing.

    // Establish bidirectional connections between the nodes.
    nodeRegistry[firstNodeIndex].neighbors.push(secondNodeIndex);
    nodeRegistry[secondNodeIndex].neighbors.push(firstNodeIndex);
  }

  let finalProduct = 1; // Accumulator for the total product of coloring ways.
  const moduloValue = 1000000007; // The modulus to apply for calculations.

  // Begin the tree traversal from the root node (node at index 0).
  nodeRegistry[0].visitedFlag = true;
  nodeRegistry[0].nodeDepth = 0; // The root node is at depth 0.

  // Use a stack to perform an iterative Depth-First Search (DFS) like traversal.
  // Each element in the stack represents a task for a node:
  // [ancestorInfluence, currentColorOptions, currentNodeIdx, currentDepth]
  const processingStack = [[0, availableColors, 0, 0]]; // Initial task for the root node.

  // Continue processing nodes from the stack until it becomes empty.
  while(processingStack.length > 0){
    // Destructure the current task from the top of the stack.
    const [ancestorInfluence, currentColorOptions, currentNodeIdx, currentDepth] = processingStack.pop();

    // Assign the calculated number of distinct coloring ways to the current node.
    nodeRegistry[currentNodeIdx].coloringWays = currentColorOptions;

    // Determine the effective 'ancestor influence' on subsequent child nodes.
    // This value represents how many colors are "taken" by the parent and grandparent
    // (or just parent for the first child).
    const effectiveAncestorInfluence = (ancestorInfluence < 2) ? ancestorInfluence + 1 : ancestorInfluence;

    const connectedNodes = nodeRegistry[currentNodeIdx].neighbors;
    let childrenProcessedCount = 0; // Counter for children of the current node that have been processed.

    // Iterate through all neighbors of the current node.
    for(let neighborIdx = 0; neighborIdx < connectedNodes.length; neighborIdx++){
      const neighborNodeIndex = connectedNodes[neighborIdx];

      // If a neighbor has not yet been visited, it is considered a child in this traversal path.
      if(!nodeRegistry[neighborNodeIndex].visitedFlag){
        nodeRegistry[neighborNodeIndex].visitedFlag = true; // Mark the child as visited.
        nodeRegistry[neighborNodeIndex].nodeDepth = currentDepth + 1; // Set the child's depth.

        // Calculate the number of available colors for the child node.
        // This is `K` minus colors used by ancestors and already processed siblings.
        const childColorOptions = availableColors - childrenProcessedCount - effectiveAncestorInfluence;
        
        // Push the child node onto the stack for future processing.
        // The ancestor influence passed to the child is based on the current node's influence.
        processingStack.push([effectiveAncestorInfluence, childColorOptions, neighborNodeIndex, currentDepth + 1]);
        childrenProcessedCount++; // Increment the count of children processed for the current node.
      }
    }
  }

  // Calculate the final product of coloring ways for all nodes, applying the modulo.
  // The loop includes an early exit if the product becomes zero.
  for(let idx = 0; idx < nodeCount; idx++){
    const waysForCurrentNode = nodeRegistry[idx].coloringWays; // Use an intermediate variable for clarity.

    // Guard against impossible coloring scenarios (negative ways).
    if (waysForCurrentNode < 0) {
        logDebugMessage(`Warning: Node ${idx} has calculated negative coloring ways: ${waysForCurrentNode}. Setting final product to 0.`);
        finalProduct = 0;
        break; // No valid coloring is possible if any node has negative ways.
    }
    finalProduct = (finalProduct * waysForCurrentNode) % moduloValue;
    if(finalProduct === 0){ // Optimization: if product is 0, it will remain 0.
      break;
    }
  }

  // Output the final calculated total number of distinct coloring ways.
  displayResult(finalProduct);

  // The original `dfs` function, which was commented out and unused in the provided code,
  // has been completely removed from this Type III clone as a non-essential fragment.
}