function InputReader(dataSource) {
 var instanceRef = this;
 instanceRef.currentPos = 0;
 instanceRef.originalText = dataSource;
 instanceRef.tokenArray = (function(rawData) {
  var parsedTokens = [];
  var cleanedData = rawData.replace(/[\n \t]+/g, " ");
  var splitParts = cleanedData.split(" ");
  for (var idx = 0, lengthVal = splitParts.length; idx < lengthVal; idx++) {
   parsedTokens.push(splitParts[idx]);
  }
  return parsedTokens;
 }(dataSource));
 instanceRef.getNextToken = function() {
  var retrievedValue = instanceRef.tokenArray[instanceRef.currentPos];
  instanceRef.currentPos++;
  return (retrievedValue !== undefined) ? retrievedValue : null;
 }
 instanceRef.getNextInteger = function() {
  var retrievedValue = instanceRef.tokenArray[instanceRef.currentPos];
  instanceRef.currentPos++;
  return (retrievedValue !== undefined) ? parseInt(retrievedValue, 10) : null;
 }
 instanceRef.getNextFloat = function() {
  var retrievedValue = instanceRef.tokenArray[instanceRef.currentPos];
  instanceRef.currentPos++;
  return (retrievedValue !== undefined) ? parseFloat(retrievedValue) : null;
 }
 instanceRef.getNextByteValue = function() {
  var retrievedValue = instanceRef.tokenArray[instanceRef.currentPos];
  instanceRef.currentPos++;
  return (retrievedValue !== undefined) ? new Int8Array([Number(retrievedValue)]) : null;
 }
}
function ProcessInput(readerService) {
 var nodeCount = readerService.getNextInteger();
 var finalResults = [];
 var nodeValuesMap = {};
 for (var k = 0; k < nodeCount; k++) {
  nodeValuesMap[k + 1] = readerService.getNextInteger();
 }
 var adjacencyList = {};
 for (var k = 0; k < nodeCount - 1; k++) {
  var firstNode = readerService.getNextInteger();
  var secondNode = readerService.getNextInteger();
  if (!adjacencyList[firstNode]) adjacencyList[firstNode] = [secondNode];
  else adjacencyList[firstNode].push(secondNode);
  if (!adjacencyList[secondNode]) adjacencyList[secondNode] = [firstNode];
  else adjacencyList[secondNode].push(firstNode);
 }
 var pathAccumulators = {};
 var traversalQueue = [];
 var traverseGraphNode = function(targetNodeId, parentNodeId) {
  var accumulatedPath = (pathAccumulators[parentNodeId]) ? pathAccumulators[parentNodeId] : "";
  accumulatedPath += (nodeValuesMap[targetNodeId] + ",");
  pathAccumulators[targetNodeId] = accumulatedPath;
  var connectedNodes = adjacencyList[targetNodeId];
  if (connectedNodes) {
   for (var m = 0; m < connectedNodes.length; m++) {
    var neighborNodeId = connectedNodes[m];
    if (!pathAccumulators[neighborNodeId]) {
     traversalQueue.push([neighborNodeId, targetNodeId]);
    }
   }
  }
 }
 traversalQueue.push([1, -1]);
 for (var safetyCounter = 0; safetyCounter < 10000000; safetyCounter++) {
  var currentTraversalPair = traversalQueue.shift();
  traverseGraphNode(currentTraversalPair[0], currentTraversalPair[1]);
  if (traversalQueue.length === 0) break;
 }
 return;
 for (var k = 1; k <= nodeCount; k++) {
  var currentPathValues = pathAccumulators[k].split(",");
  currentPathValues.pop();
  var longestIncreasingSubsequence = [];
  for (var m = 0; m < currentPathValues.length; m++) {
   var currentItem = currentPathValues[m];
   if (longestIncreasingSubsequence.length === 0) {
    longestIncreasingSubsequence.push(currentItem);
   } else if (currentItem > longestIncreasingSubsequence[longestIncreasingSubsequence.length - 1]) {
    longestIncreasingSubsequence.push(currentItem);
   } else if (currentItem <= longestIncreasingSubsequence[0]) {
    longestIncreasingSubsequence[0] = currentItem;
   } else {
    for (var p = 1; p < longestIncreasingSubsequence.length; p++) {
     if (longestIncreasingSubsequence[p - 1] < currentItem && currentItem <= longestIncreasingSubsequence[p]) {
      longestIncreasingSubsequence[p] = currentItem;
      break;
     }
    }
   }
  }
  finalResults.push(longestIncreasingSubsequence.length);
 }
 console.log(finalResults.join("\n"));
}
ProcessInput(new InputReader(require("fs").readFileSync("/dev/stdin", "utf8")));