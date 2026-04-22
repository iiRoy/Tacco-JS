var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all data from standard input as a string
var parsedLines = fileContent.trim().split("\n"); // Trim whitespace and split into an array of lines
var currentLinePtr = 0; // Pointer to the current line being processed

// Main processing loop: continues until a specific termination condition is met
while (true) {
  // Parse the number of vertices and edges for the current graph instance
  var graphSizes = parsedLines[currentLinePtr].split(" ").map(Number);
  currentLinePtr++; // Move to the next line in the input

  var vertexCount = graphSizes[0]; // Extract the number of vertices
  var edgeCount = graphSizes[1]; // Extract the number of edges

  // Check for the termination condition: both vertexCount and edgeCount are zero
  if (vertexCount === 0 && edgeCount === 0) {
    break; // Exit the loop if the termination condition is met
  }

  // Initialize an array to track the "affected" status of each node
  // `true` means affected, `false` means unaffected.
  var affectedStatus = [];
  for (var loopIndex = 0; loopIndex < vertexCount; loopIndex++) {
    affectedStatus[loopIndex] = true; // Initially, all nodes are considered affected
  }
  affectedStatus[0] = false; // The first node (index 0) is initially unaffected

  // Array to store details of transmission events
  var timedInteractions = [];

  // Loop through the input to read all transmission events
  for (var loopIndex = 0; loopIndex < edgeCount; loopIndex++) {
    // Parse the current line as an event: [time, source, destination]
    var interactionDetails = parsedLines[currentLinePtr].split(" ").map(Number);
    currentLinePtr++; // Advance the line pointer

    // Store the event, adjusting node indices to be zero-based
    timedInteractions.push([
      interactionDetails[0], // Time of interaction
      interactionDetails[1] - 1, // Source node (adjusted)
      interactionDetails[2] - 1 // Destination node (adjusted)
    ]);
  }

  // Sort the transmission events based on their time of occurrence
  timedInteractions.sort(function (eventOne, eventTwo) {
    return eventOne[0] - eventTwo[0]; // Sort ascending by time
  });

  // Process each transmission event in chronological order
  timedInteractions.forEach(function (currentEvent) {
    var sourceVertex = currentEvent[1]; // Get the source node of the event
    var targetVertex = currentEvent[2]; // Get the destination node of the event

    // If the source node is currently unaffected, then the target node also becomes unaffected
    // (This implies a "clean" transmission, where unaffected status spreads)
    if (!affectedStatus[sourceVertex]) {
      affectedStatus[targetVertex] = false;
    }
  });

  // Count the total number of nodes that remain unaffected after all events
  var unaffectedNodeCounter = 0;
  affectedStatus.forEach(function (nodeIsAffected) {
    if (!nodeIsAffected) {
      unaffectedNodeCounter++; // Increment counter if the node's status is 'unaffected' (false)
    }
  });

  // Output the final count of unaffected nodes for the current graph
  console.log(unaffectedNodeCounter);
}