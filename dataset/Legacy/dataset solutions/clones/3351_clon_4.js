function processTreeColoring(rawData) {
  const lines = rawData.split("\n");
  const nodeCount = parseInt(lines[0]);
  const moduloVal = 1000000007;

  const adjList = Array.from({ length: nodeCount }, () => []);

  for (let k = 0; k < nodeCount - 1; k++) {
    const edgeInfo = lines[k + 1].split(" ").map(Number);
    const nodeA = edgeInfo[0] - 1;
    const nodeB = edgeInfo[1] - 1;
    adjList[nodeA].push(nodeB);
    adjList[nodeB].push(nodeA);
  }

  const memo = Array.from({ length: nodeCount }, () => null);

  function calculateSubtreeWays(currentNode, parentNode) {
    if (memo[currentNode] !== null) {
      return memo[currentNode];
    }

    let currentWhiteWays = 1;
    let currentBlackWays = 1;

    for (const neighborNode of adjList[currentNode]) {
      if (neighborNode === parentNode) {
        continue;
      }

      const [childWhite, childBlack] = calculateSubtreeWays(neighborNode, currentNode);

      const childTotalWays = (childWhite + childBlack) % moduloVal;
      const childWhiteOnlyWays = childWhite % moduloVal;

      currentWhiteWays = (currentWhiteWays * (childTotalWays || 1)) % moduloVal;
      currentBlackWays = (currentBlackWays * (childWhiteOnlyWays || 1)) % moduloVal;
    }

    memo[currentNode] = [currentWhiteWays, currentBlackWays];
    return memo[currentNode];
  }

  const [rootWhiteWays, rootBlackWays] = calculateSubtreeWays(0, -1);
  const finalResult = (rootWhiteWays + rootBlackWays) % moduloVal;

  console.log(finalResult);
  return finalResult;
}

processTreeColoring(require("fs").readFileSync("/dev/stdin", "utf8"));
