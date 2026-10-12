const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let inputHandler;
const inputBuffer = [];

inputReader.on('line', (line) => {
  inputBuffer.push(line);
});

inputReader.on('close', () => {
  inputHandler = initializeInputProcessor(inputBuffer);
  console.error("\n");
  const startTime = Date.now();
  solveProblem();
  const endTime = Date.now() - startTime;
  logError("time : " + endTime + "ms");
  logError("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function createDeepCopy(sourceObject){
  return JSON.parse(JSON.stringify(sourceObject));
}

function readInteger(){ return processInputConversion(fetchNextLine(), 1); }
function readStringArray(){ return processInputConversion(fetchNextLine(), 2); }
function readIntegerArray(){ return processInputConversion(fetchNextLine(), 4); }
function readCharacterArray(){ return processInputConversion(fetchNextLine(), 6); }

function fetchNextLine(){ return inputHandler.fetchNext(); }
function hasMoreInput(){ return inputHandler.hasMore(); }

function initializeInputProcessor(lines){
  const processor = {
    lineList : lines,
    currentIndex : 0,
    maxLines : lines.length,
    hasMore : function(){ return (this.currentIndex < this.maxLines); },
    fetchNext : function(){
      if(!this.hasMore()){
        throw new Error("InputOutOfBoundsException: No more lines available for processing.");
      }
      const currentLine = this.lineList[this.currentIndex];
      this.currentIndex++;
      return currentLine;
    }
  };
  return processor;
}

function outputResult(data){ console.log(data); }
function logError(message){ console.error("debug:" + require("util").inspect(message, false, null)); }

function processInputConversion(inputString, conversionType){
  try {
    switch(conversionType){
      case 1: return parseInt(inputString, 10);
      case 2: return inputString.split(" ");
      case 4: return inputString.split(" ").map(Number);
      case 6: return inputString.split("");
      case 7: return inputString.split("").map(Number);
      case 8: return inputString.join(" ");
      case 9: return inputString.join("\n");
      case 0: return inputString.join("");
      default: return inputString;
    }
  } catch(e) {
    return inputString;
  }
}

function solveProblem(){
  const nmValues = readIntegerArray();
  const N = nmValues[0];
  const M = nmValues[1];

  const createNodeData = () => ({ childNodes: [], });
  const createGraphNodeInfo = () => ({
    parentSet : new Set(),
    isAccessed : false,
    pathDepth : 0
  });

  let adjList = Array.from({ length: N }, createNodeData);
  const graphData = Array.from({ length: N }, createGraphNodeInfo);

  const visitedStates = new Set();

  for(let i = 0; i < M; i++){
    const edgeData = readIntegerArray();
    const fromNode = edgeData[0] - 1;
    const toNode = edgeData[1] - 1;
    adjList[fromNode].childNodes.push(toNode);
  }

  const generateVisitedKey = (nodeIdentifier, currentPathDepth) => `${nodeIdentifier}:${currentPathDepth}`;
  const generateThreeStepPathKey = (initialNode, targetNode) => `${initialNode}:${targetNode}`;

  const explorePaths = (initialNode, currentPathNode, currentPathDepth) => {
    const stateKey = generateVisitedKey(currentPathNode, currentPathDepth);
    if(visitedStates.has(stateKey)){
      return;
    }
    visitedStates.add(stateKey);

    if(currentPathDepth === 3){
      graphData[currentPathNode].parentSet.add(initialNode);
      visitedStates.add(generateThreeStepPathKey(initialNode, currentPathNode));
      return;
    }

    const childrenNodes = adjList[currentPathNode].childNodes;
    for(const nextChildNode of childrenNodes){
      explorePaths(initialNode, nextChildNode, currentPathDepth + 1);
    }
  };

  for(let i = 0; i < N; i++){
    explorePaths(i, i, 0);
  }

  adjList = null;

  const startEndNodes = readIntegerArray();
  const startNode = startEndNodes[0] - 1;
  const targetNode = startEndNodes[1] - 1;

  let queueHeadIndex = 0;
  let queueTailIndex = 1;
  const bfsQueue = new Array(100007);
  bfsQueue[0] = targetNode;
  graphData[targetNode].isAccessed = true;

  let resultDepth = -1;

  while(queueHeadIndex !== queueTailIndex){
    const currentNode = bfsQueue[queueHeadIndex];
    queueHeadIndex++;

    if(currentNode === startNode){
      resultDepth = graphData[currentNode].pathDepth;
      break;
    }

    const parentNodes = Array.from(graphData[currentNode].parentSet);
    for(let i = 0; i < parentNodes.length; i++){
      const parentCandidate = parentNodes[i];
      if(!graphData[parentCandidate].isAccessed){
        graphData[parentCandidate].isAccessed = true;
        graphData[parentCandidate].pathDepth = graphData[currentNode].pathDepth + 1;
        bfsQueue[queueTailIndex] = parentCandidate;
        queueTailIndex++;
      }
    }
  }

  outputResult(resultDepth);
}
