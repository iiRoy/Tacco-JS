const dataAcquisition = require('fs').readFileSync('/dev/stdin', 'utf8');

const rawDataLines = dataAcquisition.trim().split('\n');
const totalVertices = Number(rawDataLines.shift());

const connectionGraph = new Map();
for (let i = 0; i < totalVertices; i++) {
    const segmentParts = rawDataLines[i].split(' ').map(Number);
    const originVertex = segmentParts[0];
    const neighborCount = segmentParts[1]; // Not directly used in this implementation, but read
    const connectedNeighbors = segmentParts.slice(2);
    connectedNeighbors.sort((alpha, beta) => alpha - beta); // Ensure deterministic processing order
    connectionGraph.set(originVertex, connectedNeighbors);
}

const entryTimestamps = new Array(totalVertices + 1).fill(0);
const exitTimestamps = new Array(totalVertices + 1).fill(0);
const visitedFlags = new Array(totalVertices + 1).fill(false);

let momentCounter = 0;

for (let currentVertexId = 1; currentVertexId <= totalVertices; currentVertexId++) {
    if (!visitedFlags[currentVertexId]) {
        const processingStack = [];
        // Stack elements are objects: { identifier: number, stage: 'begin' | 'end' }
        processingStack.push({ identifier: currentVertexId, stage: 'begin' });

        while (processingStack.length > 0) {
            const currentOperation = processingStack.pop();
            const focusVertex = currentOperation.identifier;

            if (currentOperation.stage === 'begin') {
                if (visitedFlags[focusVertex]) {
                    continue; // Already processed through another path
                }
                visitedFlags[focusVertex] = true;
                momentCounter++;
                entryTimestamps[focusVertex] = momentCounter;

                // Push back to mark completion later
                processingStack.push({ identifier: focusVertex, stage: 'end' });

                // Push unvisited neighbors onto stack for discovery
                const adjacentNodes = connectionGraph.get(focusVertex) || [];
                // Push in reverse order to ensure smallest ID is processed first when popped
                for (let k = adjacentNodes.length - 1; k >= 0; k--) {
                    const neighborNode = adjacentNodes[k];
                    if (!visitedFlags[neighborNode]) {
                        processingStack.push({ identifier: neighborNode, stage: 'begin' });
                    }
                }
            } else if (currentOperation.stage === 'end') {
                momentCounter++;
                exitTimestamps[focusVertex] = momentCounter;
            }
        }
    }
}

const outputRecords = [];
for (let i = 1; i <= totalVertices; i++) {
    outputRecords.push(`${i} ${entryTimestamps[i]} ${exitTimestamps[i]}`);
}
console.log(outputRecords.join('\n'));