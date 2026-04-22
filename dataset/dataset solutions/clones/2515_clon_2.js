let inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let dataStore; let collectedLines = []; /* Array to hold all incoming lines */
inputReader.on('dataLine', function(inputLine){
  collectedLines.push(inputLine);
});
inputReader.on('finishedReading', function(){
  dataStore = setupDataParser(collectedLines); /* Initialize our custom input handler */
  console.error("\n"); /* Add a newline for better console output separation */
  const processingStartTime = Date.now();
  performCoreCalculation();
  const elapsedDuration = Date.now() - processingStartTime;
  outputDebugInfo("total execution time : " + elapsedDuration + "ms");
  outputDebugInfo("memory usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function createDeepCopy(originalObject){
  return JSON.parse(JSON.stringify(originalObject));
}
function retrieveIntegerVal(){
  return processDataItem(getNextDataItem(), 1);
}
function retrieveStringArr(){
  return processDataItem(getNextDataItem(), 2);
}
function retrieveIntegerArr(){
  return processDataItem(getNextDataItem(), 4);
}
function retrieveCharArr(){
  return processDataItem(getNextDataItem(), 6);
}
function getNextDataItem(){
  return dataStore.fetchNextToken();
}
function isInputRemaining(){
  return dataStore.hasMoreTokens();
}
function setupDataParser(inputCollection){  /* Function to set up the input parsing object */
  let dataParserObject = {
    dataLines : inputCollection,
    parseIndex : 0,
    totalLines : inputCollection.length,
    hasMoreTokens : function(){
      return (this.parseIndex < this.totalLines);
    },
    fetchNextToken : function(){
      if(!this.hasMoreTokens()){
        throw new Error("InputExhaustedException: No more input tokens are available.");
      } else {
        let extractedItem = this.dataLines[this.parseIndex++];
        return extractedItem;
      }
    }
  };
  return dataParserObject;
}
function displayOutput(message){
  console.log(message);
}
function outputDebugInfo(debugMessage){
  console.error("debug_output:" + require("util").inspect(debugMessage, false, null));
}
/*
 * This function handles various types of input conversions.
 * 'conversionType' parameter determines the operation:
 *  - 1: Parse to integer.
 *  - 2: Split by space into string array.
 *  - 4: Split by space and convert to integer array.
 *  - 6: Split into character array.
 *  - 7: Split into character array and convert to integer array.
 *  - 8: Join array elements with spaces.
 *  - 9: Join array elements with newlines.
 *  - 0: Join array elements without any separator.
 *  - Default: Return the input as is.
*/
function processDataItem(inputVal, conversionType){
  try{
    switch(conversionType){
      case 1: return Number.parseInt(inputVal);
      case 2: return inputVal.split(" ");
      case 4: return inputVal.split(" ").map(val => Number(val));
      case 6: return inputVal.split("");
      case 7: return inputVal.split("").map(val => Number(val));
      case 8: return inputVal.join(" ");
      case 9: return inputVal.join("\n");
      case 0: return inputVal.join("");
      default: return inputVal;
    }
  } catch(err){
    return inputVal; /* If conversion fails, return original value */
  }
}
/* End of utility functions, main application logic follows */
function performCoreCalculation(){
  let nodeCount = retrieveIntegerVal();
  let graphNodes = new Array(nodeCount); /* Array to represent graph nodes */
  for(let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++){
    graphNodes[nodeIdx] = {
      connectedNodes : [], /* List of adjacent nodes */
      isProcessed : false, /* Flag to track if node has been visited */
      distanceFromRoot : 1 /* Depth from a starting node */
    };
  }
  for(let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++){
    let currentMatrixRow = retrieveCharArr(); /* Read adjacency matrix row */
    for(let neighborIdx = 0; neighborIdx < nodeCount; neighborIdx++){
      /* Add connection if it's not self-loop and entry is '1' */
      if(nodeIdx !== neighborIdx && currentMatrixRow[neighborIdx] === "1"){
        graphNodes[nodeIdx].connectedNodes.push(neighborIdx);
      }
    }
  }
  
  let computedValue = -1; /* Initialize the final computed result */
  let initialMaxDistanceNode = traverseGraph(0, graphNodes, nodeCount); /* First BFS from node 0 */
  
  /* Reset node states for the second BFS traversal */
  for(let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++){
    graphNodes[nodeIdx].isProcessed = false;
    graphNodes[nodeIdx].distanceFromRoot = 1;
  }
  let diameterEndPoint = traverseGraph(initialMaxDistanceNode, graphNodes, nodeCount); /* Second BFS from the farthest node */
  
  /* Check for specific graph properties to determine final output */
  for(let idxA = 0; idxA < nodeCount - 1; idxA++){
    for(let idxB = idxA + 1; idxB < nodeCount; idxB++){
      /* If two nodes are at the same depth and are connected, it's an invalid configuration */
      if(graphNodes[idxA].distanceFromRoot === graphNodes[idxB].distanceFromRoot && (graphNodes[idxA].connectedNodes.indexOf(idxB) !== -1 || graphNodes[idxB].connectedNodes.indexOf(idxA) !== -1)){
        displayOutput(-1);
        return; /* Exit early if invalid */
      } else {
        /* Otherwise, update the maximum depth found so far */
        computedValue = Math.max(computedValue, graphNodes[idxA].distanceFromRoot);
      }
    }
  }
  displayOutput(computedValue); /* Output the final calculated value */
  
  /* Breadth-First Search implementation */
  function traverseGraph(initialVertex, nodeCollection, totalVertices){
    let nodeQueue = [initialVertex]; /* Queue for BFS */
    nodeCollection[initialVertex].isProcessed = true; /* Mark starting node as visited */
    let greatestDistance = 0; /* Tracks the maximum depth encountered in this BFS */
    
    while(nodeQueue.length > 0){
      let currentVertex = nodeQueue.shift(); /* Get the next node from the queue */
      let adjacentElements = nodeCollection[currentVertex].connectedNodes; /* Get neighbors */
      
      for(let loopIdx = 0; loopIdx < adjacentElements.length; loopIdx++){
        let neighborNodeIdx = adjacentElements[loopIdx];
        if(!nodeCollection[neighborNodeIdx].isProcessed){
          nodeCollection[neighborNodeIdx].isProcessed = true; /* Mark neighbor as visited */
          nodeCollection[neighborNodeIdx].distanceFromRoot = nodeCollection[currentVertex].distanceFromRoot + 1; /* Update neighbor's depth */
          greatestDistance = Math.max(greatestDistance, nodeCollection[currentVertex].distanceFromRoot + 1); /* Update max depth */
          nodeQueue.push(neighborNodeIdx); /* Add neighbor to queue */
        }
      }
    }
    
    let resultNodeIdentifier = -1; /* Index of a node at the greatest depth */
    for(let nodeIdx = 0; nodeIdx < totalVertices; nodeIdx++){
      if(nodeCollection[nodeIdx].distanceFromRoot === greatestDistance){
        resultNodeIdentifier = nodeIdx; /* Found a node at max depth */
        break; /* Exit loop, we only need one such node */
      }
    }
    return resultNodeIdentifier; /* Return the index of one of the farthest nodes */
  }
}