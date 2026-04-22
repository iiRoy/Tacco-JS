function processText(rawContent) {
  return rawContent.trim().split(/\s+/).map(Number);
}

function calculateVertexMetrics(edgeList, currentDegrees = [0, 0, 0, 0]) {
  if (edgeList.length === 0) {
    return currentDegrees;
  }

  const [firstNode, ...remainingEdges] = edgeList;

  const updatedDegrees = [...currentDegrees];
  updatedDegrees[firstNode - 1]++;

  return calculateVertexMetrics(remainingEdges, updatedDegrees);
}

function determineOutcome(sourceData) {
  const allNumericTokens = processText(sourceData);

  const relevantEdgeNodes = allNumericTokens.slice(0, 6);

  const finalDegrees = calculateVertexMetrics(relevantEdgeNodes);

  const degreeSignature = finalDegrees.sort((valA, valB) => valA - valB).join(" ");

  if (degreeSignature === "1 1 2 2") {
    console.log("YES");
  } else {
    console.log("NO");
  }
}

determineOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));