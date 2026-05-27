const fileSystem = require('fs');

// Read input from stdin
const dataLength = fileSystem.fstatSync(process.stdin.fd).size;
const dataBuffer = Buffer.alloc(dataLength);
const readBytes = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, dataLength, 0);
const rawInputLines = dataBuffer.toString('utf8', 0, readBytes).split('\n');

// Execute the main graph analysis logic
executeGraphAnalysis();

function executeGraphAnalysis() {
  // Parse graph dimensions from the first line of input
  const dimensionsLine = rawInputLines.shift().split(' ');
  const nodeCount = Number(dimensionsLine[0]);
  const edgeCount = Number(dimensionsLine[1]);

  // Initialize graph representation (adjacency list) and in-degree array
  // adjacencies[u] will store an array of objects: { target: v, weight: w }
  const adjacencies = Array.from({ length: nodeCount }, () => []);
  const inboundDegrees = Array(nodeCount).fill(0); // Tracks incoming edges for each node
  // maximumDistances[i] will store the longest path length to node i from any source (implicitly 0)
  const maximumDistances = Array(nodeCount).fill(0);

  // Populate the adjacency list and calculate initial in-degrees for all nodes
  for (let idx = 0; idx < edgeCount; idx++) {
    const edgeDetails = rawInputLines[idx].split(' ');
    const sourceNode = Number(edgeDetails[0]);
    const targetNode = Number(edgeDetails[1]);
    const edgeWeight = Number(edgeDetails[2]);

    adjacencies[sourceNode].push({ target: targetNode, weight: edgeWeight });
    inboundDegrees[targetNode]++;
  }

  // Perform Topological Sort using Kahn's algorithm
  const processingQueue = [];
  // Add all nodes with an initial in-degree of 0 to the queue
  for (let idx = 0; idx < nodeCount; idx++) {
    if (inboundDegrees[idx] === 0) {
      processingQueue.push(idx);
    }
  }

  const sortedNodes = []; // Stores nodes in topological order
  let queuePointer = 0; // Optimized queue processing using a pointer
  while (queuePointer < processingQueue.length) {
    const currentVertex = processingQueue[queuePointer++]; // Dequeue a node

    sortedNodes.push(currentVertex); // Add to topological order

    // For each neighbor of the current node
    for (const edge of adjacencies[currentVertex]) {
      inboundDegrees[edge.target]--; // Decrement in-degree of the neighbor
      // If neighbor's in-degree becomes 0, it can be processed next
      if (inboundDegrees[edge.target] === 0) {
        processingQueue.push(edge.target);
      }
    }
  }

  // Calculate Longest Paths using Dynamic Programming on the topologically sorted nodes
  // Iterate through nodes in topological order
  for (const currentVertex of sortedNodes) {
    // For each outgoing edge from the current node
    for (const edge of adjacencies[currentVertex]) {
      // Relax the edge: update the maximum distance to the target node
      // if a longer path is found through the current node
      maximumDistances[edge.target] = Math.max(
        maximumDistances[edge.target],
        maximumDistances[currentVertex] + edge.weight
      );
    }
  }

  // Output the array of maximum path lengths
  console.log(maximumDistances);
}
