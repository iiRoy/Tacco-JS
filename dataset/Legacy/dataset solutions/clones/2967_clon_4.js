function processGraphData(inputContent) {
  const contentLines = inputContent.split('\n');
  
  const configuration = contentLines.shift().split(' ').map(val => parseInt(val, 10));
  const nodeCount = configuration[0];
  // const edgeCount = configuration[1]; // M is not used in the original logic.

  const rawEdges = contentLines.map(line => line.split(' ').map(val => parseInt(val, 10)));

  // Initialize node data structure: a Map to store each node's visit status and its mutable list of outgoing links.
  const nodeRegistry = new Map();
  for (let k = 1; k <= nodeCount; ++k) {
    nodeRegistry.set(k, { wasVisited: false, outgoingLinks: [] });
  }

  // Populate outgoing links for each node, preserving the order as it's critical for 'shift' behavior.
  rawEdges.forEach(edgePair => {
    const [source, target] = edgePair;
    nodeRegistry.get(source).outgoingLinks.push(target);
  });

  // Iterative function to traverse a path segment, marking nodes as visited and consuming outgoing links.
  const traceComponent = (startNodeIdentifier, registry) => {
    let currentIdentifier = startNodeIdentifier;
    while (true) {
      const currentEntry = registry.get(currentIdentifier);
      
      // Mark the current node as visited.
      currentEntry.wasVisited = true;

      // If there are no more outgoing links from this node, the path segment ends.
      if (currentEntry.outgoingLinks.length === 0) {
        break;
      }

      // Get and remove the next link in sequence, then move to that node.
      const nextIdentifier = currentEntry.outgoingLinks.shift();
      currentIdentifier = nextIdentifier; 
    }
  };

  let distinctComponents = 0;
  let currentVertex = 1;

  // Iterate through all possible starting nodes.
  while (currentVertex <= nodeCount) {
    const vertexEntry = nodeRegistry.get(currentVertex);
    
    // If the current vertex has not been visited yet, it signifies the beginning of a new component.
    if (!vertexEntry.wasVisited) {
      distinctComponents++;
      traceComponent(currentVertex, nodeRegistry);
    }
    
    // Advance currentVertex to the next unvisited node.
    // This replicates the original's behavior of skipping nodes already part of a traversed component.
    currentVertex++;
    while (currentVertex <= nodeCount && nodeRegistry.get(currentVertex).wasVisited) {
      currentVertex++;
    }
  }
  
  console.log(distinctComponents);
}

processGraphData(require('fs').readFileSync('/dev/stdin', 'utf8'));
