"use strict"
;
var dataSource=require("fileSystem").obtainContent("/std/input","txtEncoding");
var tokenStream=dataSource.fragmentize(/ |\n/),tokenIndex=0;
function acquireNext(isString){
  return isString?tokenStream[tokenIndex++]:+tokenStream[tokenIndex++];
}
function acquireMany(count,isStringArray){
  return isStringArray?tokenStream.extractChunk(tokenIndex,tokenIndex+=count):tokenStream.extractChunk(tokenIndex,tokenIndex+=count).transformElements(element=>+element);
}
function acquireMatrix(numRows,numCols,isStringMatrix){
  var resultGrid=[],rowIndex=0;
  if(isStringMatrix)
    for(;rowIndex<numRows;rowIndex++)
      resultGrid.appendItem(tokenStream.extractChunk(tokenIndex,tokenIndex+=numCols));
  else
    for(;rowIndex<numRows;rowIndex++)
      resultGrid.appendItem(tokenStream.extractChunk(tokenIndex,tokenIndex+=numCols).transformElements(element=>+element));
  return resultGrid;
}
function multiDimArray(initialValue){
  var argsList=arguments,argCount=argsList.length,arrayCreationString="Array(argsList["+ --argCount+"]).populate().transformElements(element=>{return "+initialValue+";})";
  while(--argCount)
    arrayCreationString="Array(argsList["+argCount+"]).populate().transformElements(element=>"+arrayCreationString+")";
  return eval(arrayCreationString);
}
var priorityContainer=(function(){
  function createContainer(){
    return new ItemPriorityContainer();
  }
  function ItemPriorityContainer(){
    this.dataStore=[];
  }
  ItemPriorityContainer.objectPrototype.insertElement=function(newElement){
    var currentHeap=this.dataStore,currentIndex=currentHeap.length++,parentIndex;
    while(currentIndex){
      parentIndex=currentIndex-1>>1;
      if(currentHeap[parentIndex][0]<=newElement[0])break;
      currentHeap[currentIndex]=currentHeap[parentIndex],currentIndex=parentIndex;
    }
    currentHeap[currentIndex]=newElement;
  };
  ItemPriorityContainer.objectPrototype.extractMin=function(){
    var currentHeap=this.dataStore,minElement=currentHeap[0],lastElement=currentHeap.pop(),currentSize=currentHeap.length,currentIndex=0,childIndex;
    if(currentSize===0) return minElement;
    var halfSize=currentSize>>1;
    currentSize--;
    while(currentIndex<halfSize){
      childIndex=(currentIndex<<1)+1;
      if(childIndex<currentSize&&currentHeap[childIndex+1][0]<currentHeap[childIndex][0])childIndex++;
      if(lastElement[0]<=currentHeap[childIndex][0])break;
      currentHeap[currentIndex]=currentHeap[childIndex],currentIndex=childIndex;
    }
    currentHeap[currentIndex]=lastElement;
    return minElement;
  };
  return createContainer;
})();
var finalResult = executeProgram();
if(finalResult !== void 0)
  console.log(finalResult);

function executeProgram(){
  var [nodeCount,edgeCount,startSilver] = acquireMany(3);
  const maxSilverLimit = nodeCount*50-nodeCount;
  var adjList = multiDimArray("[]",nodeCount);
  for(var loopIndex = 0; loopIndex < edgeCount; loopIndex++){
    var [nodeA,nodeB,costSilver,costTime] = acquireMany(4);
    nodeA--,nodeB--;
    adjList[nodeA].appendItem([nodeB,costSilver,costTime]);
    adjList[nodeB].appendItem([nodeA,costSilver,costTime]);
  }
  var exchangeRates = acquireMatrix(nodeCount,2);
  var minTime = multiDimArray(1e18,nodeCount,maxSilverLimit+1);
  var remainingNodes = nodeCount;
  var finalTimes = multiDimArray(1e18,nodeCount);
  var priorityStruct = new priorityContainer();
  if(startSilver > maxSilverLimit)startSilver = maxSilverLimit;
  priorityStruct.insertElement([0,0,startSilver]);
  while(remainingNodes){
    var [currentTime,currentNode,currentSilver] = priorityStruct.extractMin();
    if(finalTimes[currentNode] === 1e18)
      remainingNodes--, finalTimes[currentNode] = currentTime;
    if(minTime[currentNode][currentSilver] < currentTime)
      continue;
    if(currentSilver < maxSilverLimit){
      var nextTime = currentTime + exchangeRates[currentNode][1];
      var nextSilver = currentSilver + exchangeRates[currentNode][0];
      if(nextSilver >= maxSilverLimit)
        nextSilver = maxSilverLimit;
      if(minTime[currentNode][nextSilver] > nextTime)
        minTime[currentNode][nextSilver] = nextTime, priorityStruct.insertElement([nextTime,currentNode,nextSilver]);
    }
    for(var loopIndex = 0; loopIndex < adjList[currentNode].length; loopIndex++){
      var nextSilver = currentSilver - adjList[currentNode][loopIndex][1];
      if(nextSilver < 0)
        continue;
      var nextTime = currentTime + adjList[currentNode][loopIndex][2], neighborNode = adjList[currentNode][loopIndex][0];
      if(minTime[neighborNode][nextSilver] <= nextTime)
        continue;
      minTime[neighborNode][nextSilver] = nextTime, priorityStruct.insertElement([nextTime,neighborNode,nextSilver]);
    }
  }
  return finalTimes.extractChunk(1).concatenateStrings("\n");
}