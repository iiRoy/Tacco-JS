const inputConfig = { input: '/dev/stdin', newline: '\n' };

const fileContent = require('fs').readFileSync(inputConfig.input, 'ascii').trim();
const rawLines = fileContent.split(inputConfig.newline);

const [nodeCount, edgeCount] = rawLines[0].split(' ').map(Number);
const queryCount = Number(rawLines[edgeCount + 1].split(' ')[0]);

const parentArray = Array(nodeCount + 1).fill(0).map((_, idx) => idx);
const setSizes = Array(nodeCount + 1).fill(1);

function findSetRepresentative(memberNode) {
    if (parentArray[memberNode] === memberNode) {
        return memberNode;
    }
    parentArray[memberNode] = findSetRepresentative(parentArray[memberNode]);
    return parentArray[memberNode];
}

function uniteSets(firstNode, secondNode) {
    let rootA = findSetRepresentative(firstNode);
    let rootB = findSetRepresentative(secondNode);

    if (rootA !== rootB) {
        if (setSizes[rootA] < setSizes[rootB]) {
            parentArray[rootA] = rootB;
            setSizes[rootB] += setSizes[rootA];
        } else {
            parentArray[rootB] = rootA;
            setSizes[rootA] += setSizes[rootB];
        }
    }
}

for (let edgeIdx = 1; edgeIdx <= edgeCount; edgeIdx++) {
    const [u, v] = rawLines[edgeIdx].split(' ').map(Number);
    uniteSets(u, v);
}

for (let queryIdx = edgeCount + 2; queryIdx < (edgeCount + 2) + queryCount; queryIdx++) {
    const [queryNodeA, queryNodeB] = rawLines[queryIdx].split(' ').map(Number);
    const representativeA = findSetRepresentative(queryNodeA);
    const representativeB = findSetRepresentative(queryNodeB);
    console.log((representativeA === representativeB) ? 'yes' : 'no');
}
