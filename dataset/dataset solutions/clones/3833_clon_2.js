var incomingData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
var dataStream = {
  "content": incomingData,
  "readIndex": 0,
  "totalLines": incomingData.length,
  // Checks if there are more lines to process.
  "hasMore": function(){return (this.readIndex < this.totalLines);},
  // Retrieves the next line from the stream.
  "fetchNext": function(){
    if(!this.hasMore()){throw "InputExhaustedError: No more data available for reading.";}
    var currentLine = this.content[this.readIndex];
    this.readIndex++;
    return currentLine;
  }
}
primaryRoutine();
// Retrieves the subsequent line from the input stream.
function getLine(){return dataStream.fetchNext();}
// Fetches the next line and converts it to an integer.
function extractInteger(){return typeConverter(getLine(),1);}
// Reads the next line and splits it into an array of strings by spaces.
function parseStringArray(){return typeConverter(getLine(),2);}
// Gets the next line, splits by spaces, and converts elements to numbers.
function parseNumericArray(){return typeConverter(getLine(),4);}
// Takes the next line and breaks it into an array of individual characters.
function splitIntoChars(){return typeConverter(getLine(),6);}
// Ascertains if there are additional lines to be read.
function hasMoreInput(){return dataStream.hasMore();}
// Prints a given value to the standard output.
function printToConsole(outputValue){console.log(outputValue);}
// Emits an error message to the standard error stream.
function logFailure(errorMessage){console.error(errorMessage);}
/*
 * Utility function to transform input values based on a specified operation code.
 * Operation codes:
 * 1: Convert to integer.
 * 2: Split by space into string array.
 * 4: Split by space and convert to number array.
 * 6: Split into character array.
 * 7: Split into character array and convert to number array.
 * 8: Join array with spaces.
 * 9: Join array with newlines.
 * 0: Join array without a separator.
 * Default: Return value as is.
 */
function typeConverter(valueToConvert,operationCode){try{switch(operationCode){case 1:return parseInt(valueToConvert);case 2:return valueToConvert.split(" ");case 4:return valueToConvert.split(" ").map((numStr)=>Number(numStr));case 6:return valueToConvert.split("");case 7:return valueToConvert.split("").map((charVal)=>Number(charVal));case 8:return valueToConvert.join(" ");case 9:return valueToConvert.join("\n");case 0:return valueToConvert.join("");default:return valueToConvert;}}catch(error){return valueToConvert;}}
// Implements a Disjoint Set Union (DSU) data structure.
function groupManager(numNodes){
  var dsuInstance = {
    // The internal array stores parent pointers or negative sizes for roots.
    // Initially, each node is its own root with a size of 1 (represented as -1).
    "nodeData" : new Array(numNodes).fill(-1),
    // Determines if two nodes belong to the same connected component.
    "belongToSameSet" : function(nodeA, nodeB){
      return this.findRepresentative(nodeA) == this.findRepresentative(nodeB);
    },
    // Finds the root (representative) of the set containing the given node.
    // Applies path compression for efficiency.
    "findRepresentative" : function(targetNode){
      if(this.nodeData[targetNode] < 0){
        return targetNode;
      }else{
        // Path compression: set parent directly to the root.
        this.nodeData[targetNode] = this.findRepresentative(this.nodeData[targetNode]);
        return this.nodeData[targetNode];
      }
    },
    // Merges two sets into one. Uses union by size heuristic.
    // If nodes are already in the same set, no action is taken.
    "uniteSets" : function(idxA, idxB){
      var rootA = this.findRepresentative(idxA);
      var rootB = this.findRepresentative(idxB);
      if(!this.belongToSameSet(rootA, rootB)){
        // Union by size: attach smaller tree to the root of the larger tree.
        if(this.nodeData[rootA] >= this.nodeData[rootB]){
          this.nodeData[rootA] += this.nodeData[rootB];
          this.nodeData[rootB] = rootA;
        }else{
          this.nodeData[rootB] += this.nodeData[rootA];
          this.nodeData[rootA] = rootB;
        }
      }
    },
    // Returns the size of the set to which the given node belongs.
    "fetchSetSize" : function(elementIdx){
      // The root's value is negative of its set size.
      return -this.nodeData[this.findRepresentative(elementIdx)];
    }
  }
  return dsuInstance;
}
// The main function where the program logic resides.
function primaryRoutine(){
  var initialParams = parseNumericArray();
  var nodeQuantity = initialParams[0];
  var operationCount = initialParams[1];
  var elementValues = parseNumericArray();
  var groupSystem = groupManager(nodeQuantity);
  // Perform 'M' union operations.
  for(var iterator = 0; iterator < operationCount; iterator++){
    var pairData = parseNumericArray();
    groupSystem.uniteSets(pairData[0] - 1, pairData[1] - 1);
  }
  var matchingCount = 0;
  // Iterate through all nodes to check for conditions.
  for(var iterator = 0; iterator < nodeQuantity; iterator++){
    var actualPosition = elementValues[iterator] - 1;
    // Check if the actual position is in the same set as its index.
    if(groupSystem.belongToSameSet(actualPosition,iterator)){
       matchingCount++;
    }
  }
  printToConsole(matchingCount);
}