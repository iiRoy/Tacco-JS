var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataHandler;
var inputLines = [];

inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

inputReader.on('close', function(){
  dataHandler = initializeInputProcessor(inputLines);
  console.error('\n↑入力 ↓出力');
  executeSolution();
});

function createDeepCopy(originalObject){
  // This function creates a deep copy of an object.
  // If the object is a Set, it creates a new Set from its elements.
  // Otherwise, it uses JSON serialization/deserialization for a generic deep copy.
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

function readInteger(){
  // Reads the next input item and converts it to an integer.
  return convertInput(getNextItem(), 1);
}

function readStringArray(){
  // Reads the next input item and splits it into a string array by spaces.
  return convertInput(getNextItem(), 2);
}

function readIntegerArray(){
  // Reads the next input item, splits it by spaces, and converts elements to numbers.
  return convertInput(getNextItem(), 4);
}

function readCharacterArray(){
  // Reads the next input item and splits it into a character array.
  return convertInput(getNextItem(), 6);
}

function getNextItem(){
  // Retrieves the next item from the input data handler.
  return dataHandler.getNextItem();
}

function hasMoreData(){
  // Checks if there are more items available in the input data.
  return dataHandler.hasMoreData();
}

function initializeInputProcessor(inputData){
  // Sets up an object to manage sequential access to input lines.
  return {
    sourceData : inputData,
    currentIdx : 0,
    maxLines : inputData.length,

    hasMoreData : function(){
      return (this.currentIdx < this.maxLines);
    },

    getNextItem : function(){
      if(this.hasMoreData()){
        return this.sourceData[this.currentIdx++];
      } else {
        // Throws an error if an attempt is made to read beyond available input.
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function printResult(outputValue){
  // Outputs the given value to the console.
  console.log(outputValue);
}

function logDebugInfo(debugContent){
  // Logs debug information to the error stream, formatted for inspection.
  console.error('debug:' + require('util').inspect(debugContent, false, null));
}

function convertInput(inputValue, conversionType){
  // A versatile function to convert input values based on a specified type.
  try {
    switch(conversionType){
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
  } catch(error){
    // If an error occurs during conversion, the original input value is returned.
    return inputValue;
  }
}

function executeSolution(){
  var firstLineData = readIntegerArray();
  var nodeCount = firstLineData[0];
  var edgeCount = firstLineData[1];
  var blockCount = firstLineData[2];

  var disjointSet = createDisjointSet(nodeCount);
  var adjacencyInfo = {};

  // Initialize data structures for each node.
  for(var nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++){
    adjacencyInfo[nodeIndex] = {
      connectedNodes : new Set(), // Stores nodes directly connected by an 'ok' relationship.
      blockedNodes : new Set()    // Stores nodes directly blocked by an 'ng' relationship.
    };
  }

  // Process 'ok' relationships (friendships).
  for(var edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++){
    var tempValues = readIntegerArray();
    tempValues[0]--; // Convert to 0-based indexing.
    tempValues[1]--; // Convert to 0-based indexing.

    disjointSet.uniteSets(tempValues[0], tempValues[1]); // Union the sets of connected nodes.
    adjacencyInfo[tempValues[0]].connectedNodes.add(tempValues[1]);
    adjacencyInfo[tempValues[1]].connectedNodes.add(tempValues[0]);
  }

  // Process 'ng' relationships (blockages).
  for(var blockIndex = 0; blockIndex < blockCount; blockIndex++){
    var tempValues = readIntegerArray();
    tempValues[0]--; // Convert to 0-based indexing.
    tempValues[1]--; // Convert to 0-based indexing.

    adjacencyInfo[tempValues[0]].blockedNodes.add(tempValues[1]);
    adjacencyInfo[tempValues[1]].blockedNodes.add(tempValues[0]);
  }

  var finalCounts = new Array(nodeCount).fill(0);

  // Calculate the number of potential friends for each node.
  for(var nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++){
    // Start with the total size of the connected component,
    // then subtract the node itself and its direct 'ok' friends.
    finalCounts[nodeIndex] = disjointSet.getSetSize(nodeIndex) - adjacencyInfo[nodeIndex].connectedNodes.size - 1;

    var blockedNeighbors = Array.from(adjacencyInfo[nodeIndex].blockedNodes);
    for(var neighborIdx = 0; neighborIdx < blockedNeighbors.length; neighborIdx++){
      // If a blocked neighbor is in the same connected component, it cannot be a potential friend.
      if(disjointSet.areConnected(nodeIndex, blockedNeighbors[neighborIdx])){
        finalCounts[nodeIndex]--;
      }
    }
  }

  // Output the calculated counts, joined by spaces.
  printResult(convertInput(finalCounts, 8));
}

function createDisjointSet(numElements){
  // Implements a Disjoint Set Union (DSU) data structure with path compression and union by size.
  var dsu = {
    // The parentArray stores either the parent index (if positive)
    // or the negative size of the set (if negative, indicating a root).
    parentArray : new Array(numElements).fill(-1),

    // Checks if two elements belong to the same set (i.e., have the same root).
    areConnected : function(firstElement, secondElement){
      return this.findRoot(firstElement) === this.findRoot(secondElement);
    },

    // Finds the root (representative) of the set containing the given element.
    // Applies path compression by making every node on the path point directly to the root.
    findRoot : function(elementIndex){
      if(this.parentArray[elementIndex] < 0){
        return elementIndex; // This element is a root.
      } else {
        this.parentArray[elementIndex] = this.findRoot(this.parentArray[elementIndex]);
        return this.parentArray[elementIndex];
      }
    },

    // Unites the sets containing two given elements.
    // It performs union by size, attaching the smaller tree under the root of the larger tree.
    uniteSets : function(firstElement, secondElement){
      var firstRoot = this.findRoot(firstElement);
      var secondRoot = this.findRoot(secondElement);

      if(!this.areConnected(firstRoot, secondRoot)){ // Only unite if they are in different sets.
        if(this.parentArray[firstRoot] <= this.parentArray[secondRoot]){ // firstRoot's set is larger or equal in size.
          this.parentArray[firstRoot] += this.parentArray[secondRoot]; // Update the size of the new root.
          this.parentArray[secondRoot] = firstRoot; // Make firstRoot the parent of secondRoot.
        } else { // secondRoot's set is larger.
          this.parentArray[secondRoot] += this.parentArray[firstRoot]; // Update the size of the new root.
          this.parentArray[firstRoot] = secondRoot; // Make secondRoot the parent of firstRoot.
        }
      }
    },

    // Returns the size of the set containing the given element.
    // The size is stored as a negative value at the root of the set.
    getSetSize : function(elementIndex){
      return -this.parentArray[this.findRoot(elementIndex)];
    }
  };
  return dsu;
}
