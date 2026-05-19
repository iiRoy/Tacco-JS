((inputContent) => {
  const inputParts = inputContent.split('\n')[0].split(' ');
  const nodeCount = Number(inputParts[0]);
  const targetK = Number(inputParts[1]);

  const maxPairsViaOne = (nodeCount - 2) * (nodeCount - 1) / 2;

  const outputSegments = [];

  const isInvalidScenario = nodeCount <= 2 || nodeCount > maxPairsViaOne;

  if (isInvalidScenario) {
    outputSegments.push('-1');
  } else {
    const constructedEdges = [];

    for (let primaryNodeIndex = 0; primaryNodeIndex < nodeCount - 1; primaryNodeIndex++) {
      constructedEdges.push([1, primaryNodeIndex + 2]);
    }

    const reductionEdgeCount = maxPairsViaOne - targetK;

    if (reductionEdgeCount > 0) {
      for (let secondaryNodeIndex = 0; secondaryNodeIndex < reductionEdgeCount; secondaryNodeIndex++) {
        constructedEdges.push([secondaryNodeIndex + 2, secondaryNodeIndex + 3]);
      }
    }

    outputSegments.push(constructedEdges.length.toString());
    for (const currentEdgePair of constructedEdges) {
      outputSegments.push(`${currentEdgePair[0]} ${currentEdgePair[1]}`);
    }
  }

  console.log(outputSegments.join('\n'));
})(
  require("fs").readFileSync("/dev/stdin", "utf8")
);
