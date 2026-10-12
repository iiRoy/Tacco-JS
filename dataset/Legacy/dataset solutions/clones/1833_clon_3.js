"use strict";
const rawData = require("fs").readFileSync("/dev/stdin", "utf8");
const tokenBuffer = rawData.split(/ |\n/);
let tokenIndex = 0;

const readNum = () => +tokenBuffer[tokenIndex++];
const readStr = () => tokenBuffer[tokenIndex++];
const readBigInt = () => BigInt(tokenBuffer[tokenIndex++]);

const readValuesArray = (count, returnStrings) => {
  const startIndex = tokenIndex;
  tokenIndex += count;
  if (returnStrings) {
    return tokenBuffer.slice(startIndex, tokenIndex);
  } else {
    return tokenBuffer.slice(startIndex, tokenIndex).map(val => +val);
  }
};

const readMatrix = (height, width, returnStrings) => {
  const resultMatrix = [];
  let rowIdx = 0;
  if (returnStrings) {
    for (; rowIdx < height; rowIdx++) {
      resultMatrix.push(tokenBuffer.slice(tokenIndex, tokenIndex += width));
    }
  } else {
    for (; rowIdx < height; rowIdx++) {
      resultMatrix.push(tokenBuffer.slice(tokenIndex, tokenIndex += width).map(val => +val));
    }
  }
  return resultMatrix;
};

const createMultiDimArray = (initialValue) => {
  const args = arguments;
  const argCount = args.length;
  let evalString = "Array(args[" + (argCount - 1) + "]).fill().map(x=>{return " + initialValue + ";})";
  for (let i = argCount - 2; i > 0; i--) {
    evalString = "Array(args[" + i + "]).fill().map(x=>" + evalString + ")";
  }
  return eval(evalString);
};

const programOutput = executeLogic();
if (programOutput !== undefined) {
    console.log(programOutput);
}

function executeLogic(){
  const nodeCount = readNum();
  const nodeValues = readValuesArray(nodeCount + 1);
  
  if (nodeCount === 0) {
    const rootNodeValue = nodeValues[0];
    if (rootNodeValue === 1) {
      return 1;
    } else {
      return -1;
    }
  }
  
  const firstNodeValue = nodeValues[0];
  if (firstNodeValue !== 0) { // If nodeCount > 0, the root must have 0 nodes.
    return -1;
  }

  const maxPossibleNodes = 1e8 * nodeCount; // A large enough upper bound
  
  // dp1: minimum required nodes at each level to support the subtree below it
  let minRequiredNodes = Array(nodeCount + 1);
  minRequiredNodes[0] = 1; // Root level requires 1 node (the root itself)
  
  for (let levelIdx = 1; levelIdx <= nodeCount; ++levelIdx) {
    const prevLevelMin = minRequiredNodes[levelIdx - 1];
    const currentLevelValue = nodeValues[levelIdx];
    
    // Each node from the previous level can branch into 2 children
    let potentialMinFromPrev = prevLevelMin * 2;
    
    // Cap the potential minimum by the overall maxPossibleNodes
    minRequiredNodes[levelIdx] = Math.min(potentialMinFromPrev, maxPossibleNodes);
    
    // Subtract the actual nodes present at this level
    minRequiredNodes[levelIdx] = minRequiredNodes[levelIdx] - currentLevelValue;
    
    // If required nodes become negative, it's impossible
    if (minRequiredNodes[levelIdx] < 0) {
      return -1;
    }
  }
  
  // dp2: maximum available nodes at each level, considering the subtree above it
  let maxAvailableNodes = Array(nodeCount + 1);
  maxAvailableNodes[nodeCount] = 0; // No nodes available beyond the last level
  
  for (let levelIdx = nodeCount - 1; levelIdx >= 0; --levelIdx) {
    const nextLevelValue = nodeValues[levelIdx + 1];
    const nextLevelMaxAvailable = maxAvailableNodes[levelIdx + 1];
    
    // Max available nodes at current level is sum of nodes at next level and max available from next level
    maxAvailableNodes[levelIdx] = nextLevelMaxAvailable + nextLevelValue;
  }
  
  let totalSumOfNodes = 0n; // Use BigInt for the sum
  
  for (let levelIdx = 0; levelIdx <= nodeCount; ++levelIdx) {
    const currentMinRequired = minRequiredNodes[levelIdx];
    const currentMaxAvailable = maxAvailableNodes[levelIdx];
    const currentLevelNodeValue = nodeValues[levelIdx];
    
    // The actual number of nodes at this level is the minimum of required and available, plus existing nodes
    const nodesAtThisLevel = Math.min(currentMinRequired, currentMaxAvailable) + currentLevelNodeValue;
    totalSumOfNodes += BigInt(nodesAtThisLevel);
  }
  
  return totalSumOfNodes.toString();
}
