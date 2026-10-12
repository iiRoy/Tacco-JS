const rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Acquire raw input data from the standard input stream.
const processedLines = rawData.trim().split('\n'); // Clean and segment the raw data into an array of distinct lines.

const COLOR_OPTIONS = ['r', 'g', 'b']; // Define the set of permissible color values for segments.

class SegmentChain {
  // Represents a sequence of colored segments, forming a chain.
  constructor(identifier, level) {
    this.identifier = identifier; // A unique string representing the current configuration of segments.
    this.level = level; // The depth or step count from the initial state in a search process.
    this.segmentColors = identifier.split(''); // An array of individual color characters derived from the identifier.
  }

  retrieveNextChainIdentifiers() {
    // Calculates all possible subsequent chain identifiers reachable from the current state.
    const subsequentChainIdentifiers = []; // Collection to store the identifiers of newly generated chains.

    // Iterate through adjacent pairs of segments in the chain.
    for (let idx = 0; idx < this.segmentColors.length - 1; idx++) {
      const currentSegmentColor = this.segmentColors[idx]; // The color of the segment at the current index.
      const adjacentSegmentColor = this.segmentColors[idx + 1]; // The color of the segment immediately following.

      // If the two adjacent segments are of the same color, no transformation is possible for this pair.
      if (currentSegmentColor === adjacentSegmentColor) {
        continue; // Proceed to the next pair of segments.
      }

      // Determine the third color that is distinct from both current and adjacent segment colors.
      const modifiedSegmentColor = COLOR_OPTIONS.filter(c => c !== currentSegmentColor && c !== adjacentSegmentColor)[0];

      const alteredSegmentColors = this.segmentColors.slice(); // Create a shallow copy of the segment colors array to modify.
      // Replace the two adjacent segments with two segments of the newly determined modified color.
      alteredSegmentColors.splice(idx, 2, modifiedSegmentColor, modifiedSegmentColor);

      subsequentChainIdentifiers.push(alteredSegmentColors.join('')); // Add the new chain identifier (as a string) to the collection.
    }
    return subsequentChainIdentifiers; // Return the array of all generated next chain identifiers.
  }
}

class ChainNetwork {
  // Manages a network of SegmentChain nodes, facilitating graph traversal.
  constructor() {
    this.nodeRegistry = new Map(); // A map to store SegmentChain instances, keyed by their string identifiers.
    this.processingQueue = []; // A queue used for Breadth-First Search (BFS) traversal.
  }

  containsIdentifier(identifier) {
    // Verifies if a given chain identifier already exists within the network's registry.
    return this.nodeRegistry.has(identifier);
  }

  fetchNode(identifier) {
    // Retrieves a SegmentChain object from the registry using its identifier.
    return this.nodeRegistry.get(identifier);
  }

  registerNode(identifier, level) {
    // Adds a new SegmentChain node to the network's registry with its associated level.
    this.nodeRegistry.set(identifier, new SegmentChain(identifier, level));
  }

  breadthFirstSearch(initialChainIdentifier) {
    // Executes a Breadth-First Search starting from a specified initial chain identifier.
    this.registerNode(initialChainIdentifier, 0); // Register the starting node at level zero.
    this.processingQueue.push(initialChainIdentifier); // Enqueue the initial identifier to begin the search.

    // Continue the search as long as there are identifiers in the processing queue.
    while (this.processingQueue.length > 0) {
      const currentChainIdentifier = this.processingQueue.shift(); // Dequeue the next identifier to process.
      const currentNode = this.fetchNode(currentChainIdentifier); // Retrieve the corresponding SegmentChain object.

      const neighborChainIdentifiers = currentNode.retrieveNextChainIdentifiers(); // Generate all possible next identifiers from the current node.

      // If no further transformations are possible from this node, it represents a terminal state.
      if (neighborChainIdentifiers.length === 0) {
        return currentNode; // Return this terminal node.
      }

      // For each generated neighbor identifier:
      neighborChainIdentifiers.forEach(nextIdentifier => {
        // If this neighbor identifier has already been visited and registered, skip it.
        if (this.containsIdentifier(nextIdentifier)) {
          return;
        }
        // Register the new, unvisited node with an incremented level.
        this.registerNode(nextIdentifier, currentNode.level + 1);
        this.processingQueue.push(nextIdentifier); // Enqueue the new identifier for future processing.
      });
    }
    // If the queue empties and no terminal node was found, the function implicitly returns undefined.
  }

  displayNodes() {
    // This method is part of the original class structure but is not invoked in the main logic.
    // It attempts to iterate through the node registry using integer keys, which may not align with string identifiers.
    for (let index = 1; index <= this.nodeRegistry.size; index++) {
      const currentNetworkNode = this.nodeRegistry.get(index); // Attempt to retrieve a node using an integer key.
      // If currentNetworkNode is undefined (likely for string-keyed maps), calling toString() will result in a TypeError.
      console.log(currentNetworkNode.toString()); // Output the string representation of the retrieved node.
    }
  }
}

// Iterate over each line of processed input data.
processedLines.forEach(currentInputIdentifier => {
  // Check for a sentinel value '0' which indicates the end of meaningful input.
  if (currentInputIdentifier === '0') {
    return; // Stop processing further inputs if the sentinel is encountered.
  }

  const networkInstance = new ChainNetwork(); // Instantiate a new chain network for each input.
  // Execute a Breadth-First Search to find the shortest path to a terminal chain configuration.
  const resultNode = networkInstance.breadthFirstSearch(currentInputIdentifier);

  // Output the level (depth) of the found terminal node, or 'NA' if no such node was reached.
  console.log(resultNode ? resultNode.level : 'NA');
});
