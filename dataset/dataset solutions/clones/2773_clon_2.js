var inputReader = require('readline').createInterface({ input: process.stdin, output: process.stdout });
var dataProcessor;
var capturedLines = [];
inputReader.on('line', function(lineContent) {
  capturedLines.push(lineContent);
});
inputReader.on('close', function() {
  dataProcessor = initializeProcessor(capturedLines);
  console.error('\nInput data parsed. Displaying computation results.');
  performMainTask();
});
function duplicateObject(originalObj) {
  return (originalObj instanceof Set) ? new Set(Array.from(originalObj)) : JSON.parse(JSON.stringify(originalObj));
}
function retrieveInteger() { return dataConverter(getNextItem(), 1); }
function retrieveStringArray() { return dataConverter(getNextItem(), 2); }
function retrieveIntegerArray() { return dataConverter(getNextItem(), 4); }
function retrieveCharacterArray() { return dataConverter(getNextItem(), 6); }
function getNextItem() { return dataProcessor.getNext(); }
function hasMoreItems() { return dataProcessor.hasMore(); }
function initializeProcessor(rawInputLines) {
  return {
    sourceData: rawInputLines,
    currentIndex: 0,
    maximumIndex: rawInputLines.length,
    hasMore: function() { return (this.currentIndex < this.maximumIndex); },
    getNext: function() {
      if (this.hasMore()) {
        return this.sourceData[this.currentIndex++];
      } else {
        throw 'InputExhaustedError: No more elements available for reading.';
      }
    }
  };
}
function displayOutput(messageContent) { console.log(messageContent); }
function logError(messageContent) { console.error('Debug Trace: ' + require('util').inspect(messageContent, false, null)); }
// This function transforms input values based on the specified conversion type.
// Default: Returns input as is.
// Type 1: Converts to an integer.
// Type 2: Splits string by spaces into an array of strings.
// Type 4: Splits string by spaces and maps to an array of numbers.
// Type 6: Splits string into an array of individual characters.
// Type 7: Splits string into an array of characters, then maps to numbers.
// Type 8: Joins array elements with spaces.
// Type 9: Joins array elements with newlines.
// Type 0: Joins array elements without any separator.
function dataConverter(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(' ');
      case 4: return inputValue.split(' ').map(Number);
      case 6: return inputValue.split('');
      case 7: return inputValue.split('').map(Number);
      case 8: return inputValue.join(' ');
      case 9: return inputValue.join('\n');
      case 0: return inputValue.join('');
      default: return inputValue;
    }
  } catch (error) {
    return inputValue; // Return original value on error
  }
}
function performMainTask() {
  // Read initial graph configuration parameters.
  var initialParams = retrieveIntegerArray();
  var nodeQuantity = initialParams[0];
  var availableColors = initialParams[1];
  // Initialize an array to represent the nodes of the graph.
  var graphNodes = new Array(nodeQuantity);
  for (var loopIndex = 0; loopIndex < nodeQuantity; loopIndex++) {
    graphNodes[loopIndex] = {
      connectedNodes: [],
      nodeIdentifier: loopIndex,
      colorAssignment: 0,
      visitedStatus: false
    };
  }
  // Read and establish connections (edges) between nodes.
  for (var loopIndex = 0; loopIndex < nodeQuantity - 1; loopIndex++) {
    var edgeInfo = retrieveIntegerArray();
    graphNodes[edgeInfo[0] - 1].connectedNodes.push(edgeInfo[1] - 1);
    graphNodes[edgeInfo[1] - 1].connectedNodes.push(edgeInfo[0] - 1);
  }
  var finalResult = 1;
  var moduloValue = 1000000007;
  // Mark the starting node (node 0) as visited.
  graphNodes[0].visitedStatus = true;
  // Initialize a stack for iterative graph traversal and coloring.
  // Each element: [count_of_parent_and_ancestors, remaining_color_options_for_current_node, current_node_index]
  var processingStack = [[0, availableColors, 0]];
  while (processingStack.length > 0) {
    var currentProcessingInfo = processingStack.pop();
    var parentColorCount = currentProcessingInfo[0];
    var currentColorOptions = currentProcessingInfo[1];
    var currentNodeIndex = currentProcessingInfo[2];
    graphNodes[currentNodeIndex].colorAssignment = currentColorOptions;
    // Adjust parent color count for sibling calculations.
    if (parentColorCount < 2) {
      parentColorCount++;
    }
    var currentChildren = graphNodes[currentNodeIndex].connectedNodes;
    var assignedChildrenCount = 0;
    for (var childIdx = 0; childIdx < currentChildren.length; childIdx++) {
      if (!graphNodes[currentChildren[childIdx]].visitedStatus) {
        graphNodes[currentChildren[childIdx]].visitedStatus = true;
        // Push unvisited child onto the stack with updated color options.
        processingStack.push([parentColorCount, availableColors - assignedChildrenCount - parentColorCount, currentChildren[childIdx]]);
        assignedChildrenCount++;
      }
    }
  }
  // Calculate the total number of ways to color the graph, applying modulo.
  for (var loopIndex = 0; loopIndex < nodeQuantity; loopIndex++) {
    finalResult = (finalResult * graphNodes[loopIndex].colorAssignment) % moduloValue;
  }
  displayOutput(finalResult);
  // This function implements a Depth-First Search (DFS) coloring algorithm.
  // It is defined but not invoked in the current execution flow.
  function depthFirstColoring(parentColorCountDfs, currentColorDfs, currentNodeIndexDfs, initialColorCountDfs) {
    graphNodes[currentNodeIndexDfs].colorAssignment = currentColorDfs;
    if (parentColorCountDfs < 2) {
      parentColorCountDfs++;
    }
    var childrenOfNode = graphNodes[currentNodeIndexDfs].connectedNodes;
    var processedChildren = 0;
    for (var cIdx = 0; cIdx < childrenOfNode.length; cIdx++) {
      if (!graphNodes[childrenOfNode[cIdx]].visitedStatus) {
        graphNodes[childrenOfNode[cIdx]].visitedStatus = true;
        depthFirstColoring(parentColorCountDfs, initialColorCountDfs - processedChildren - parentColorCountDfs, childrenOfNode[cIdx], initialColorCountDfs);
        processedChildren++;
      }
    }
  }
}