const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
const [nodeCount, edgeCount] = rawData[0].split(' ').map(Number);
const elevationData = rawData[1].split(' ').map(Number);
const connectionStrings = rawData.slice(2, 2 + edgeCount);

const potentialPeaks = new Set(Array.from({ length: nodeCount }, (_, idx) => idx));

connectionStrings.forEach(linkStr => {
    const [firstNode, secondNode] = linkStr.split(' ').map(val => Number(val) - 1);
    const heightA = elevationData[firstNode];
    const heightB = elevationData[secondNode];

    if (heightA <= heightB) {
        potentialPeaks.delete(firstNode);
    }
    if (heightB <= heightA) {
        potentialPeaks.delete(secondNode);
    }
});

console.log(potentialPeaks.size);
