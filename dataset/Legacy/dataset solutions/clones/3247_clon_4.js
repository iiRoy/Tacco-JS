function ProcessGraphData(rawData) {
    const lineSegments = rawData.split("\n");

    const [nodeCount, edgeCount] = lineSegments[0].split(" ").map(Number);

    const sourceNodes = new Set();
    const targetNodes = new Set();

    for (let edgeIndex = 1; edgeIndex <= nodeCount - 1 + edgeCount; edgeIndex++) {
        const [sourceId, targetId] = lineSegments[edgeIndex].split(" ").map(Number);
        sourceNodes.add(sourceId);
        targetNodes.add(targetId);
    }

    const terminalNodes = [];
    let rootNodeCandidate = 0;

    for (let currentId = 1; currentId <= nodeCount; currentId++) {
        if (!sourceNodes.has(currentId)) {
            terminalNodes.push(currentId);
        }
        if (!targetNodes.has(currentId)) {
            rootNodeCandidate = currentId;
        }
    }

    console.log(terminalNodes, rootNodeCandidate);
}

ProcessGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
