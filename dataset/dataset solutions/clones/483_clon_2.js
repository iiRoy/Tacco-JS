var vertexCount, adjacencyMatrix, visitedNodes, degreeBalance;

function exploreSubgraph(currentNodeIndex) {
 visitedNodes[currentNodeIndex] = true;
 iterateRange(0, 26, function (neighborIndex) {
  if (adjacencyMatrix[currentNodeIndex][neighborIndex] && !visitedNodes[neighborIndex]) {
   exploreSubgraph(neighborIndex);
  }
 });
}

function processInputAndAnalyze() {
 while (true) {
  vertexCount = retrieveToken();
  if (!vertexCount) {
   break;
  }

  adjacencyMatrix = [];
  visitedNodes = [];
  degreeBalance = [];
  iterateRange(0, 26, function (idx) {
   adjacencyMatrix[idx] = [];
   degreeBalance[idx] = 0;
  });

  iterateRange(0, vertexCount, function () {
   var inputString = retrieveToken('string');
   var firstCharValue = inputString.charCodeAt(0) - 'a'.charCodeAt(0);
   var lastCharValue = inputString.charCodeAt(inputString.length - 1) - 'a'.charCodeAt(0);
   adjacencyMatrix[firstCharValue][lastCharValue] = adjacencyMatrix[lastCharValue][firstCharValue] = true;
   ++degreeBalance[firstCharValue];
   --degreeBalance[lastCharValue];
  });

  iterateRange(0, 26, function (nodeIdx) {
   var isIsolated = true;
   iterateRange(0, 26, function (otherNodeIdx) {
    isIsolated = !adjacencyMatrix[nodeIdx][otherNodeIdx] && isIsolated;
   });
   if (isIsolated) {
    visitedNodes[nodeIdx] = true;
   }
  });

  iterateRange(0, 26, function (nodeIndexToCheck) {
   if (!visitedNodes[nodeIndexToCheck]) {
    exploreSubgraph(nodeIndexToCheck);
    return false;
   }
  });

  var finalResult = true;
  iterateRange(0, 26, function (finalNodeIndex) {
   finalResult = visitedNodes[finalNodeIndex] && degreeBalance[finalNodeIndex] === 0 && finalResult;
  });

  displayOutput(finalResult ? 'OK' : 'NG');
 }
}

function iterateRange(startVal, endVal, callbackFunc) {
 if (callbackFunc == null) {
  callbackFunc = endVal;
  endVal = startVal;
  startVal = 0;
 }
 for (var loopIndex = startVal; loopIndex < endVal; ++loopIndex) {
  if (callbackFunc(loopIndex) === false) {
   break;
  }
 }
}

executionEnvironment.stdin.resume();
executionEnvironment.stdin.setEncoding('utf8');

var bufferedInput = '';
var currentReadPosition = 0;

function retrieveToken(tokenType) {
 if (tokenType === 'string') {
  return bufferedInput[currentReadPosition++];
 } else {
  return +bufferedInput[currentReadPosition++];
 }
}

function displayOutput(resultValue) {
 console.log(resultValue);
}

executionEnvironment.stdin.on('data', function (inputChunk) {
 bufferedInput += inputChunk;
});
executionEnvironment.stdin.on('end', function () {
 bufferedInput = bufferedInput.split(/\s+/);
 processInputAndAnalyze();
});