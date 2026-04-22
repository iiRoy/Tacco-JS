const fileSystem = require('fs');

function processGraphData() {
    const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
    const inputLines = rawInput.trim().split('\n');

    const graphSize = Number(inputLines[0]);
    const adjacencyStructure = Array(graphSize).fill(null).map(() => []);

    for (let i = 1; i < inputLines.length; ++i) {
        const edgeDetails = inputLines[i].split(' ').map(Number);
        const firstVertex = edgeDetails[0] - 1; 
        const secondVertex = edgeDetails[1] - 1; 
        const connectionWeight = edgeDetails[2];

        adjacencyStructure[firstVertex].push([secondVertex, connectionWeight]);
        adjacencyStructure[secondVertex].push([firstVertex, connectionWeight]);
    }

    const vertexHues = Array(graphSize).fill(null); 

    function exploreGraph(currentVertex, currentHue) {
        vertexHues[currentVertex] = currentHue;

        for (const [linkedVertex, pathWeight] of adjacencyStructure[currentVertex]) {
            if (vertexHues[linkedVertex] === null) {
                const nextHue = (currentHue + pathWeight) % 2;
                exploreGraph(linkedVertex, nextHue);
            }
        }
    }

    exploreGraph(0, 0); 

    for (let i = 0; i < graphSize; ++i) {
        console.log(String(vertexHues[i]));
    }
}

processGraphData();