var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var inputAccessor; var rawInputLines = [];
inputReader.on('line', function(incomingLine){rawInputLines.push(incomingLine);});
inputReader.on('close', function(){
  inputAccessor = initializeInputSystem(rawInputLines);
  console.error("\n");
  var beginTime = Date.now();
  processInputAndDisplayResult();
  var elapsedTime = Date.now() - beginTime;
  reportDiagnostic("duration : " + (elapsedTime) + "ms");
  reportDiagnostic("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function deepCopyObject(sourceObj){return JSON.parse(JSON.stringify(sourceObj));}
function acquireNumericValue(){return convertInputFormat(retrieveNextItem(),1);} function acquireStringArray(){return convertInputFormat(retrieveNextItem(),2);}
function acquireNumericArray(){return convertInputFormat(retrieveNextItem(),4);} function acquireCharacterArray(){return convertInputFormat(retrieveNextItem(),6);}
function retrieveNextItem(){return inputAccessor.fetchNextRow();} function checkAvailability(){return inputAccessor.hasMoreData();}
function initializeInputSystem(incomingLines){  
  return {
    dataRows : incomingLines, currentPosition : 0, totalRows : incomingLines.length,
    hasMoreData : function(){return (this.currentPosition < this.totalRows);},
    fetchNextRow : function(){if(this.hasMoreData()){return this.dataRows[this.currentPosition++];}else{throw "InputBoundaryException ‚No more input available";}}
  };
}
function displayResult(content){console.log(content);}
function reportDiagnostic(message){console.error("debug:" + require("util").inspect(message,false,null));}
//param "mode" is
//unknown or outlier : return i. 1: parseInt.
//2: split space. 4: split space and parseInt.
//6: split 1 character. 7: split 1 character and parseInt.
//8: join space. 9: join newline. 0: join no character.
function convertInputFormat(item,mode){try{switch(mode){case 1:return parseInt(item);case 2:return item.split(" ");case 4:return item.split(" ").map(Number);case 6:return item.split("");case 7:return item.split("").map(Number);case 8:return item.join(" ");case 9:return item.join("\n");case 0:return item.join("");default:return item;}}catch(e){return item;}}

// This function computes the edge identifier (label) based on the original's nested loop structure.
// It effectively calculates the 'count' value that would be assigned to list[original_i][original_j]
// in the original code, given the current 'original_i' and 'original_j' and 'maxDegree' (check).
function calcEdgeIdentifier(originalPrimaryIndex, originalSecondaryIndexOffset, maxDegree) {
  let identifier = 1;
  for (let p = 0; p < originalPrimaryIndex; p++) {
    identifier += (maxDegree - p);
  }
  identifier += (originalSecondaryIndexOffset - originalPrimaryIndex);
  return identifier;
}

function processInputAndDisplayResult(){
  var inputNumber = acquireNumericValue();
  var isTriangular = false;
  var groupSize = 0; // Represents 'k' in T_k = N

  // Check if inputNumber is a triangular number using a mathematical approach
  // N = k * (k + 1) / 2  => 2N = k^2 + k => k^2 + k - 2N = 0
  // Solve for k using quadratic formula: k = (-1 +/- sqrt(1 - 4 * 1 * (-2N))) / 2
  // k = (-1 + sqrt(1 + 8N)) / 2  (since k must be positive)
  var discriminant = 1 + 8 * inputNumber;
  var squareRootOfDiscriminant = Math.sqrt(discriminant);

  if (Number.isInteger(squareRootOfDiscriminant)) {
    var potentialGroupSize = (squareRootOfDiscriminant - 1) / 2;
    if (Number.isInteger(potentialGroupSize) && potentialGroupSize >= 0) {
      groupSize = potentialGroupSize;
      isTriangular = true;
    }
  }

  if (!isTriangular) {
    displayResult("No");
    return;
  }

  displayResult("Yes");
  var vertexCount = groupSize + 1;
  displayResult(vertexCount);

  // Instead of building a 2D array and then processing it,
  // directly generate each output line by calculating the required edge labels.
  var formattedOutputStrings = Array.from({ length: vertexCount }, (_, vertexIndex) => {
    const currentVertexLabels = [];
    for (let slotIndex = 0; slotIndex < groupSize; slotIndex++) {
      let labelToInsert;
      if (slotIndex < vertexIndex) {
        // This corresponds to an edge (slotIndex, vertexIndex)
        // This value was originally filled by list[j+1][i] where j+1=vertexIndex, i=slotIndex
        // So, original_i = slotIndex, original_j = vertexIndex - 1
        labelToInsert = calcEdgeIdentifier(slotIndex, vertexIndex - 1, groupSize);
      } else {
        // This corresponds to an edge (vertexIndex, slotIndex+1)
        // This value was originally filled by list[i][j] where i=vertexIndex, j=slotIndex
        // So, original_i = vertexIndex, original_j = slotIndex
        labelToInsert = calcEdgeIdentifier(vertexIndex, slotIndex, groupSize);
      }
      currentVertexLabels.push(labelToInsert);
    }
    return [groupSize, ...currentVertexLabels].join(" ");
  });

  displayResult(convertInputFormat(formattedOutputStrings, 9));
}