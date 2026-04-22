/*
 * This module provides a flexible input parsing utility,
 * capable of reading various data formats from a text stream.
 */
var DATA_READER=(function(){
  /**
   * Factory function to create an input handler instance.
   * @param {string} sourceContent - The raw string content to parse.
   * @returns {InputHandler} A new InputHandler object.
   */
  function createHandler(sourceContent){
    return new InputHandler(sourceContent);
  }

  /**
   * Constructor for the InputHandler.
   * Manages the parsing of lines and extraction of values.
   * @param {string} initialText - The initial text data.
   */
  function InputHandler(initialText){
    // Store lines after trimming and splitting by newline
    this._textLines=initialText.trim().split("\n");
    // Current line pointer, initialized to the beginning
    this._linePointer=0;
  }

  /**
   * Prototype methods for InputHandler.
   */
  InputHandler.prototype={
    /**
     * Extracts a single scalar value from the current line.
     * If the line is exhausted, moves to the next.
     * @param {boolean} returnAsString - If true, returns the value as a string; otherwise, as a number.
     * @returns {string|number} The extracted value.
     */
    extractScalar: function(returnAsString){
      let currentLinesRef=this._textLines,
          currentLineIdx=this._linePointer,
          extractedValue;

      // Check if the current line needs to be processed (split and reversed)
      if(typeof currentLinesRef[currentLineIdx]==="string") {
        currentLinesRef[currentLineIdx]=currentLinesRef[currentLineIdx].split(" ").reverse();
      }

      // Pop the last element (which is the first element after reversal)
      extractedValue=currentLinesRef[currentLineIdx].pop();

      // If the current line is now empty, advance to the next line
      if(!currentLinesRef[currentLineIdx].length) {
        this._linePointer++;
      }

      // Return value based on the flag
      return returnAsString?extractedValue:+extractedValue;
    },

    /**
     * Reads an entire line and processes its elements.
     * @param {boolean} keepLiterals - If true, keeps elements as strings; otherwise, converts to numbers.
     * @returns {Array<string|number>} An array of values from the line.
     */
    fetchLineArray: function(keepLiterals){
      let parsedRowElements=this._textLines[this._linePointer++].split(" ");
      return keepLiterals?parsedRowElements:parsedRowElements.map(token=>+token);
    },

    /**
     * Reads a block of 'numRows' lines, parsing each into an array of values.
     * @param {number} numRows - The number of lines to read.
     * @param {boolean} preserveStringTypes - If true, keeps elements as strings; otherwise, converts to numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the data block.
     */
    getMultiLineData: function(numRows, preserveStringTypes){
      let dataBlock=this._textLines.slice(this._linePointer,this._linePointer+=numRows).map(lineContent=>lineContent.split(" "));
      return preserveStringTypes?dataBlock:dataBlock.map(row=>row.map(item=>+item));
    },

    /**
     * Reads a block of 'numLines' raw lines.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} returnRawStrings - If true, returns lines as strings; otherwise, attempts to convert to numbers.
     * @returns {Array<string|number>} An array of lines or converted numbers.
     */
    fetchRawRows: function(numLines, returnRawStrings){
      let extractedLines=this._textLines.slice(this._linePointer,this._linePointer+=numLines);
      return returnRawStrings?extractedLines:extractedLines.map(val=>+val);
    }
  };
  return createHandler;
})();

// Initialize the input processing system by reading from standard input
var inputProcessor=DATA_READER(require("fs").readFileSync("/dev/stdin","utf8"));

/**
 * Generates a multi-dimensional array with a specified default value.
 * @param {*} defaultValue - The value to fill the array with.
 * @returns {Array} A multi-dimensional array.
 */
function makeNDArray(defaultValue){
  var dimensionArgs=arguments,
      argCount=dimensionArgs.length,
      arrayCreationString="Array(dimensionArgs["+--argCount+"]).fill(0).map( _ => {return "+defaultValue+";})";

  while(--argCount) {
    arrayCreationString="Array(dimensionArgs["+argCount+"]).fill(0).map( _ => "+arrayCreationString+")";
  }
  return eval(arrayCreationString);
}

/**
 * Constructor for a Disjoint Set Union (DSU) data structure.
 * @param {number} elementCount - The number of elements in the set.
 */
function DisjointSetUnion(elementCount){
  // _parent array stores the parent of each element or the negative size of the set if it's a root.
  this._parent=Array(elementCount+1).fill(-1);
}

/**
 * Prototype methods for the DisjointSetUnion.
 */
DisjointSetUnion.prototype={
  /**
   * Finds the representative (root) of the set containing element 'itemIndex'.
   * Performs path compression for efficiency.
   * @param {number} itemIndex - The index of the element.
   * @returns {number} The root of the set.
   */
  findRoot: function(itemIndex){
    // If _parent[itemIndex] is negative, it's a root.
    return this._parent[itemIndex]<0?itemIndex:(this._parent[itemIndex]=this.findRoot(this._parent[itemIndex]));
  },

  /**
   * Checks if two elements 'itemA' and 'itemB' belong to the same set.
   * @param {number} itemA - The first element.
   * @param {number} itemB - The second element.
   * @returns {boolean} True if they are in the same set, false otherwise.
   */
  areConnected: function(itemA, itemB){
    return this.findRoot(itemA)===this.findRoot(itemB);
  },

  /**
   * Unites the sets containing 'nodeA' and 'nodeB'.
   * Uses union by size/rank heuristic.
   * @param {number} nodeA - The first element.
   * @param {number} nodeB - The second element.
   * @returns {number} 1 if union occurred, 0 if they were already in the same set.
   */
  unionSets: function(nodeA, nodeB){
    nodeA=this.findRoot(nodeA);
    nodeB=this.findRoot(nodeB);

    if(nodeA===nodeB) {
      return 0; // Already in the same set
    }

    // Union by size: attach smaller tree under root of larger tree
    if(this._parent[nodeB]<=this._parent[nodeA]) {
      this._parent[nodeB]+=this._parent[nodeA];
      this._parent[nodeA]=nodeB;
    } else {
      this._parent[nodeA]+=this._parent[nodeB];
      this._parent[nodeB]=nodeA;
    }
    return 1; // Union successful
  },

  /**
   * Returns the size of the set containing 'memberIndex'.
   * @param {number} memberIndex - The index of an element in the set.
   * @returns {number} The number of elements in the set.
   */
  getSetSize: function(memberIndex){
    return -this._parent[this.findRoot(memberIndex)];
  },
};


// Execute the main problem-solving function and print its output.
console.log(solveProblem());

/**
 * Main function to solve the graph problem.
 * Reads graph data, processes it using DSU and DFS, and returns a path sequence.
 * @returns {string} A newline-separated string of edges.
 */
function solveProblem(){
  const vertexCount=inputProcessor.extractScalar(); // Read number of vertices
  const edgeCount=inputProcessor.extractScalar(); // Read number of edges

  // If the number of edges is odd, it's impossible to form a valid path sequence.
  if((edgeCount % 2)!==0) {
    return -1;
  }

  const graphEdges=inputProcessor.getMultiLineData(edgeCount); // Read all edges
  const disjointSets=new DisjointSetUnion(vertexCount); // Initialize DSU for graph connectivity

  const outputPaths=[]; // Stores the sequence of edges for the result
  const adjacencyList=makeNDArray("[]",vertexCount+1); // Adjacency list for the graph
  const nodeParityStates=makeNDArray(0,vertexCount+1); // Stores parity state for each node

  // Process each edge
  for(let edgeIndex=0;edgeIndex<edgeCount;++edgeIndex){
    const startNode=graphEdges[edgeIndex][0];
    const endNode=graphEdges[edgeIndex][1];

    // If uniting the sets for these nodes is successful (they were in different components)
    if(disjointSets.unionSets(startNode,endNode)){
      outputPaths.push(startNode+" "+endNode); // Add this edge to the result
      nodeParityStates[startNode]^=1; // Toggle parity for the start node
    }else{
      // If they are already in the same set, it's a back-edge forming a cycle.
      // Add it to the adjacency list for DFS traversal later.
      adjacencyList[startNode].push(endNode);
      adjacencyList[endNode].push(startNode);
    }
  }

  // Perform Depth First Search starting from node 1 (assuming 1-indexed nodes)
  traverseGraph(1,0);

  // Return the collected paths joined by newlines
  return outputPaths.join("\n");

  /**
   * Performs a Depth First Search (DFS) traversal.
   * This nested function ensures access to `outputPaths`, `adjacencyList`, and `nodeParityStates`.
   * @param {number} currentNode - The current node being visited.
   * @param {number} parentNode - The parent node in the DFS tree.
   */
  function traverseGraph(currentNode,parentNode){
    // Iterate over neighbors of the current node
    for(const neighbor of adjacencyList[currentNode]){
      // Skip the parent node to avoid going back immediately
      if(neighbor===parentNode) {
        continue;
      }
      // Recursively call DFS for the neighbor
      traverseGraph(neighbor,currentNode);
    }

    // Base case: if at the root of the DFS (parentNode is 0), just return.
    if(parentNode===0) {
      return;
    }

    // Check the parity state of the current node
    if(nodeParityStates[currentNode]){
      // If parity is 1, add edge (currentNode -> parentNode)
      outputPaths.push(currentNode+" "+parentNode);
    }else{
      // If parity is 0, add edge (parentNode -> currentNode) and toggle parent's parity
      outputPaths.push(parentNode+" "+currentNode);
      nodeParityStates[parentNode]^=1;
    }
  }
}