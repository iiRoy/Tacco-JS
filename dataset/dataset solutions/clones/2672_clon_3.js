const fs = require('fs');

const convertToNumber = (strValue) => Number(strValue);

const rawInputContent = fs.readFileSync('/dev/stdin', 'utf8');
const allInputLines = rawInputContent.split("\n");

const firstLineData = allInputLines[0].split(" ").map(convertToNumber);

const totalNodes = firstLineData[0];
// const edgeCount = firstLineData[1]; // This variable was commented out in the original, so it's removed.
const initialNodeIdentifier = firstLineData[2]; // 'P' from original, unused but kept for structural similarity.

const graphEdgeDefinitions = allInputLines.slice(1).map(line => line.split(" ").map(convertToNumber));

const graphAdjacencyList = {};
for (let nodeIndex = 1; nodeIndex <= totalNodes; nodeIndex++) {
    graphAdjacencyList[nodeIndex] = [];
}

graphEdgeDefinitions.forEach(edgeDetails => {
    const sourceNode = edgeDetails[0];
    const targetNode = edgeDetails[1];
    const edgeWeight = edgeDetails[2];
    graphAdjacencyList[sourceNode].push([targetNode, edgeWeight]);
});

let maximumAchievableGain = -1;

const calculatePathTotalGain = (gainsArray) => gainsArray.reduce((accumulator, currentGain) => accumulator + currentGain, 0);

(() => {
    const currentPathNodesSequence = [1];
    const currentPathGainsSequence = [0];

    const pendingBranchStack = [];

    let activeBranchEdges = [...graphAdjacencyList[1]];

    do {
        if (activeBranchEdges.length === 0) {
            if (pendingBranchStack.length === 0) {
                return;
            }
            activeBranchEdges = pendingBranchStack.pop();
            currentPathNodesSequence.pop();
            currentPathGainsSequence.pop();
            continue;
        }

        const [nextNodeId, segmentGain] = activeBranchEdges.pop();

        if (nextNodeId === totalNodes) {
            const currentTotalGain = calculatePathTotalGain(currentPathGainsSequence) + segmentGain;
            maximumAchievableGain = Math.max(currentTotalGain, maximumAchievableGain);
        }

        const isNodeAlreadyVisitedInCurrentPath = currentPathNodesSequence.includes(nextNodeId);

        if (!isNodeAlreadyVisitedInCurrentPath) {
            const outgoingEdgesFromNextNode = graphAdjacencyList[nextNodeId];
            if (outgoingEdgesFromNextNode && outgoingEdgesFromNextNode.length > 0) {
                pendingBranchStack.push(activeBranchEdges);
                activeBranchEdges = [...outgoingEdgesFromNextNode];
                currentPathNodesSequence.push(nextNodeId);
                currentPathGainsSequence.push(segmentGain);
            }
        } else {
            console.log("loop detected");
        }

    } while (true);
})();

console.log(maximumAchievableGain);
