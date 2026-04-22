// Input utility setup - hidden from main logic
const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let inputDataStream; // Holds the processed input lines
const receivedLines = []; // Buffer for raw input lines

// Event listener for each line read from standard input
inputReader.on('line', (currentLine) => {
  receivedLines.push(currentLine);
});

// Event listener for when input stream closes
inputReader.on('close', () => {
  inputDataStream = initializeInputProcessor(receivedLines);
  console.error('\n--- Input processing complete. Starting main execution. ---');
  mainExecutionRoutine(); // Call the primary function
});

// Utility to create a deep copy of an object or set
function deepCopyStructure(sourceObject) {
  // If it's a Set, create a new Set from its elements
  if (sourceObject instanceof Set) {
    return new Set(Array.from(sourceObject));
  }
  // Otherwise, use JSON serialization for a generic deep copy
  // Note: This method has limitations (e.g., functions, Dates, undefined are not copied)
  return JSON.parse(JSON.stringify(sourceObject));
}

// Input token conversion and parsing helper
// 'token' is the raw string from input
// 'conversionType' determines how to process the token
function convertAndParseToken(token, conversionType) {
  try {
    switch (conversionType) {
      case 1: // Convert to integer
        return parseInt(token, 10);
      case 2: // Split string by space into an array of strings
        return token.split(' ');
      case 4: // Split string by space and convert each part to a number
        return token.split(' ').map(Number);
      case 6: // Split string into an array of characters
        return token.split('');
      case 7: // Split string into characters and convert each to a number
        return token.split('').map(Number);
      case 8: // Join an array of items with spaces
        // Ensure 'token' is an array before joining
        if (!Array.isArray(token)) {
            console.warn("Attempted to join a non-array with spaces:", token);
            return String(token); // Fallback
        }
        return token.join(' ');
      case 9: // Join an array of items with newlines
        if (!Array.isArray(token)) {
            console.warn("Attempted to join a non-array with newlines:", token);
            return String(token); // Fallback
        }
        return token.join('\n');
      case 0: // Join an array of items without any separator
        if (!Array.isArray(token)) {
            console.warn("Attempted to join a non-array without separator:", token);
            return String(token); // Fallback
        }
        return token.join('');
      default: // No specific conversion, return original token
        return token;
    }
  } catch (error) {
    console.error(`Error during token conversion (type ${conversionType}): ${error.message}`);
    return token; // Return original on error
  }
}

// Convenience functions for reading specific data types from the input stream
function readInteger() { return convertAndParseToken(fetchNextInputItem(), 1); }
function readStringArray() { return convertAndParseToken(fetchNextInputItem(), 2); }
function readIntegerArray() { return convertAndParseToken(fetchNextInputItem(), 4); }
function readCharacterArray() { return convertAndParseToken(fetchNextInputItem(), 6); }
function fetchNextInputItem() { return inputDataStream.retrieveNext(); }
function hasMoreInputItems() { return inputDataStream.checkAvailability(); }

// Initializes an object to manage reading from an array of input lines
function initializeInputProcessor(inputLines) {
  // Guard clause: ensure inputLines is an array
  if (!Array.isArray(inputLines)) {
    console.error("Input lines must be an array.");
    return {
      sourceLines: [], currentPosition: 0, totalLines: 0,
      checkAvailability: () => false, retrieveNext: () => { throw new Error('No input available.'); }
    };
  }

  return {
    sourceLines: inputLines,          // The array containing all input lines
    currentPosition: 0,               // Current index for reading
    totalLines: inputLines.length,    // Total number of lines
    
    // Checks if there are more lines to read
    checkAvailability: function() {
      return this.currentPosition < this.totalLines;
    },
    
    // Retrieves the next line from the input and advances the position
    retrieveNext: function() {
      if (this.checkAvailability()) {
        const nextItem = this.sourceLines[this.currentPosition];
        this.currentPosition++; // Increment position after retrieval
        return nextItem;
      } else {
        // More descriptive error for out-of-bounds access
        throw new Error('Input stream exhausted. No more lines to read.');
      }
    }
  };
}

// Output utility: prints result to standard output
function printResult(dataToOutput) { console.log(dataToOutput); }

// Debugging utility: prints detailed object info to standard error
function logDebugInfo(debugPayload) {
  console.error('DEBUG INFO: ' + require('util').inspect(debugPayload, false, null));
}

// --- End of boilerplate/utility functions ---

// Constant for adjusting 1-based indices to 0-based
const INDEX_ADJUSTMENT = 1; 

// Helper to decrement indices in an array
function adjustIndicesToOneBased(arr) {
    // Create a new array to avoid modifying the original if it's reused
    return arr.map(val => val - INDEX_ADJUSTMENT);
}

/**
 * Main execution routine for the problem.
 * This function orchestrates reading input, performing calculations, and printing the result.
 */
function mainExecutionRoutine() {
  // Read the initial parameters: N, K, L
  // N: total number of entities
  // K: number of connections for the first type (roads)
  // L: number of connections for the second type (railways)
  const mainParameters = readIntegerArray();
  
  const numEntities = mainParameters[0];
  const numRoadConnections = mainParameters[1];
  const numRailwayConnections = mainParameters[2];

  // Initialize two Disjoint Set Union (DSU) structures
  // One for road connections and one for railway connections
  const roadConnectivityDSU = createDisjointSetStructure(numEntities);
  const railwayConnectivityDSU = createDisjointSetStructure(numEntities);

  // Array to store the final counts for each entity
  // Initialized with 1 for each entity (representing itself)
  const entityConnectionCounts = new Array(numEntities).fill(1);

  // Store connection pairs for later processing
  const roadConnectionPairs = [];
  const railwayConnectionPairs = [];

  // Process road connections (K connections)
  // Each connection is a pair of 1-indexed entity IDs
  for (let kIndex = 0; kIndex < numRoadConnections; kIndex++) {
    let currentRoadPair = readIntegerArray();
    // Sort the pair to ensure consistent order (e.g., [1, 5] instead of [5, 1])
    // This is not strictly necessary for DSU but can help with debugging/consistency
    currentRoadPair.sort((a, b) => a - b);
    
    // Adjust to 0-indexed values for array access
    currentRoadPair = adjustIndicesToOneBased(currentRoadPair);
    
    // Store the processed pair
    roadConnectionPairs.push(currentRoadPair);
    
    // Unite the two entities in the road DSU structure
    roadConnectivityDSU.uniteSets(currentRoadPair[0], currentRoadPair[1]);
  }

  // Process railway connections (L connections)
  // Each connection is a pair of 1-indexed entity IDs
  for (let lIndex = 0; lIndex < numRailwayConnections; lIndex++) {
    let currentRailwayPair = readIntegerArray();
    // Sort for consistency
    currentRailwayPair.sort((a, b) => a - b);
    
    // Adjust to 0-indexed values
    currentRailwayPair = adjustIndicesToOneBased(currentRailwayPair);
    
    // Store the processed pair
    railwayConnectionPairs.push(currentRailwayPair);
    
    // Unite the two entities in the railway DSU structure
    railwayConnectivityDSU.uniteSets(currentRailwayPair[0], currentRailwayPair[1]);
  }

  // Set to keep track of road connection pairs that have been processed
  // This helps avoid double counting when a pair is present in both road and railway lists
  const processedRoadPairsKeySet = new Set();

  // First pass: Process road connections
  for (let kPair of roadConnectionPairs) {
    const nodeA = kPair[0];
    const nodeB = kPair[1];

    // Check if nodeA and nodeB are connected by a railway
    if (railwayConnectivityDSU.areConnected(nodeA, nodeB)) {
      // If they are connected by railway, increment the count for both nodes
      // This logic assumes we're counting how many *other* connections
      // exist between nodes that are already connected by a railway.
      // The original code adds to both nodes.
      entityConnectionCounts[nodeA]++;
      entityConnectionCounts[nodeB]++;
    }
    
    // Add the road pair to the tracker (as a string key for uniqueness)
    processedRoadPairsKeySet.add(`${nodeA}:${nodeB}`);
  }

  // Second pass: Process railway connections
  for (let lPair of railwayConnectionPairs) {
    const nodeA = lPair[0];
    const nodeB = lPair[1];
    
    // Create a unique key for the current pair
    const pairKey = `${nodeA}:${nodeB}`;

    // Skip if this pair was already processed as a road connection
    if (processedRoadPairsKeySet.has(pairKey)) {
      continue;
    }

    // Check if nodeA and nodeB are connected by a road
    if (roadConnectivityDSU.areConnected(nodeA, nodeB)) {
      // If they are connected by road, increment the count for both nodes
      entityConnectionCounts[nodeA]++;
      entityConnectionCounts[nodeB]++;
    }
  }
  
  // Convert the final array of counts to a space-separated string and print it
  printResult(convertAndParseToken(entityConnectionCounts, 8));
}

/**
 * Creates and returns a Disjoint Set Union (DSU) data structure.
 * Also known as Union-Find.
 *
 * @param {number} numberOfElements - The total number of elements in the set.
 * @returns {object} An object containing DSU operations.
 */
function createDisjointSetStructure(numberOfElements) {
  // The internal array representing the DSU structure.
  // Each element stores either:
  // - A negative value: indicates it's a root, and its absolute value is the size of the set.
  // - A non-negative value: indicates it's a child, and the value is the index of its parent.
  const parentOrSizeStore = new Array(numberOfElements).fill(-1); // Initially, each element is its own root, with size 1.

  const dsuOperations = {
    // Array holding parent pointers or set sizes
    internalStructure: parentOrSizeStore,

    /**
     * Finds the representative (root) of the set containing the given element.
     * Uses path compression for optimization.
     *
     * @param {number} elementIndex - The 0-indexed element whose root is to be found.
     * @returns {number} The index of the representative (root) of the element's set.
     */
    findRepresentative: function(elementIndex) {
      // If the element is a root (value is negative), return its index
      if (this.internalStructure[elementIndex] < 0) {
        return elementIndex;
      } else {
        // Otherwise, recursively find the root and perform path compression
        // by setting the element's parent directly to the root.
        this.internalStructure[elementIndex] = this.findRepresentative(this.internalStructure[elementIndex]);
        return this.internalStructure[elementIndex];
      }
    },

    /**
     * Checks if two elements belong to the same set.
     *
     * @param {number} firstElement - The index of the first element.
     * @param {number} secondElement - The index of the second element.
     * @returns {boolean} True if both elements have the same representative, false otherwise.
     */
    areConnected: function(firstElement, secondElement) {
      return this.findRepresentative(firstElement) === this.findRepresentative(secondElement);
    },

    /**
     * Unites the sets containing two given elements.
     * Uses union by size heuristic for optimization.
     *
     * @param {number} elementA - The index of the first element.
     * @param {number} elementB - The index of the second element.
     */
    uniteSets: function(elementA, elementB) {
      let rootA = this.findRepresentative(elementA);
      let rootB = this.findRepresentative(elementB);

      // Only perform union if the elements are in different sets
      if (rootA !== rootB) {
        // Union by size: attach the smaller tree under the root of the larger tree.
        // The sizes are stored as negative values, so a smaller negative value means a larger absolute size.
        if (this.internalStructure[rootA] <= this.internalStructure[rootB]) {
          // rootA's tree is larger or equal in size, so rootB becomes a child of rootA
          this.internalStructure[rootA] += this.internalStructure[rootB]; // Update size of rootA's set
          this.internalStructure[rootB] = rootA; // Set rootA as parent of rootB
        } else {
          // rootB's tree is larger, so rootA becomes a child of rootB
          this.internalStructure[rootB] += this.internalStructure[rootA]; // Update size of rootB's set
          this.internalStructure[rootA] = rootB; // Set rootB as parent of rootA
        }
      }
    },

    /**
     * Gets the size of the set containing the given element.
     *
     * @param {number} elementIndex - The 0-indexed element whose set size is to be retrieved.
     * @returns {number} The number of elements in the set.
     */
    getSetSize: function(elementIndex) {
      // The size is the absolute value of the root's stored value
      return -this.internalStructure[this.findRepresentative(elementIndex)];
    }
  };

  return dsuOperations;
}