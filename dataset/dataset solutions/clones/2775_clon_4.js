"use strict";
(function(dataStream){
  let parsedNumbers = dataStream.trim().split(/\s+/).map(val => Number(val));
  const nodeCount = parsedNumbers.shift();
  const factorBase = parsedNumbers.shift();
  const moduloVal = 1000000007;

  const adjacencyList = Array.from({ length: nodeCount + 1 }, () => []);
  const heights = Array(nodeCount + 1).fill(-1);

  adjacencyList[0].push(1);
  adjacencyList[1].push(0);

  while (parsedNumbers.length > 0) {
    const edgeB = parsedNumbers.pop();
    const edgeA = parsedNumbers.pop();
    adjacencyList[edgeA].push(edgeB);
    adjacencyList[edgeB].push(edgeA);
  }

  function computeNodeHeights(currentId, parentId, currentDepth) {
    heights[currentId] = currentDepth;
    for (const neighborId of adjacencyList[currentId]) {
      if (neighborId !== parentId) {
        computeNodeHeights(neighborId, currentId, currentDepth + 1);
      }
    }
  }
  computeNodeHeights(0, -1, 0);

  function calculateSubtreeProduct(currentId, parentId) {
    let currentProduct = 1;
    const currentHeight = heights[currentId];

    const baseValue = (currentHeight < 2) ? (factorBase - currentHeight) : (factorBase - 2);

    const childrenNodes = adjacencyList[currentId].filter(neighborId => neighborId !== parentId);
    const childCount = childrenNodes.length;

    for (let i = 0; i < childCount; i++) {
      currentProduct = (currentProduct * (baseValue - i)) % moduloVal;
    }

    for (const childId of childrenNodes) {
      currentProduct = (currentProduct * calculateSubtreeProduct(childId, currentId)) % moduloVal;
    }

    return currentProduct;
  }

  const finalProduct = calculateSubtreeProduct(0, -1);

  console.log(finalProduct);

})(require("fs").readFileSync("/dev/stdin","utf8"));
