const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const dataLines = rawData.trim().split('\n');
const totalCount = Number(dataLines.shift());
const linkSpecs = dataLines;

// Central data store for graph elements.
// Keys are element identifiers (node IDs), values are plain objects
// containing their connections and attributes.
const graphStore = new Map();

// Helper function to ensure an element's structure exists in the graphStore.
// If not present, it initializes it with empty connections and attributes.
function ensureElement(elementIdentifier) {
  if (!graphStore.has(elementIdentifier)) {
    graphStore.set(elementIdentifier, {
      connections: [], // Array of connected element identifiers (children)
      attributes: {}   // Object to store properties like 'level' (depth)
    });
  }
  return graphStore.get(elementIdentifier);
}

// Process the input specifications to build the graph structure.
linkSpecs.forEach(line => {
  const parts = line.split(' ').map(Number);
  const parentIdentifier = parts[0];
  // The second part 'k' (number of children) is not directly used in this representation.
  const childIdentifiers = parts.slice(2);

  const parentElement = ensureElement(parentIdentifier);
  childIdentifiers.forEach(childIdentifier => {
    ensureElement(childIdentifier); // Ensure the child element exists in the graph
    parentElement.connections.push(childIdentifier); // Add child to parent's connections
  });
});

// Performs an iterative Breadth-First Search (BFS) to calculate levels (depths)
// of all reachable elements from a given starting point.
function conductBreadthTraversal(startingIdentifier) {
  const explorationQueue = []; // A plain JavaScript array used as a queue
  const startElement = ensureElement(startingIdentifier);

  // Initialize the starting element's level to 0.
  startElement.attributes.level = 0;
  explorationQueue.push(startingIdentifier); // Enqueue the identifier of the starting element

  let headPointer = 0; // Manual head pointer for efficient queue processing (avoids array.shift())
  while (headPointer < explorationQueue.length) {
    const currentIdentifier = explorationQueue[headPointer++];
    const currentElement = graphStore.get(currentIdentifier);

    currentElement.connections.forEach(connectedIdentifier => {
      const connectedElement = graphStore.get(connectedIdentifier);

      // If the connected element's level is undefined, it means it hasn't been visited yet.
      if (connectedElement.attributes.level === undefined) {
        connectedElement.attributes.level = currentElement.attributes.level + 1;
        explorationQueue.push(connectedIdentifier); // Enqueue the newly visited element
      }
    });
  }
}

// Initiate the BFS traversal starting from element ID 1 (standard root).
conductBreadthTraversal(1);

// Formats and outputs the element identifiers and their calculated levels.
function presentResults(maxIdentifier) {
  const outputLines = [];
  // Iterate from 1 up to the total number of elements (N),
  // assuming element IDs are 1-indexed and contiguous up to N.
  for (let i = 1; i <= maxIdentifier; i++) {
    const elementRecord = graphStore.get(i);
    let currentLevel = undefined; // Default level for unmentioned or unreachable elements

    if (elementRecord) {
      currentLevel = elementRecord.attributes.level;
    }
    outputLines.push(`${i} ${currentLevel}`);
  }
  process.stdout.write(outputLines.join('\n') + '\n');
}

// Display the final results for all elements.
presentResults(totalCount);