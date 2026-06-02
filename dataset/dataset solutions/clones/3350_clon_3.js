const MODULO_CONST = 1000000007;

const applyModulo = (value) => value % MODULO_CONST;
const addWithModulo = (a, b) => applyModulo(a + b);
const multiplyWithModulo = (a, b) => applyModulo(a * b);

const parseStringArrayToNumbers = (strArr) => strArr.map(Number);

function processGraphInput(rawInputData) {
  const inputLines = rawInputData.split("\n");
  const graphNodeCount = parseInt(inputLines[0]);

  const graphAdjacencyList = Array.from({ length: graphNodeCount }, () => []);
  const dpResultsTable = Array.from({ length: graphNodeCount }, () => [0, 0]);

  for (let edgeIndex = 0; edgeIndex < graphNodeCount - 1; edgeIndex++) {
    const edgeEndpoints = parseStringArrayToNumbers(inputLines[edgeIndex + 1].split(" "));
    const nodeU = edgeEndpoints[0] - 1;
    const nodeV = edgeEndpoints[1] - 1;

    graphAdjacencyList[nodeU].push(nodeV);
    graphAdjacencyList[nodeV].push(nodeU);
  }

  const nodeVisitedStatus = new Array(graphNodeCount).fill(false);
  let finalComputedResult;

  if (graphNodeCount === 1) {
    finalComputedResult = 2;
  } else {
    for (let i = 0; i < graphNodeCount; i++) {
      if (graphAdjacencyList[i].length === 1) {
        dpResultsTable[i] = [1, 1];
        nodeVisitedStatus[i] = true;
      }
    }

    dpResultsTable[0] = [0, 0];
    nodeVisitedStatus[0] = true;

    const dfsTraversalStack = [0];

    while (dfsTraversalStack.length > 0) {
      const currentNodeId = dfsTraversalStack[dfsTraversalStack.length - 1];
      let pushedNewChild = false;
      let currentWhiteProduct = 1;
      let currentBlackProduct = 1;

      for (let neighborIdx = 0; neighborIdx < graphAdjacencyList[currentNodeId].length; neighborIdx++) {
        const neighborNodeId = graphAdjacencyList[currentNodeId][neighborIdx];

        if (!nodeVisitedStatus[neighborNodeId]) {
          nodeVisitedStatus[neighborNodeId] = true;
          dfsTraversalStack.push(neighborNodeId);
          pushedNewChild = true;
          break;
        } else {
          const getChildContributions = (childNodeIndex) => {
            const childDp = dpResultsTable[childNodeIndex];
            const totalWaysChild = addWithModulo(childDp[0], childDp[1]);
            const waysBlackChild = childDp[0];
            return {
              whiteOption: Math.max(1, totalWaysChild),
              blackOption: Math.max(1, waysBlackChild)
            };
          };

          const childContributions = getChildContributions(neighborNodeId);
          currentWhiteProduct = multiplyWithModulo(currentWhiteProduct, childContributions.whiteOption);
          currentBlackProduct = multiplyWithModulo(currentBlackProduct, childContributions.blackOption);
        }
      }

      if (!pushedNewChild) {
        dpResultsTable[currentNodeId] = [currentWhiteProduct, currentBlackProduct];
        dfsTraversalStack.pop();
      }
    }
    finalComputedResult = addWithModulo(dpResultsTable[0][0], dpResultsTable[0][1]);
  }

  console.log('%s', finalComputedResult);
  return finalComputedResult;
}

processGraphInput(require("fs").readFileSync("/dev/stdin", "utf8"));
