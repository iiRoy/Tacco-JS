var FETCH_DATA=(function(){
  // This function serves as a factory to create an input parsing instance.
  function createParser(sourceContent){
    return new InputProcessor(sourceContent);
  }

  // The InputProcessor class handles parsing the input string.
  function InputProcessor(rawInputString){
    // Split the input into lines and trim any leading/trailing whitespace from the whole string.
    this._lines = rawInputString.trim().split("\n");
    // Initialize the current line index to 0.
    this._currentLineIndex = 0;
  }

  // Prototype method to extract a single token (atom) from the current line.
  InputProcessor.prototype.extractToken = function(returnAsString){
    var lineStorage = this._lines;
    var linePointer = this._currentLineIndex;
    var resultValue;

    // If the current line hasn't been split into tokens yet, do so.
    // Tokens are assumed to be space-separated and are processed in reverse order.
    if(typeof lineStorage[linePointer] === "string") {
      lineStorage[linePointer] = lineStorage[linePointer].split(" ").reverse();
    }

    // Pop the last token (which was originally the first due to reverse).
    resultValue = lineStorage[linePointer].pop();

    // If the current line is now empty, advance to the next line.
    if(!lineStorage[linePointer].length) {
      this._currentLineIndex++;
    }

    // Return the token, either as a string or parsed as a number.
    return returnAsString ? resultValue : +resultValue;
  };

  // Prototype method to retrieve an entire line of tokens.
  InputProcessor.prototype.retrieveLine = function(returnAsString){
    // Get the current line, split it by spaces, and then advance the line index.
    var tokensOnLine = this._lines[this._currentLineIndex++].split(" ");
    // Return the tokens, either as strings or parsed as numbers.
    return returnAsString ? tokensOnLine : tokensOnLine.map(item => +item);
  };

  // Prototype method to fetch a matrix of 'numRows' rows.
  InputProcessor.prototype.fetchMatrix = function(numRows, returnAsString){
    // Slice the relevant rows, split each into tokens, and advance the line index.
    var matrixRows = this._lines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(item => item.split(" "));
    // Return the matrix, either as strings or parsed as numbers.
    return returnAsString ? matrixRows : matrixRows.map(item => item.map(subItem => +subItem));
  };

  // Prototype method to grab 'numRows' individual rows.
  InputProcessor.prototype.grabRows = function(numRows, returnAsString){
    // Slice the relevant rows and advance the line index.
    var individualRows = this._lines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
    // Return the rows, either as strings or parsed as numbers.
    return returnAsString ? individualRows : individualRows.map(item => +item);
  };

  return createParser;
})();

// Initialize the input reader by reading from standard input.
var inputReader = FETCH_DATA(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main logic and print the result to console.
console.log(processGraph());

// Main function encapsulating the graph processing logic.
function processGraph(){
  // Read the number of nodes and edges from input.
  var nodeCount = inputReader.extractToken();
  var edgeCount = inputReader.extractToken();

  // Initialize adjacency lists for incoming and outgoing connections.
  var incomingConnections = []; // Represents nodes that point TO this node.
  var outgoingConnections = []; // Represents nodes that this node points TO.

  // Initialize a tracker for node levels/distances, filled with a large value.
  var levelTracker = Array(nodeCount + edgeCount - 1).fill(9e9);

  // Loop to read all edge definitions.
  for(var idx = 0; idx < nodeCount + edgeCount - 1; idx++){
    // Read an edge pair [from, to] and adjust to 0-indexed.
    var edgePair = inputReader.retrieveLine().map(item => item - 1);

    // Populate incomingConnections: if 'to' node has an entry, push 'from', else create new array.
    if(incomingConnections[edgePair[1]]) {
      incomingConnections[edgePair[1]].push(edgePair[0]);
    } else {
      incomingConnections[edgePair[1]] = [edgePair[0]];
    }

    // Populate outgoingConnections: if 'from' node has an entry, push 'to', else create new array.
    if(outgoingConnections[edgePair[0]]) {
      outgoingConnections[edgePair[0]].push(edgePair[1]);
    } else {
      outgoingConnections[edgePair[0]] = [edgePair[1]];
    }
  }

  // Array to store the final topological order or assignment.
  var finalOrder = [];
  var processingQueue; // Queue for BFS-like traversal.

  // Find the starting node(s) (nodes with no incoming connections).
  for(idx = 0; ; idx++){
    if(!incomingConnections[idx]){ // If a node has no incoming connections.
      processingQueue = outgoingConnections[idx]; // Start BFS from its children.
      finalOrder[idx] = 0; // Assign level 0 to the starting node.
      levelTracker[idx] = 0; // Mark its level.
      break; // Found the first starting node, exit loop.
    }
  }

  var processedNodeCount = 1; // Count of nodes processed so far, starting with the initial node.
  var currentDepth = 1;       // Current depth/level in the graph.

  // Perform a BFS-like traversal to assign levels and determine order.
  while(processedNodeCount < nodeCount){
    var nextLevelQueue = []; // Queue for nodes at the next depth level.

    // Iterate through nodes in the current processing queue.
    for(idx = 0; idx < processingQueue.length; idx++){
      var currentNodeId = processingQueue[idx];
      var allPredecessorsProcessed = 1; // Flag to check if all predecessors of currentNodeId are at a lower depth.

      // Check all incoming connections for the currentNodeId.
      for(var innerIdx = 0; innerIdx < incomingConnections[currentNodeId].length; innerIdx++){
        // If any predecessor's level is not less than currentDepth, it's not ready.
        if(levelTracker[incomingConnections[currentNodeId][innerIdx]] >= currentDepth){
          allPredecessorsProcessed = 0;
          break;
        }
        // If a predecessor is at currentDepth - 1, assign its ID + 1 to the current node's final order.
        if(levelTracker[incomingConnections[currentNodeId][innerIdx]] === currentDepth - 1) {
          finalOrder[currentNodeId] = incomingConnections[currentNodeId][innerIdx] + 1;
        }
      }

      // If all predecessors are processed (i.e., at a lower depth).
      if(allPredecessorsProcessed){
        levelTracker[currentNodeId] = currentDepth; // Assign current depth to this node.
        processedNodeCount++; // Increment count of processed nodes.
        // If this node has outgoing connections, add them to the next level's queue.
        if(outgoingConnections[currentNodeId]) {
          nextLevelQueue = nextLevelQueue.concat(outgoingConnections[currentNodeId]);
        }
      }
    }
    processingQueue = nextLevelQueue; // Move to the next level's queue.
    currentDepth++; // Increment the depth.
  }

  // Join the final order array elements with newline characters for output.
  return finalOrder.join("\n");
}
