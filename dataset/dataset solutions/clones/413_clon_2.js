const rawData = require('node:fs').readFileSync('/dev/stdin', 'utf-8');

const inputLines = rawData.trim().split('\n');


const PALETTE_CHARS = ['x', 'y', 'z']; // Available segment types


class SegmentChain {
  // Construct a new chain instance
  constructor(identifier, level) {
    this.identifier = identifier; // Unique string identifier for this chain
    this.level = level;           // The exploration depth/level of this chain
    this.segments = identifier.split(''); // Individual segments parsed from the identifier string
  }


  // Determines all possible next states that can be generated from the current chain's configuration.
  generateNextStates() {
    const subsequentStates = []; // List to hold identifiers of all valid next states

    // Iterate through adjacent pairs of segments in the chain.
    for (let idx = 0; idx < this.segments.length - 1; idx++) {
      const currentSegment = this.segments[idx];       // Get segment at the current index
      const adjacentSegment = this.segments[idx + 1]; // Get segment at the next index

      // If the two adjacent segments are identical, no transformation rule applies here.
      if (currentSegment === adjacentSegment) {
        continue;
      }

      // Find the unique segment type from the palette that is different from both current and adjacent segments.
      const replacementSegment = PALETTE_CHARS.filter(elem =>
        elem !== currentSegment && elem !== adjacentSegment
      )[0];

      // Create a mutable copy of the current segments array to perform modifications.
      const modifiedSegments = [...this.segments]; // create a shallow duplicate

      // Replace the two differing segments with two instances of the determined replacement type.
      modifiedSegments.splice(idx, 2, replacementSegment, replacementSegment); // replace elements

      // Add the new state's identifier (joined string of segments) to the list of subsequent states.
      subsequentStates.push(modifiedSegments.join(''));
    }
    return subsequentStates; // Return the collection of all generated next state identifiers.
  }
}


class StateExplorer {
  // Initializes the explorer with an empty registry for states.
  constructor() {
    this.stateRegistry = new Map(); // Stores visited states and their associated SegmentChain objects.
  }


  // Checks if a state with the given key has already been registered.
  hasState(stateKey) {
    return this.stateRegistry.has(stateKey);
  }


  // Retrieves the SegmentChain object associated with a given state key.
  getState(stateKey) {
    return this.stateRegistry.get(stateKey);
  }


  // Registers a new state into the registry with its key and exploration level.
  registerState(stateKey, explorationLevel) {
    this.stateRegistry.set(stateKey, new SegmentChain(stateKey, explorationLevel));
  }


  // Performs a Breadth-First Search (BFS) to explore possible states from an initial key.
  traverseStates(initialKey) {
    this.processingQueue = []; // Queue for managing states to be processed during BFS.

    // Register the starting state at level 0 and add its key to the queue.
    this.registerState(initialKey, 0);
    this.processingQueue.push(initialKey);

    // Continue the traversal as long as there are states awaiting processing.
    while (this.processingQueue.length > 0) {
      const currentKey = this.processingQueue.shift(); // Dequeue the next state key.
      const currentState = this.getState(currentKey);   // Retrieve the corresponding SegmentChain object.

      const successorKeys = currentState.generateNextStates(); // Generate all possible next state identifiers.

      // If no successor states are found, this indicates a terminal state (no further transformations).
      if (successorKeys.length === 0) {
        return currentState; // Return this terminal state.
      }

      // Process each generated successor state.
      successorKeys.forEach(successorKey => {
        // If this successor state has already been visited and registered, skip it.
        if (this.hasState(successorKey)) {
          return;
        }

        // Register the new successor state, incrementing the exploration level.
        this.registerState(successorKey, currentState.level + 1);
        this.processingQueue.push(successorKey); // Add the new state's key to the queue for future processing.
      });
    }
    // If the queue becomes empty and no terminal state was found, it means no solution was reached.
    return undefined;
  }


  // (This method is not used in the main logic but is cloned as per Type II requirements)
  // Outputs the string representation of each object stored in the registry.
  outputRegistry() {
    for (let entryIndex = 1; entryIndex <= this.stateRegistry.size; entryIndex++) {
      const registryObject = this.stateRegistry.get(entryIndex);
      if (registryObject) { // Ensure the object exists before trying to call toString.
        console.log(registryObject.toString());
      }
    }
  }
}


// Process each line of input data from the provided source.
inputLines.forEach(currentLineContent => {

  // If the line content is '0', it signifies an end condition or skip this input.
  if (currentLineContent === '0') {
    return;
  }

  // Create a new state exploration instance for each valid input line.
  const explorerInstance = new StateExplorer();

  // Perform the state traversal starting from the current input line's identifier.
  // The result will be the terminal SegmentChain if found, or undefined.
  const finalState = explorerInstance.traverseStates(currentLineContent);

  // Output the exploration level of the final state if one was found, otherwise indicate 'N/A'.
  console.log(finalState ? finalState.level : 'N/A');
});