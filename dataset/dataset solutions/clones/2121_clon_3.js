var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

var dataStore; // Stores processed input lines and provides iteration methods
var rawInputLines = []; // Raw lines read from stdin

// Event listener for each line of input
inputReader.on('line', function(lineContent){
  rawInputLines.push(lineContent);
});

// Event listener when input stream closes
inputReader.on('close', function(){
  dataStore = initializeInputProcessor(rawInputLines);
  console.error('\n↑ Input processed ↓ Output follows'); // Debug message for user
  executeProblemSolver(); // Start the main application logic
});

/**
 * Creates a deep copy of a value. Handles Sets and general JSON-serializable objects.
 * @param {any} value - The value to copy.
 * @returns {any} A deep copy of the value.
 */
function deepCopyValue(value){
  if (value instanceof Set) {
    return new Set(Array.from(value));
  }
  // For other types, especially plain objects and arrays, use JSON serialization/deserialization.
  // This is a common, albeit sometimes inefficient, way to deep clone simple structures.
  return JSON.parse(JSON.stringify(value));
}

/** Retrieves the next integer from the input stream. */
function retrieveInteger(){
  return transformData(fetchNextItem(), 1); // Type 1 for integer parsing
}

/** Retrieves the next line as an array of strings (space-separated). */
function retrieveStringArray(){
  return transformData(fetchNextItem(), 2); // Type 2 for space-separated strings
}

/** Retrieves the next line as an array of integers (space-separated). */
function retrieveIntegerArray(){
  return transformData(fetchNextItem(), 4); // Type 4 for space-separated integers
}

/** Retrieves the next line as an array of characters. */
function retrieveCharacterArray(){
  return transformData(fetchNextItem(), 6); // Type 6 for character array
}

/** Fetches the next available item (line) from the input data store. */
function fetchNextItem(){
  return dataStore.getNextEntry();
}

/** Checks if there are more items (lines) to fetch from the input data store. */
function canFetchMore(){
  return dataStore.hasMoreEntries();
}

/**
 * Initializes an object to process input lines sequentially.
 * @param {string[]} sourceInput - An array of input lines.
 * @returns {object} An input processor object.
 */
function initializeInputProcessor(sourceInput){  
  return {
    sourceLines : sourceInput, // The array of all input lines
    currentPosition : 0,       // Current index for reading
    totalLines : sourceInput.length, // Total number of lines available

    /** Checks if there are more lines to read. */
    hasMoreEntries : function(){
      return (this.currentPosition < this.totalLines);
    },

    /** Retrieves the next line and advances the position. */
    getNextEntry : function(){
      if(this.hasMoreEntries()){
        return this.sourceLines[this.currentPosition++];
      } else {
        // Custom error message for out-of-bounds access
        throw new Error('InputBufferEmptyException: No further input lines are available.');
      }
    }
  };
}

/**
 * Prints a result to the standard output.
 * @param {any} content - The content to be displayed.
 */
function displayResult(content){
  console.log(content);
}

/**
 * Logs a debug message to standard error, inspecting complex objects.
 * @param {any} debugContent - The content to debug.
 */
function logDebugMessage(debugContent){
  const util = require('util'); // Dynamically require util for inspection
  console.error('DEBUG_INFO: ' + util.inspect(debugContent, { showHidden: false, depth: null, colors: true }));
}

/**
 * Utility function to convert input content based on a specified type.
 * @param {string|string[]} inputContent - The input string or array to convert.
 * @param {number} conversionType - An integer indicating the conversion method.
 *   1: Parse as integer.
 *   2: Split string by space into an array of strings.
 *   4: Split string by space into an array of integers.
 *   6: Split string into an array of characters.
 *   8: Join array elements with spaces.
 *   9: Join array elements with newlines.
 *   0: Join array elements without any separator.
 * @returns {any} The converted value.
 */
function transformData(inputContent, conversionType){
  try{
    switch(conversionType){
      case 1: return parseInt(inputContent, 10); // Base 10 integer conversion
      case 2: return inputContent.split(' ');
      case 4: return inputContent.split(' ').map(Number); // Converts to numbers
      case 6: return inputContent.split('');
      case 8: return inputContent.join(' ');
      case 9: return inputContent.join('\n');
      case 0: return inputContent.join('');
      default: return inputContent; // Return as-is if type is unknown
    }
  } catch(processingError){
    logDebugMessage(`Conversion error for type ${conversionType}: ${processingError.message}`);
    return inputContent; // Fallback to original content on error
  }
}

// Main application logic begins here
function executeProblemSolver(){
  // Read initial configuration parameters: N (nodes), M (connections), K (blocks)
  let initialParameters = retrieveIntegerArray();
  const nodeCount = initialParameters[0];
  const connectionCount = initialParameters[1];
  const blockCount = initialParameters[2];

  // Initialize a Disjoint Set Union (DSU) data structure for N nodes
  const disjointSetStructure = createDisjointSet(nodeCount);

  // Store adjacency information for each node
  // Using a Map for explicit key-value pairs, though an array indexed by nodeCount is also fine.
  const nodeRelationships = new Map();

  // Populate nodeRelationships with initial empty sets for connections and blocks
  for(let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++){
    nodeRelationships.set(nodeIndex, {
      connectedPartners : new Set(), // Direct friends/connected nodes
      blockedPartners : new Set()    // Nodes that are explicitly blocked
    });
  }

  // Process M connection declarations
  for(let connIndex = 0; connIndex < connectionCount; connIndex++){
    let currentConnectionPair = retrieveIntegerArray();
    // Adjust to 0-based indexing
    const firstConnectedNode = currentConnectionPair[0] - 1;
    const secondConnectedNode = currentConnectionPair[1] - 1;

    // Perform union operation in DSU
    disjointSetStructure.uniteSets(firstConnectedNode, secondConnectedNode);
    
    // Record direct connections in the relationship map
    nodeRelationships.get(firstConnectedNode).connectedPartners.add(secondConnectedNode);
    nodeRelationships.get(secondConnectedNode).connectedPartners.add(firstConnectedNode);
  }

  // Process K block declarations
  for(let blockIndex = 0; blockIndex < blockCount; blockIndex++){
    let currentBlockPair = retrieveIntegerArray();
    // Adjust to 0-based indexing
    const firstBlockedNode = currentBlockPair[0] - 1;
    const secondBlockedNode = currentBlockPair[1] - 1;
    
    // Record explicit blocks in the relationship map
    nodeRelationships.get(firstBlockedNode).blockedPartners.add(secondBlockedNode);
    nodeRelationships.get(secondBlockedNode).blockedPartners.add(firstBlockedNode);
  }

  // Calculate the final result for each node
  const resultArray = new Array(nodeCount).fill(0);

  for(let currentNodeIdx = 0; currentNodeIdx < nodeCount; currentNodeIdx++){
    // Get the total size of the component this node belongs to
    let currentComponentSize = disjointSetStructure.getSetSize(currentNodeIdx);
    
    // Get the number of nodes directly connected to this node
    let directFriendsCount = nodeRelationships.get(currentNodeIdx).connectedPartners.size;
    
    // Initial calculation: component size - direct friends - self (which is 1)
    // This gives the number of potential "block-free" friends within the same component
    let initialFriendCandidates = currentComponentSize - directFriendsCount - 1;

    // Retrieve the set of nodes explicitly blocked by the current node
    const potentiallyBlockedNodes = Array.from(nodeRelationships.get(currentNodeIdx).blockedPartners);

    // Iterate through potentially blocked nodes to check if they are in the same component
    // If a blocked node is in the same component, it reduces the count of "block-free" friends
    for(let blockIter = 0; blockIter < potentiallyBlockedNodes.length; blockIter++){
      const blockedNeighbor = potentiallyBlockedNodes[blockIter];
      // Check if the current node and the blocked neighbor are in the same connected component
      if(disjointSetStructure.areConnected(currentNodeIdx, blockedNeighbor)){
        initialFriendCandidates--; // Decrement if a blocked node is in the same component
      }
    }
    resultArray[currentNodeIdx] = initialFriendCandidates;
  }

  // Output the final results, joined by spaces
  displayResult(transformData(resultArray, 8));
}

/**
 * Creates a Disjoint Set Union (DSU) data structure.
 * @param {number} totalElements - The number of elements in the set (0 to totalElements-1).
 * @returns {object} A DSU object with methods for union, find, and size.
 */
function createDisjointSet(totalElements){
  const ds = {
    // An array representing the parent of each element.
    // If parentOrSize[i] < 0, then i is a root, and its absolute value is the size of the set.
    // Otherwise, parentOrSize[i] is the parent of i.
    parentOrSize : new Array(totalElements).fill(-1),
    
    /**
     * Checks if two elements belong to the same set.
     * @param {number} elementA - The index of the first element.
     * @param {number} elementB - The index of the second element.
     * @returns {boolean} True if elements are in the same set, false otherwise.
     */
    areConnected : function(elementA, elementB){
      return this.findRepresentative(elementA) === this.findRepresentative(elementB);
    },

    /**
     * Finds the representative (root) of the set containing the given element.
     * Performs path compression for optimization.
     * @param {number} elementIndex - The index of the element.
     * @returns {number} The index of the set's representative.
     */
    findRepresentative : function(elementIndex){
      // If elementIndex is a root (value is negative), return itself.
      if(this.parentOrSize[elementIndex] < 0){
        return elementIndex;
      } else {
        // Recursively find the root and compress the path by setting the element's parent directly to the root.
        this.parentOrSize[elementIndex] = this.findRepresentative(this.parentOrSize[elementIndex]);
        return this.parentOrSize[elementIndex];
      }
    },

    /**
     * Unites the sets containing two given elements. Uses union by size heuristic.
     * The smaller tree's root points to the larger tree's root.
     * @param {number} elementA - The first element.
     * @param {number} elementB - The second element.
     */
    uniteSets : function(elementA, elementB){
      let repA = this.findRepresentative(elementA); // Representative of elementA's set
      let repB = this.findRepresentative(elementB); // Representative of elementB's set

      // If they are already in the same set, do nothing.
      if(repA === repB){
        return;
      }

      // Union by size: Attach the smaller tree to the root of the larger tree.
      // Sizes are stored as negative values, so compare absolute values.
      if(Math.abs(this.parentOrSize[repA]) >= Math.abs(this.parentOrSize[repB])){
        // repA's set is larger or equal in size. repB's root points to repA.
        this.parentOrSize[repA] += this.parentOrSize[repB]; // Update size of repA's set
        this.parentOrSize[repB] = repA;                     // Make repA the parent of repB
      } else {
        // repB's set is larger. repA's root points to repB.
        this.parentOrSize[repB] += this.parentOrSize[repA]; // Update size of repB's set
        this.parentOrSize[repA] = repB;                     // Make repB the parent of repA
      }
    },

    /**
     * Returns the size of the set containing the given element.
     * @param {number} elementIndex - The index of the element.
     * @returns {number} The size of the set.
     */
    getSetSize : function(elementIndex){
      // The size is stored as the negative value at the root of the set.
      return -this.parentOrSize[this.findRepresentative(elementIndex)];
    }
  };
  return ds;
}