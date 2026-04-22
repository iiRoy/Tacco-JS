let incomingDataAccumulator = '';
let processedInputLines = [];

process.stdin.on('data', segment => {
    incomingDataAccumulator += segment.toString();
});

process.stdin.on('end', () => {
    processedInputLines = incomingDataAccumulator.split('\n').filter(line => line.length > 0);
    
    const operationStart = Date.now();
    performCoreLogic();
    const operationEnd = Date.now();

    reportDiagnostic("Duration: " + (operationEnd - operationStart) + "ms");
    reportDiagnostic("Memory Footprint: " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

let lineCursor = 0;
const extractInteger = () => parseInt(processedInputLines[lineCursor++], 10);
const extractCharacterArray = () => processedInputLines[lineCursor++].split('');

const displayResult = val => console.log(val);
const reportDiagnostic = msg => console.error("debugInfo:" + JSON.stringify(msg));

function performCoreLogic() {
    const totalVertexCount = extractInteger();
    
    // Graph representation: maps each vertex to a Set of its direct connections
    const adjacencyLists = Array.from({ length: totalVertexCount }, () => new Set());
    
    // Populate the adjacency lists based on the input matrix
    Array.from({ length: totalVertexCount }).forEach((_, currentVertexIndex) => {
        const matrixRowData = extractCharacterArray();
        matrixRowData.forEach((charValue, connectedVertexIndex) => {
            if (currentVertexIndex !== connectedVertexIndex && charValue === "1") {
                adjacencyLists[currentVertexIndex].add(connectedVertexIndex);
            }
        });
    });

    let calculatedMaxPath = -1;
    
    // Search for a suitable starting node for the breadth-first traversal
    // A suitable node is one with exactly one connection
    const initialTraversalCandidateIndex = Array.from({ length: totalVertexCount }).findIndex((_, idx) =>
        adjacencyLists[idx].size === 1
    );

    if (initialTraversalCandidateIndex !== -1) {
        const visitedFlags = Array(totalVertexCount).fill(false);
        const vertexDistances = Array(totalVertexCount).fill(0); // 0 signifies unvisited/unassigned distance

        let currentWavefront = [initialTraversalCandidateIndex];
        visitedFlags[initialTraversalCandidateIndex] = true;
        vertexDistances[initialTraversalCandidateIndex] = 1; // The starting node is at distance 1

        let maximumDistanceAchieved = 1; 

        // Execute a level-by-level Breadth-First Search (BFS)
        while (currentWavefront.length > 0) {
            const nextWavefront = [];
            for (const activeVertex of currentWavefront) {
                const currentVertexDistance = vertexDistances[activeVertex];
                maximumDistanceAchieved = Math.max(maximumDistanceAchieved, currentVertexDistance);

                for (const connectedNeighbor of adjacencyLists[activeVertex]) {
                    if (!visitedFlags[connectedNeighbor]) {
                        visitedFlags[connectedNeighbor] = true;
                        vertexDistances[connectedNeighbor] = currentVertexDistance + 1;
                        nextWavefront.push(connectedNeighbor);
                    }
                }
            }
            currentWavefront = nextWavefront;
        }
        calculatedMaxPath = maximumDistanceAchieved;

        // Validate the structure: check if any two nodes at the same distance are directly connected
        const structuralIntegrityIssue = Array.from({ length: totalVertexCount }).some((_, firstNodeIdx) =>
            Array.from({ length: totalVertexCount }).some((_, secondNodeIdx) => {
                // Ensure we only check unique pairs and avoid self-comparison
                if (firstNodeIdx >= secondNodeIdx) return false; 

                // Both nodes must have been reached by BFS (distance > 0)
                // They must be at the same distance AND be directly connected
                return vertexDistances[firstNodeIdx] > 0 && vertexDistances[secondNodeIdx] > 0 &&
                       vertexDistances[firstNodeIdx] === vertexDistances[secondNodeIdx] &&
                       (adjacencyLists[firstNodeIdx].has(secondNodeIdx) || adjacencyLists[secondNodeIdx].has(firstNodeIdx));
            })
        );

        if (structuralIntegrityIssue) {
            calculatedMaxPath = -1;
        }
    }
    
    displayResult(calculatedMaxPath);
}