var graphNodeCount = 0;
var graphEdgeCount = 0;
var edgeDefinitions = [];
var pathRecords = [];
var pathMemo = [];

function calculateSegmentCosts(startNode, endNode) {
  if (startNode === endNode) {
    return 0;
  }
  const directCostForSegment = getDirectEdgeCost(startNode, endNode);
  const remainingSegmentCost = calculateSegmentCosts(startNode + 1, endNode);
  return directCostForSegment + remainingSegmentCost;
}

function getDirectEdgeCost(nodeA, nodeB) {
  let currentEdgeCost = 0;
  let edgeFound = false;
  for (let edgeIndex = 0; edgeIndex < graphNodeCount; edgeIndex++) {
    if (edgeDefinitions[edgeIndex][0] === nodeA && edgeDefinitions[edgeIndex][1] === nodeB) {
      currentEdgeCost = edgeDefinitions[edgeIndex][2];
      edgeFound = true;
      break;
    }
  }
  return currentEdgeCost;
}

function Main(rawData) {
  const lines = rawData.split("\n");
  const firstLineParts = lines[0].split(" ");

  const initialNodeCount = parseInt(firstLineParts[0], 10);
  const initialEdgeCount = parseInt(firstLineParts[1], 10);

  graphNodeCount = initialNodeCount;
  graphEdgeCount = initialEdgeCount;

  edgeDefinitions = [];
  
  const parseLineOfNumbers = (lineContent) => lineContent.split(" ").map(val => parseInt(val, 10));

  for (let lineIndex = 1; lineIndex <= graphEdgeCount; lineIndex++) {
    const currentEdgeLine = lines[lineIndex];
    const parsedEdgeData = parseLineOfNumbers(currentEdgeLine);
    edgeDefinitions.push(parsedEdgeData);
  }

  pathRecords = [];
  let tempPathPairs = [];
  for (let i = 1; i <= graphNodeCount; i++) {
    for (let j = 1; j <= graphNodeCount; j++) {
      const isUniquePair = (i !== j) && (i < j);
      if (isUniquePair) {
        tempPathPairs.push([i, j, 0]);
      }
    }
  }
  pathRecords = tempPathPairs;
  
  pathMemo = pathRecords;
  
  for (let currentStartNode = 1; currentStartNode <= graphNodeCount; currentStartNode++) {
    for (let currentEndNode = 1; currentEndNode <= graphNodeCount; currentEndNode++) {
      const shouldProcessPair = (currentStartNode !== currentEndNode) && (currentStartNode < currentEndNode);
      if (shouldProcessPair) {
        const computedSegmentSum = calculateSegmentCosts(currentStartNode, currentEndNode);
        const directEdgeValue = getDirectEdgeCost(currentStartNode, currentEndNode);

        console.log("i=", currentStartNode, "j=", currentEndNode, "の最短値は");
        console.log("計算値=", computedSegmentSum);
        console.log("パラメータ=", directEdgeValue);
        // dp[i][j]=Math.min(tmp,RootSearch(i,j))
      }
    }
  }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
