// This module facilitates file system operations for input handling.
const ioOperations = require('fs');

// Determine the total byte count of the standard input stream.
const streamLengthInBytes = ioOperations.fstatSync(process.stdin.fd).size;

// Create a new buffer to store the incoming data from standard input.
const dataContentBuffer = new Buffer(streamLengthInBytes);

// Read the actual bytes from standard input into the allocated buffer.
const bytesEffectivelyRead = ioOperations.readSync(process.stdin.fd, dataContentBuffer, 0, streamLengthInBytes, 0);

// Convert the buffer content to a UTF-8 string and then split it into an array of lines.
const parsedSourceLines = dataContentBuffer.toString('utf8', 0, bytesEffectivelyRead).split('\n');

// Invoke the main routine to begin processing the graph data.
initiateGraphAnalysis();

/**
 * Orchestrates the primary logic for processing graph-related data.
 * This function reads node and edge information, constructs an adjacency list,
 * and performs a specific path-finding or relaxation algorithm on the graph.
 */
function initiateGraphAnalysis() {
  // Extract the first line of input, which contains graph dimensions (nodes and edges).
  let segmentStrings = parsedSourceLines.shift().split(' ');

  // Convert the string representations of node and edge counts to numerical values.
  const totalNodes = Number(segmentStrings[0]);
  const totalEdges = Number(segmentStrings[1]);

  // Initialize data structures: an adjacency list for connections and an array for node scores.
  const nodeConnections = [];
  const calculatedScores = [];

  // Declare loop control variables.
  let nodeIndexIterator, connectionIndexIterator;

  // Prepare each node in the graph by initializing its adjacency list and a default score.
  for (nodeIndexIterator = 0; nodeIndexIterator < totalNodes; nodeIndexIterator++) {
    nodeConnections[nodeIndexIterator] = [];
    calculatedScores[nodeIndexIterator] = 0;
  }

  // Populate the graph's adjacency list with edge information (source, destination, weight).
  for (connectionIndexIterator = 0; connectionIndexIterator < totalEdges; connectionIndexIterator++) {
    // Parse the current line representing an individual edge.
    segmentStrings = parsedSourceLines[connectionIndexIterator].split(' ');

    // Add the directed edge to the source node's list: [target_node_id, edge_weight].
    nodeConnections[Number(segmentStrings[0])].push([Number(segmentStrings[1]), Number(segmentStrings[2])]);
  }

  // Initialize a queue with the starting node (node 0) for traversal and evaluation.
  const processingQueue = [0];
  let activeNodeIdentifier, neighborNodeIdentifier;

  // Continue iterating as long as there are nodes pending evaluation in the queue.
  while (processingQueue.length > 0) {
    // Retrieve the next node to process from the end of the queue.
    activeNodeIdentifier = processingQueue.pop();

    // Traverse through all outgoing connections from the currently active node.
    for (nodeIndexIterator = 0; nodeIndexIterator < nodeConnections[activeNodeIdentifier].length; nodeIndexIterator++) {
      // Identify the destination node of the current connection.
      neighborNodeIdentifier = nodeConnections[activeNodeIdentifier][nodeIndexIterator][0];

      // Evaluate if the current path to the neighbor yields a higher score.
      if (calculatedScores[neighborNodeIdentifier] < calculatedScores[activeNodeIdentifier] + nodeConnections[activeNodeIdentifier][nodeIndexIterator][1]) {
        // Update the neighbor node's score with the new, improved value.
        calculatedScores[neighborNodeIdentifier] = calculatedScores[activeNodeIdentifier] + nodeConnections[activeNodeIdentifier][nodeIndexIterator][1];

        // Re-add the neighbor node to the queue as its score has been modified, potentially affecting its own neighbors.
        processingQueue.push(neighborNodeIdentifier);
      }
    }
  }

  // Display the final computed score for the last node in the graph (node totalNodes - 1).
  console.log(calculatedScores[totalNodes - 1]);
}