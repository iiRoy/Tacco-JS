const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

const allLines = sourceData.split(/\r?\n/).filter(Boolean);
let currentLinkSet = {};

const obtainDegree = (vertexIdentifier) => (currentLinkSet[vertexIdentifier] || []).length;
const isDegreeOdd = (vertexIdentifier) => obtainDegree(vertexIdentifier) % 2 !== 0;

const establishConnection = (origin, terminus) => {
    if (!currentLinkSet[origin]) currentLinkSet[origin] = [];
    if (!currentLinkSet[terminus]) currentLinkSet[terminus] = [];
    currentLinkSet[origin].push(terminus);
};

const evaluateTopology = () => {
    const existingVertices = Object.keys(currentLinkSet).map(Number);
    const considerationSet = new Set(existingVertices);
    considerationSet.add(1);
    considerationSet.add(2);

    let oddDegreeCount = 0;
    let oneIsOdd = false;
    let twoIsOdd = false;
    
    for (const vtx of considerationSet) {
        if (isDegreeOdd(vtx)) {
            oddDegreeCount++;
            if (vtx === 1) oneIsOdd = true;
            if (vtx === 2) twoIsOdd = true;
        }
    }

    // The original code included a check for `totalNode % 2`.
    // `totalNode` was the sum of all degrees, which is always even in a graph.
    // Thus, `totalNode % 2` would always be 0, making the condition `if (totalNode % 2)` always false.
    // This branch was effectively dead code and never executed, so its omission here maintains equivalent functionality.

    if (oddDegreeCount === 0) {
        return true;
    } else if (oddDegreeCount === 2 && oneIsOdd && twoIsOdd) {
        return true;
    }
    return false;
};

const processInputRecursively = (lineIndex) => {
    if (lineIndex >= allLines.length) return;

    const currentLine = allLines[lineIndex];
    const [firstNode, secondNode] = currentLine.split(' ').map(Number);

    if (firstNode === 0 && secondNode === 0) {
        console.log(evaluateTopology() ? 'OK' : 'NG');
        currentLinkSet = {}; // Reset for the next graph
    } else {
        establishConnection(firstNode, secondNode);
        establishConnection(secondNode, firstNode); // For undirected graph
    }

    processInputRecursively(lineIndex + 1);
};

processInputRecursively(0);