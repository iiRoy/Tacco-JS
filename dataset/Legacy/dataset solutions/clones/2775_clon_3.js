"use strict";
(function(rawDataInput){
  // Helper function to parse raw string input into an array of numbers
  const parseNumericInput = (dataString) => {
    return dataString.trim().split(/\s+/).map(val => parseInt(val, 10));
  };

  let parsedNumericData = parseNumericInput(rawDataInput);

  const nodeCount = parsedNumericData.shift();
  const maxColors = parsedNumericData.shift();
  const modulusValue = 1e9 + 7;

  // Define a class for graph nodes
  class GraphNode {
    constructor() {
      this.childConnections = [];
      this.nodeHeight = 0;
    }
  }

  // Initialize an array of GraphNode instances
  const allGraphNodes = new Array(nodeCount + 1).fill(null).map(_ => new GraphNode());

  // Establish an initial bidirectional connection between node 0 and node 1
  const rootNode = allGraphNodes[0];
  const firstActualNode = allGraphNodes[1];
  rootNode.childConnections.push(firstActualNode);
  firstActualNode.childConnections.push(rootNode);

  // Helper function to add a bidirectional edge between two nodes
  const addBidirectionalEdge = (node1, node2) => {
    node1.childConnections.push(node2);
    node2.childConnections.push(node1);
  };

  // Process remaining input data to add all other edges
  while(parsedNumericData.length > 0){
    let nodeBIndex = parsedNumericData.pop();
    let nodeAIndex = parsedNumericData.pop();
    addBidirectionalEdge(allGraphNodes[nodeAIndex], allGraphNodes[nodeBIndex]);
  }

  // --- First BFS Traversal: Calculate node heights and remove parent links ---
  const heightCalculationQueue = [rootNode];
  let currentQueueReadIndex = 0; // Acts as a pointer for queue processing

  while(currentQueueReadIndex < heightCalculationQueue.length){
    let processingNode = heightCalculationQueue[currentQueueReadIndex++];

    // Helper function to process each child during height calculation
    const processChildForHeight = (childOfProcessingNode) => {
      childOfProcessingNode.nodeHeight = processingNode.nodeHeight + 1;
      // Remove the parent link from the child's connections to ensure tree structure
      const parentLinkIndex = childOfProcessingNode.childConnections.indexOf(processingNode);
      if (parentLinkIndex > -1) {
        childOfProcessingNode.childConnections.splice(parentLinkIndex, 1);
      }
      heightCalculationQueue.push(childOfProcessingNode);
    };

    processingNode.childConnections.forEach(processChildForHeight);
  }

  // --- Second BFS Traversal: Calculate the final result based on coloring rules ---
  let finalCalculatedResult = 1;
  const coloringCalculationQueue = [rootNode];
  let currentColoringQueueReadIndex = 0; // Acts as a pointer for queue processing

  while(currentColoringQueueReadIndex < coloringCalculationQueue.length){
    let currentProcessingNode = coloringCalculationQueue[currentColoringQueueReadIndex++];

    const numberOfChildren = currentProcessingNode.childConnections.length;
    let baseMultiplierValue = 0;

    // Determine the base value for multiplication based on node height
    if(currentProcessingNode.nodeHeight < 2){
      baseMultiplierValue = maxColors - currentProcessingNode.nodeHeight;
    } else {
      baseMultiplierValue = maxColors - 2;
    }

    // Helper function to apply the product factors for the current node
    const applyProductFactors = (count) => {
      for(let factorIndex = 0; factorIndex < count; factorIndex++){
        finalCalculatedResult = (finalCalculatedResult * (baseMultiplierValue - factorIndex)) % modulusValue;
      }
    };

    applyProductFactors(numberOfChildren);

    // Add children to the queue for subsequent coloring calculations
    currentProcessingNode.childConnections.forEach(function(childNodeForColoring){
      coloringCalculationQueue.push(childNodeForColoring);
    });
  }

  console.log(finalCalculatedResult);

})(require("fs").readFileSync("/dev/stdin","utf8"));
