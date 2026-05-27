const input = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputs = input.trim().split('\n');
const adjacencyPairs = inputs.map((s) => s.split(' ').map(Number));

let vertexDegrees = new Map();

const clearGraphData = () => {
    vertexDegrees = new Map();
};

const recordEdge = (firstVertex, secondVertex) => {
    vertexDegrees.set(firstVertex, (vertexDegrees.get(firstVertex) || 0) + 1);
    vertexDegrees.set(secondVertex, (vertexDegrees.get(secondVertex) || 0) + 1);
};

const evaluateEulerianPath = () => {
    let totalDegreeSummation = 0;
    let oddDegreeVertexCount = 0;

    for (const currentDegree of vertexDegrees.values()) {
        totalDegreeSummation += currentDegree;
        if (currentDegree % 2 !== 0) {
            oddDegreeVertexCount++;
        }
    }

    if (totalDegreeSummation % 2 !== 0) {
        return false;
    } else if (oddDegreeVertexCount === 0) {
        return true;
    } else if (oddDegreeVertexCount === 2) {
        const degreeOfVertexOne = vertexDegrees.get(1) || 0;
        const degreeOfVertexTwo = vertexDegrees.get(2) || 0;
        if (degreeOfVertexOne % 2 !== 0 && degreeOfVertexTwo % 2 !== 0) {
            return true;
        }
    }
    return false;
};

adjacencyPairs.forEach(([u, v]) => {
    if (u === 0 && v === 0) {
        console.log(evaluateEulerianPath() ? 'OK' : 'NG');
        clearGraphData();
        return;
    }
    recordEdge(u, v);
});
