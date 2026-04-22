let edgeList = [];

const addElement = (itemData) => {
    edgeList.push(itemData);
};

const pullSmallest = () => {
    if (edgeList.length === 0) {
        return null;
    }

    let minimumWeight = Infinity;
    let minimumIndex = -1;

    for (let currentIdx = 0; currentIdx < edgeList.length; currentIdx++) {
        const currentItem = edgeList[currentIdx];
        if (currentItem[1] < minimumWeight) {
            minimumWeight = currentItem[1];
            minimumIndex = currentIdx;
        }
    }

    const smallestElement = edgeList[minimumIndex];
    edgeList.splice(minimumIndex, 1);
    return smallestElement;
};


const ExecuteProgram = (rawData) => {
    const lines = rawData.split("\n");
    const vertexCount = parseInt(lines[0], 10);

    const adjacencyMatrix = Array.from({ length: vertexCount }, () => Array(vertexCount).fill(0));

    for (let r = 0; r < vertexCount; r++) {
        const rowData = lines[r + 1].split(" ").map(Number);
        for (let c = 0; c < vertexCount; c++) {
            adjacencyMatrix[r][c] = rowData[c + 1];
        }
    }

    const mstEdges = Array.from({ length: vertexCount }, () => Array(vertexCount).fill(-1));

    let visitedNodesCount = 1;
    const nodeVisitedStatus = Array(vertexCount).fill(false);
    nodeVisitedStatus[0] = true;

    for (let neighborIdx = 0; neighborIdx < vertexCount; neighborIdx++) {
        if (adjacencyMatrix[0][neighborIdx] > -1) {
            const edgeDetails = [neighborIdx, adjacencyMatrix[0][neighborIdx], 0];
            addElement(edgeDetails);
        }
    }

    while (visitedNodesCount < vertexCount) {
        const closestEdge = pullSmallest();

        if (closestEdge === null) {
            break;
        }

        const targetVertex = closestEdge[0];
        const edgeCost = closestEdge[1];
        const sourceVertex = closestEdge[2];

        if (nodeVisitedStatus[targetVertex]) {
            continue;
        }

        nodeVisitedStatus[targetVertex] = true;
        mstEdges[targetVertex][sourceVertex] = mstEdges[sourceVertex][targetVertex] = edgeCost;
        visitedNodesCount++;

        for (let neighborIdx = 0; neighborIdx < vertexCount; neighborIdx++) {
            if (adjacencyMatrix[targetVertex][neighborIdx] > -1) {
                const edgeDetails = [neighborIdx, adjacencyMatrix[targetVertex][neighborIdx], targetVertex];
                addElement(edgeDetails);
            }
        }
    }

    let totalWeight = 0;

    for (let r = 0; r < vertexCount; r++) {
        for (let c = 0; c < vertexCount; c++) {
            if (r < c && mstEdges[r][c] > -1) {
                totalWeight += mstEdges[r][c];
            }
        }
    }
    console.log(totalWeight);
};

ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));