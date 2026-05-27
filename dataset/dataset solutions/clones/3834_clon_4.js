const fs = require('fs');
const inputData = fs.readFileSync('/dev/stdin', 'utf8').split('\n');
let currentLineIndex = 0;

const readNextLine = () => inputData[currentLineIndex++].trim();
const parseNumbers = () => readNextLine().split(' ').map(Number);

const [nodeCount, edgeCount] = parseNumbers();
const targetNodes = parseNumbers();

const connections = [];
while (currentLineIndex < inputData.length && inputData[currentLineIndex].trim() !== '') {
    connections.push(parseNumbers());
}

const parentArr = Array(nodeCount + 1);
const setSizes = Array(nodeCount + 1);

function initializeDisjointSetUnion() {
    for (let k = 1; k <= nodeCount; k++) {
        parentArr[k] = k;
        setSizes[k] = 1;
    }
}

function findSetRepresentative(nodeIdentifier) {
    if (parentArr[nodeIdentifier] === nodeIdentifier) {
        return nodeIdentifier;
    }
    return parentArr[nodeIdentifier] = findSetRepresentative(parentArr[nodeIdentifier]);
}

function mergeSets(nodeA, nodeB) {
    let rootA = findSetRepresentative(nodeA);
    let rootB = findSetRepresentative(nodeB);

    if (rootA !== rootB) {
        if (setSizes[rootA] < setSizes[rootB]) {
            [rootA, rootB] = [rootB, rootA];
        }
        parentArr[rootB] = rootA;
        setSizes[rootA] += setSizes[rootB];
        return true;
    }
    return false;
}

initializeDisjointSetUnion();

for (const [u, v] of connections) {
    mergeSets(u, v);
}

const finalScores = Array(nodeCount + 1).fill(0);

for (let currentIdx = 1; currentIdx <= nodeCount; currentIdx++) {
    if (findSetRepresentative(currentIdx) === findSetRepresentative(targetNodes[currentIdx - 1])) {
        finalScores[currentIdx] = 1;
    }
}

let totalScore = 0;
for (let k = 1; k <= nodeCount; k++) {
    totalScore += finalScores[k];
}

console.log(totalScore);
