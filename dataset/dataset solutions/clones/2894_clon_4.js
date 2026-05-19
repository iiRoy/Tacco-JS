function processGraphData(inputData) {
    const inputSegments = inputData.split("\n");
    const nodeCount = Number(inputSegments.shift());

    const edgeDescriptions = inputSegments.slice(0, inputSegments.length - 1);
    const availableCostValues = inputSegments[inputSegments.length - 1]
                                .split(' ')
                                .map(Number)
                                .sort((valA, valB) => valA - valB);

    const currentDegrees = Array.from({ length: nodeCount + 1 }, () => 0);

    const parsedEdges = edgeDescriptions.map(edgeStr => edgeStr.split(' ').map(Number));

    parsedEdges.forEach(pair => {
        currentDegrees[pair[0]]++;
        currentDegrees[pair[1]]++;
    });

    const degreeRankings = Array.from({ length: nodeCount }, (_, idx) => ({
        identifier: idx + 1,
        degreeValue: currentDegrees[idx + 1]
    }));

    degreeRankings.sort((itemA, itemB) => itemA.degreeValue - itemB.degreeValue);

    const assignedNodeCosts = Array.from({ length: nodeCount + 1 });

    degreeRankings.forEach((rankedNode, index) => {
        assignedNodeCosts[rankedNode.identifier] = availableCostValues[index];
    });

    const totalMinimumEdgeCost = parsedEdges.reduce((accumulator, [nodeU, nodeV]) => {
        return accumulator + Math.min(assignedNodeCosts[nodeU], assignedNodeCosts[nodeV]);
    }, 0);

    const finalCostSequence = Array.from({ length: nodeCount }, (_, idx) => assignedNodeCosts[idx + 1]).join(' ');

    console.log(String(totalMinimumEdgeCost));
    console.log(finalCostSequence);
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
