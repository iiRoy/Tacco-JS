var inputProcessor = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var dataStream;
var rawInputLines = [];

// Event listener for each line of input received
inputProcessor.on('line', function(singleLine){
  rawInputLines.push(singleLine); // Store the line
});

// Event listener for when input stream closes
inputProcessor.on('close', function(){
  dataStream = initializeInputReader(rawInputLines); // Prepare input for consumption
  console.error('\n⬆️ Input Data ⬇️ Output Results'); // Debug separator
  processConnectivityQueries(); // Execute the main logic
});

// Utility to convert input based on a specified type
// Conversion types:
// 1: Parse integer
// 2: Split by spaces into string array
// 4: Split by spaces and convert to number array
// 6: Split into character array
// 7: Split into character array and convert to number array
// 8: Join array elements with spaces
// 9: Join array elements with newlines
// 0: Join array elements without separator
// Default: Return as-is
function transformInput(valueToProcess, conversionType){
  try {
    switch(conversionType){
      case 1: return Number(valueToProcess); // Convert to integer
      case 2: return valueToProcess.split(/\s+/); // Split by one or more spaces
      case 4: return valueToProcess.split(/\s+/).map(Number); // Split and map to numbers
      case 6: return valueToProcess.split(''); // Split into individual characters
      case 7: return valueToProcess.split('').map(Number); // Split and map characters to numbers
      case 8: return valueToProcess.join(' '); // Join array with spaces
      case 9: return valueToProcess.join('\n'); // Join array with newlines
      case 0: return valueToProcess.join(''); // Join array without separator
      default: return valueToProcess; // No conversion, return original value
    }
  } catch(err) {
    // Log error but return original value to prevent crashing
    console.error('Error during input transformation:', err);
    return valueToProcess;
  }
}

// Function to create an object for sequential input reading
function initializeInputReader(sourceLines){  
  return {
    sourceLines : sourceLines,      // Array of all input lines
    currentPosition : 0,            // Current index for reading
    totalLines : sourceLines.length, // Total number of lines available

    // Checks if there are more lines to read
    hasMoreInput : function(){
      return (this.currentPosition < this.totalLines);
    },

    // Retrieves the next line of input
    getNextLine : function(){
      if(this.hasMoreInput()){
        return this.sourceLines[this.currentPosition++];
      } else {
        // Throw an error if no more input is available
        throw new Error('End of input stream reached. No more lines to read.');
      }
    },

    // Convenience methods for specific input types
    getNextInt : function(){ return transformInput(this.getNextLine(), 1); },
    getNextStrArray : function(){ return transformInput(this.getNextLine(), 2); },
    getNextIntArray : function(){ return transformInput(this.getNextLine(), 4); },
    getNextCharArray : function(){ return transformInput(this.getNextLine(), 6); }
  };
}

// Outputs a result to the standard output
function outputResult(data){
  console.log(data);
}

// Logs debug information to standard error
function debugLog(message){
  console.error('DEBUG: ' + require('util').inspect(message, false, null));
}

// Helper to preprocess a pair of indices
function prepareIndices(pairArray) {
  if (!Array.isArray(pairArray) || pairArray.length < 2) {
    throw new Error("Invalid pair array provided.");
  }
  const sortedPair = [...pairArray].sort((a, b) => a - b); // Ensure sorted order
  return [sortedPair[0] - 1, sortedPair[1] - 1]; // Convert to 0-indexed
}

// Main function to process the connectivity queries
function processConnectivityQueries(){
  // Read initial parameters: N (elements), K (K-relations), L (L-relations)
  const initialParams = dataStream.getNextIntArray();
  if (initialParams.length < 3) {
    console.error("Insufficient initial parameters provided.");
    return;
  }
  const numElements = initialParams[0];
  const numKRelations = initialParams[1];
  const numLRelations = initialParams[2];

  // Initialize two Disjoint Set Union structures
  // One for 'K' type connections, one for 'L' type connections
  const connectionManagerK = createDisjointSetUnion(numElements);
  const connectionManagerL = createDisjointSetUnion(numElements);

  // Array to store the final counts for each element
  const finalCounts = Array.from({ length: numElements });

  // Process K-type connections
  for(let kIdx = 0; kIdx < numKRelations; kIdx++){
    const currentPairData = dataStream.getNextIntArray();
    const [nodeA, nodeB] = prepareIndices(currentPairData);
    connectionManagerK.uniteSets(nodeA, nodeB);
  }

  // Process L-type connections
  for(let lIdx = 0; lIdx < numLRelations; lIdx++){
    const currentPairData = dataStream.getNextIntArray();
    const [nodeA, nodeB] = prepareIndices(currentPairData);
    connectionManagerL.uniteSets(nodeA, nodeB);
  }

  // Map to store counts of combined root pairs
  // Using a Map object for better performance and key flexibility
  const groupCountMap = new Map();

  // Iterate through all elements to determine their combined root keys
  for(let elementIdx = 0; elementIdx < numElements; elementIdx++){
    const rootK = connectionManagerK.findRoot(elementIdx);
    const rootL = connectionManagerL.findRoot(elementIdx);
    const combinedRootKey = `${rootL}:${rootK}`; // Create a unique key for the pair of roots

    // Increment count for this combined root key, initializing if necessary
    groupCountMap.set(combinedRootKey, (groupCountMap.get(combinedRootKey) || 0) + 1);
  }

  // Populate the finalCounts array using the aggregated counts
  for(let elementIdx = 0; elementIdx < numElements; elementIdx++){
    const rootK = connectionManagerK.findRoot(elementIdx);
    const rootL = connectionManagerL.findRoot(elementIdx);
    const combinedRootKey = `${rootL}:${rootK}`;
    finalCounts[elementIdx] = groupCountMap.get(combinedRootKey);
  }
  
  // Output the final counts, joined by spaces
  outputResult(transformInput(finalCounts, 8));
}

// Disjoint Set Union (DSU) data structure implementation
function createDisjointSetUnion(initialSize){
  // Internal array: `parentOrSize[i]` stores either:
  // - The parent of element `i` (if positive)
  // - The negative size of the set if `i` is a root (e.g., -5 means a set of size 5)
  const parentOrSize = Array.from({ length: initialSize }, () => -1); // Initialize each element as its own root (size 1)

  const dsuInstance = {
    // Determines the representative (root) of the set containing `targetIndex`
    // Performs path compression during traversal for efficiency
    findRoot : function(targetIndex){
      if (targetIndex < 0 || targetIndex >= initialSize) {
        throw new Error(`Index ${targetIndex} out of bounds [0, ${initialSize - 1}]`);
      }
      if(parentOrSize[targetIndex] < 0){
        return targetIndex; // `targetIndex` is a root
      } else {
        // Recursively find the root and compress the path
        parentOrSize[targetIndex] = this.findRoot(parentOrSize[targetIndex]);
        return parentOrSize[targetIndex];
      }
    },

    // Checks if two elements belong to the same set
    areConnected : function(elementA, elementB){
      return this.findRoot(elementA) === this.findRoot(elementB);
    },

    // Merges the sets containing `elementA` and `elementB`
    // Uses union by size heuristic to maintain tree balance
    uniteSets : function(elementA, elementB){
      let rootA = this.findRoot(elementA);
      let rootB = this.findRoot(elementB);

      // If they are already in the same set, do nothing
      if(rootA === rootB){
        return;
      }

      // Union by size: attach the smaller tree to the root of the larger tree
      // `parentOrSize[root]` stores negative size, so larger absolute value means larger set
      if(parentOrSize[rootA] <= parentOrSize[rootB]){ // rootA's set is larger or equal
        parentOrSize[rootA] += parentOrSize[rootB]; // Add size of rootB's set to rootA's set
        parentOrSize[rootB] = rootA; // Make rootA the parent of rootB
      } else { // rootB's set is larger
        parentOrSize[rootB] += parentOrSize[rootA]; // Add size of rootA's set to rootB's set
        parentOrSize[rootA] = rootB; // Make rootB the parent of rootA
      }
    },

    // Returns the size of the set containing `targetIndex`
    getSetSize : function(targetIndex){
      const rootOfElement = this.findRoot(targetIndex);
      return -parentOrSize[rootOfElement]; // Size is stored as a negative value at the root
    }
  };
  return dsuInstance;
}