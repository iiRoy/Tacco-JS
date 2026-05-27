var createInputReader = (function(){
  function createReaderInstance(sourceString){
    return new InputReader(sourceString);
  }

  function InputReader(sourceString){
    this.sourceLines = sourceString.trim().split("\n");
    this.currentLineIndex = 0;
  }

  InputReader.prototype.readNextValue = function(returnAsString){
    var lines = this.sourceLines;
    var lineIdx = this.currentLineIndex;
    var currentLineParts;

    if(typeof lines[lineIdx] === "string") {
        lines[lineIdx] = lines[lineIdx].split(" ").reverse();
    }
    currentLineParts = lines[lineIdx];
    var extractedValue = currentLineParts.pop();

    if(!currentLineParts.length) {
        this.currentLineIndex++;
    }
    return returnAsString ? extractedValue : +extractedValue;
  };

  InputReader.prototype.readLine = function(returnAsStrings){
    var lineContent = this.sourceLines[this.currentLineIndex++].split(" ");
    return returnAsStrings ? lineContent : lineContent.map(item => +item);
  };

  InputReader.prototype.readMatrix = function(numRows, returnAsStrings){
    var matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numRows).map(rowStr => rowStr.split(" "));
    this.currentLineIndex += numRows;
    return returnAsStrings ? matrixRows : matrixRows.map(row => row.map(item => +item));
  };

  InputReader.prototype.readRawLines = function(numLines, returnAsStrings){
    var rawLines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
    this.currentLineIndex += numLines;
    return returnAsStrings ? rawLines : rawLines.map(item => +item);
  };

  return createReaderInstance;
})();

var inputParser = createInputReader(require("fs").readFileSync("/dev/stdin","utf8"));

function createMultiDimArray(initialValue){
  var args = arguments;
  var argCount = args.length;
  var currentDimIndex = --argCount;
  var evalString = `Array(args[${currentDimIndex}]).fill(0).map(x=>{return ${initialValue};})`;

  while(--currentDimIndex) {
      evalString = `Array(args[${currentDimIndex}]).fill(0).map(x=>${evalString})`;
  }
  return eval(evalString);
}

var bellmanFordAlgorithmFactory = (function(){
  var POSITIVE_INFINITY_WEIGHT = 1e9; // Renamed INF

  function createBellmanFordSolver(graphData, startNode){
    return new BellmanFordSolver(graphData, startNode);
  }

  function BellmanFordSolver(graphData, startNode){
    var numNodes = graphData.length;
    var maxIterations = numNodes * 2; // Original: n << 1, changed to explicit multiplication
    var distances = Array(numNodes).fill(POSITIVE_INFINITY_WEIGHT);
    distances[startNode] = 0;

    this.shortestDistances = distances; // Renamed 'd' to 'shortestDistances'

    for(var iteration = 0; iteration < maxIterations; iteration++){
      var updatedInThisIteration = false; // Added helper variable for clarity
      for(var currentNode = 0; currentNode < numNodes; currentNode++){
        if(distances[currentNode] === POSITIVE_INFINITY_WEIGHT) {
            continue;
        }
        var edgesFromCurrentNode = graphData[currentNode];
        for(var edgeIndex = 0; edgeIndex < edgesFromCurrentNode.length; edgeIndex++){
          var currentEdge = edgesFromCurrentNode[edgeIndex];
          var targetNode = currentEdge.to; // Added helper variable
          var edgeCost = currentEdge.cost; // Added helper variable
          var newDistance = distances[currentNode] + edgeCost; // Added helper variable

          if(distances[targetNode] > newDistance){
            updatedInThisIteration = true;
            if(iteration >= numNodes - 1) {
                // If relaxation still occurs in the N-th iteration or beyond,
                // it indicates a negative cycle reachable from the start node.
                distances[targetNode] = -POSITIVE_INFINITY_WEIGHT;
            } else {
                distances[targetNode] = newDistance;
            }
          }
        }
      }
      // Note: An optimization to break early if !updatedInThisIteration could be added,
      // but the original code runs for n*2 iterations to correctly propagate -INF for negative cycles.
      // Preserving the original iteration count for strict behavioral equivalence.
    }
  }

  BellmanFordSolver.prototype.getDistance = function(nodeIndex){ // Renamed 'dist' to 'getDistance'
    return this.shortestDistances[nodeIndex];
  };

  return createBellmanFordSolver;
})();

console.log(executeMainLogic()); // Renamed 'main' to 'executeMainLogic'

function executeMainLogic(){
  var numNodes = inputParser.readNextValue();
  var numEdges = inputParser.readNextValue();
  var profitPerEdge = inputParser.readNextValue();

  var adjacencyList = createMultiDimArray("[]", numNodes); // Renamed 'graph' to 'adjacencyList'

  for(var i = 0; i < numEdges; i++){
    var edgeDetails = inputParser.readLine(); // Renamed 't' to 'edgeDetails'
    var fromNode = edgeDetails[0] - 1; // Renamed 'a' to 'fromNode'
    var toNode = edgeDetails[1] - 1;   // Renamed 'b' to 'toNode'
    var baseCost = edgeDetails[2];     // Renamed 'c' to 'baseCost'

    var effectiveCost = profitPerEdge - baseCost; // Added helper variable
    adjacencyList[fromNode].push({to: toNode, cost: effectiveCost});
  }

  var pathFinder = bellmanFordAlgorithmFactory(adjacencyList, 0); // Renamed 'bf' to 'pathFinder'
  var finalDestinationNode = numNodes - 1; // Added helper variable for clarity

  var shortestPathToDestination = pathFinder.getDistance(finalDestinationNode); // Added helper variable

  if(shortestPathToDestination === -1e9) { // Using the constant value directly for comparison
      return -1;
  }
  if(shortestPathToDestination >= 0) {
      return 0;
  }
  return -shortestPathToDestination;
}
