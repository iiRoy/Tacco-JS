function processInputAndCalculate(){
  const firstLineNumbers = retrieveIntArray();
  const vertexCount = firstLineNumbers[0];
  const maxColors = firstLineNumbers[1];

  const adjacencyMap = new Map();
  const visitedStatus = new Map();
  const colorAssignment = new Map();

  for (let nodeIdentifier = 0; nodeIdentifier < vertexCount; nodeIdentifier++){
    adjacencyMap.set(nodeIdentifier, []);
    visitedStatus.set(nodeIdentifier, false);
    colorAssignment.set(nodeIdentifier, 0);
  }

  for (let edgeIndex = 0; edgeIndex < vertexCount - 1; edgeIndex++){
    const edgeEndpoints = retrieveIntArray();
    const nodeA = edgeEndpoints[0] - 1;
    const nodeB = edgeEndpoints[1] - 1;
    adjacencyMap.get(nodeA).push(nodeB);
    adjacencyMap.get(nodeB).push(nodeA);
  }

  const modulusValue = 1000000007;

  function traverseAndAssignColors(currentNodeId, parentOfCurrentId, parentInfluenceForCurrent, assignedColorForCurrent, totalColorLimit){
    visitedStatus.set(currentNodeId, true);
    colorAssignment.set(currentNodeId, assignedColorForCurrent);

    let influenceForChildren = parentInfluenceForCurrent;
    if (influenceForChildren < 2){
      influenceForChildren++;
    }

    let childrenProcessedCount = 0;
    const connectedNodes = adjacencyMap.get(currentNodeId);

    for (const connectedChildId of connectedNodes){
      if (connectedChildId !== parentOfCurrentId && !visitedStatus.get(connectedChildId)){
        const colorsAvailableForChild = totalColorLimit - childrenProcessedCount - influenceForChildren;
        traverseAndAssignColors(
          connectedChildId,
          currentNodeId,
          influenceForChildren,
          colorsAvailableForChild,
          totalColorLimit
        );
        childrenProcessedCount++;
      }
    }
  }

  traverseAndAssignColors(0, -1, 0, maxColors, maxColors);

  let finalResultProduct = 1;
  for (let nodeIdentifier = 0; nodeIdentifier < vertexCount; nodeIdentifier++){
    finalResultProduct = (finalResultProduct * colorAssignment.get(nodeIdentifier)) % modulusValue;
  }

  displayOutput(finalResultProduct);
}

// Don't have to see. start------------------------------------------
var read = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var obj; var inLine = [];
read.on('line', function(input){inLine.push(input);});
read.on('close', function(){
  obj = initializeInput(inLine);
  console.error('\n↑入力 ↓出力');
  processInputAndCalculate();
});
function duplicateObject(inputObject){return (inputObject instanceof Set) ? new Set(Array.from(inputObject)) : JSON.parse(JSON.stringify(inputObject));}
function retrieveInt(){return convertInput(retrieveNext(),1);}
function retrieveStrArray(){return convertInput(retrieveNext(),2);}
function retrieveIntArray(){return convertInput(retrieveNext(),4);}
function retrieveCharArray(){return convertInput(retrieveNext(),6);}
function retrieveNext(){return obj.next();}
function hasMoreInput(){return obj.hasNext();}
function initializeInput(inputData){
  return {
    sourceList : inputData, pointer : 0, limit : inputData.length,
    hasNext : function(){return (this.pointer < this.limit);},
    next : function(){if(this.hasNext()){return this.sourceList[this.pointer++];}else{throw 'InputBoundaryException ‚No more entries';}}
  };
}
function displayOutput(message){console.log(message);}
function displayDebug(content){console.error('debug:' + require('util').inspect(content,false,null));}
function convertInput(data,kind){try{switch(kind){case 1:return parseInt(data);case 2:return data.split(' ');case 4:return data.split(' ').map(Number);case 6:return data.split('');case 7:return data.split('').map(Number);case 8:return data.join(' ');case 9:return data.join('\n');case 0:return data.join('');default:return data;}}catch(e){return data;}}
// Don't have to see. end------------------------------------------