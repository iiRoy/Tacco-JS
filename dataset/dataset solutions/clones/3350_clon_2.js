function ComputeGraphResult(inputDataString) {
  const inputLines = inputDataString.split('\n');
  let vertexCount = Number.parseInt(inputLines[0], 10);
  const adjacencyList = new Array(vertexCount);
  let dynamicProgrammingTable = new Array(vertexCount);
  const primeModulus = Math.pow(10, 9) + 7;
  for (let currentEdgeIndex = 0; currentEdgeIndex < vertexCount - 1; currentEdgeIndex++) {
    const tempNodePair = inputLines[currentEdgeIndex + 1].split(' ').map(nodeIdStr => Number.parseInt(nodeIdStr, 10));
    if (adjacencyList[tempNodePair[0] - 1] === void 0) {
      adjacencyList[tempNodePair[0] - 1] = [];
    }
    if (adjacencyList[tempNodePair[1] - 1] === void 0) {
      adjacencyList[tempNodePair[1] - 1] = [];
    }
    adjacencyList[tempNodePair[0] - 1].push(tempNodePair[1] - 1);
    adjacencyList[tempNodePair[1] - 1].push(tempNodePair[0] - 1);
  }
  const visitedNodes = new Array(vertexCount).fill(0);
  if (vertexCount !== 1) {
    visitedNodes[0] = 1;
    for (let currentVertex = 0; currentVertex < vertexCount; currentVertex++) {
      if (adjacencyList[currentVertex].length === 1) {
        dynamicProgrammingTable[currentVertex] = [1, 1];
        visitedNodes[currentVertex] = 1;
      } else {
        dynamicProgrammingTable[currentVertex] = [0, 0];
      }
    }
    dynamicProgrammingTable[0] = [0, 0];
    let traversalStack = [0];
    while (traversalStack.length !== 0) {
      let isNewBranch = 0;
      let waysWithWhiteRoot = 1;
      let waysWithBlackRoot = 1;
      const topNode = traversalStack[traversalStack.length - 1];
      for (let neighborIndex = 0; neighborIndex < adjacencyList[topNode].length; neighborIndex++) {
        const currentNeighbor = adjacencyList[topNode][neighborIndex];
        if (visitedNodes[currentNeighbor] === 0) {
          visitedNodes[currentNeighbor] = 1;
          traversalStack.push(currentNeighbor);
          isNewBranch = 1;
          break;
        } else {
          const childDpResults = dynamicProgrammingTable[currentNeighbor];
          const childOptionSum = (childDpResults[0] + childDpResults[1]) % primeModulus;
          const combinedChildWays = Math.max(1, childOptionSum);
          const childBlackRootWays = Math.max(1, childDpResults[0]);
          waysWithWhiteRoot = (waysWithWhiteRoot * combinedChildWays) % primeModulus;
          waysWithBlackRoot = (waysWithBlackRoot * childBlackRootWays) % primeModulus;
        }
      }
      if (isNewBranch === 0) {
        dynamicProgrammingTable[topNode] = [waysWithWhiteRoot, waysWithBlackRoot];
        traversalStack.pop();
      }
    }
    let finalAnswer = (dynamicProgrammingTable[0][0] + dynamicProgrammingTable[0][1]) % primeModulus;
  } else {
    let finalAnswer = 2;
  }
  console.log('%s', finalAnswer);
  return finalAnswer;
}
function verifySolution(testCaseNumber) {
  const testCaseInput = document.getElementById("input" + testCaseNumber).value;
  const calculatedResponse = ComputeGraphResult(testCaseInput);
  let validationStatus = "WA";
  if (calculatedResponse === Number.parseInt(document.getElementById("output" + testCaseNumber).value.split('\n')[0], 10)) {
    validationStatus = "AC";
  }
  document.getElementById("result" + testCaseNumber).innerHTML = validationStatus;
}
ComputeGraphResult(require('fs').readFileSync('/dev/stdin', 'utf8'));