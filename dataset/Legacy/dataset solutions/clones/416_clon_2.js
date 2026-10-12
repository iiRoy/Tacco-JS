const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = rawData.trim().split('\n');

// Define the set of allowed segment colors.
const COLOR_SET = ['r','g','b'];

/**
 * Represents a chain of segments, each having a specific color.
 * This class helps in tracking the chain's state and its "depth" in a transformation process.
 */
class SegmentChain {
  /**
   * Constructs a new SegmentChain instance.
   * @param {string} identifier - A string representing the sequence of colors (e.g., "rgb").
   * @param {number} level - The transformation level or depth at which this chain was created.
   */
  constructor(identifier, level) {
    this.identifier = identifier; // Unique string ID for the chain
    this.level = level;           // Transformation depth
    this.segmentColors = identifier.split(''); // Array of individual segment colors
  }

  /**
   * Generates a list of possible next chain identifiers by applying a specific transformation rule.
   * The rule involves finding two adjacent segments of different colors and replacing them
   * with two segments of the third color.
   * @returns {string[]} An array of string identifiers for the next possible SegmentChains.
   */
  generateNextChainIdentifiers() {
    const subsequentChainIdentifiers = []; // Stores the IDs of newly generated chains

    // Iterate through adjacent pairs of segments
    for (let idx = 0; idx < this.segmentColors.length - 1; idx++) {
      const [ firstColor, secondColor ] = this.segmentColors.slice(idx, idx + 2);

      // If adjacent segments are the same color, no transformation is possible for this pair.
      if (firstColor === secondColor) {
        continue;
      }

      // Determine the third color that is different from the current pair.
      const replacementColor = COLOR_SET.filter(clr => clr !== firstColor && clr !== secondColor)[0];

      // Create a mutable copy of the current segment colors array.
      const modifiedColorsArray = this.segmentColors.slice();

      // Replace the two adjacent segments with two segments of the 'replacementColor'.
      modifiedColorsArray.splice(idx, 2, replacementColor, replacementColor);

      // Add the new chain identifier to the list.
      subsequentChainIdentifiers.push(modifiedColorsArray.join(''));
    }
    return subsequentChainIdentifiers;
  }
}

/**
 * Implements a Breadth-First Search (BFS) algorithm to find the shortest path
 * (minimum transformation level) to a state where no further transformations are possible.
 */
class PathFinder {
  /**
   * Initializes a new PathFinder.
   */
  constructor() {
    // Stores visited SegmentChain identifiers and their corresponding SegmentChain objects.
    this.visitedChains = new Map();
  }

  /**
   * Executes a BFS starting from a given chain identifier to find the terminal chain.
   * A terminal chain is one from which no further transformations can be made.
   * @param {string} initialChainId - The starting identifier for the BFS.
   * @returns {SegmentChain | undefined} The terminal SegmentChain object if found, otherwise undefined.
   */
  explorePaths(initialChainId) {
    // Initialize the queue for BFS.
    this.explorationQueue = [];

    // Add the initial chain to the visited map and the queue.
    this.visitedChains.set(initialChainId, new SegmentChain(initialChainId, 0));
    this.explorationQueue.push(initialChainId);

    // Continue BFS as long as there are chains to explore.
    while(this.explorationQueue.length > 0) {
      // Dequeue the next chain identifier.
      const currentChainId = this.explorationQueue.shift();
      // Retrieve the corresponding SegmentChain object.
      const currentChain = this.visitedChains.get(currentChainId);

      // Generate all possible next chain identifiers from the current chain.
      const generatedChainIds = currentChain.generateNextChainIdentifiers();

      // If no new chains can be generated, this is a terminal chain.
      if (!generatedChainIds.length) {
        return currentChain; // Return the terminal chain.
      }

      // Process each newly generated chain identifier.
      generatedChainIds.forEach(nextChainId => {
        // If this chain has already been visited, skip it.
        if (this.visitedChains.has(nextChainId)) {
          return;
        }
        // Mark the new chain as visited and calculate its level.
        this.visitedChains.set(nextChainId, new SegmentChain(nextChainId, currentChain.level + 1));
        // Enqueue the new chain for further exploration.
        this.explorationQueue.push(nextChainId);
      });
    }
    // Should not be reached if a terminal chain is always found.
    return undefined;
  }
}

// Process each input line (representing a starting worm ID).
processedLines.forEach(initialChainId => {
  // Skip processing if the input is the termination signal '0'.
  if (initialChainId === '0') {
    return;
  }

  // Create a new pathfinder for each input chain.
  const pathSearcher = new PathFinder();
  // Execute BFS to find the terminal chain.
  const terminalChain = pathSearcher.explorePaths(initialChainId);

  // Output the depth of the terminal chain, or 'NA' if not found (though it should always be found).
  console.log(terminalChain ? terminalChain.level : 'NA');
});
