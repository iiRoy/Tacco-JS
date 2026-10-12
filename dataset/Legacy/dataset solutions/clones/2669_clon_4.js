const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = rawInput.split("\n");

const firstLineValues = lines[0].split(" ").map(Number);
const initialNodeCount = firstLineValues[0];
const edgeCount = firstLineValues[1];
const targetNode = firstLineValues[2];

const adjacencyMap = new Map();

lines.forEach(lineStr => {
    let source, destination, weight;
    if (lineStr === "") {
        // Original behavior for an empty string line: "".split(" ") -> [""] -> [""] map (i-0) -> [0]
        // So an empty line results in an edge 0 -> 0 with weight 0.
        source = 0;
        destination = 0;
        weight = 0;
    } else {
        const parsedValues = lineStr.split(" ").map(Number);
        source = parsedValues[0];
        destination = parsedValues[1];
        weight = parsedValues[2];
    }
    
    if (!adjacencyMap.has(source)) {
        adjacencyMap.set(source, []);
    }
    adjacencyMap.get(source).push([destination, weight]);
});

let finalMaxGain = -1;

function depthFirstSearch(currentNode, currentAccumulatedGain, currentPathNodes) {
    currentPathNodes.add(currentNode);

    if (currentNode === targetNode) {
        finalMaxGain = Math.max(finalMaxGain, currentAccumulatedGain);
    }

    const neighbors = adjacencyMap.get(currentNode);

    // If 'neighbors' is undefined (meaning 'currentNode' has no outgoing edges and was not pre-initialized
    // in the 1..N-1 range), the original code would crash trying to access '.length'.
    // The 'for...of' loop will also throw a TypeError if 'neighbors' is undefined,
    // thus preserving the exact observable crash behavior.
    for (const [nextNeighbor, edgeWeight] of neighbors) {
        if (!currentPathNodes.has(nextNeighbor)) {
            depthFirstSearch(nextNeighbor, currentAccumulatedGain + edgeWeight, currentPathNodes);
        }
    }

    currentPathNodes.delete(currentNode);
}

depthFirstSearch(1, 0, new Set());

console.log(finalMaxGain);
