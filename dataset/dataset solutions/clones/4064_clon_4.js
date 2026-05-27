function Main(inputTxt) {
    const lines = inputTxt.split("\n");
    const [nodeCount, constraintCount] = lines[0].split(" ").map(Number);

    const adjacencyMap = new Array(nodeCount).fill(0).map(() => []);
    const initialConstraints = [];

    for (let k = 0; k < constraintCount; k++) {
        const [fromNodeRaw, toNodeRaw, difference] = lines[k + 1].split(" ").map(Number);
        const fromNode = fromNodeRaw - 1;
        const toNode = toNodeRaw - 1;

        adjacencyMap[fromNode].push({ target: toNode, delta: difference });
        adjacencyMap[toNode].push({ target: fromNode, delta: -difference });
        initialConstraints.push({ source: fromNode, destination: toNode, expectedDelta: difference });
    }

    const calculatedPositions = new Array(nodeCount).fill(null);
    let isConsistent = true;

    for (let startNode = 0; startNode < nodeCount; startNode++) {
        if (calculatedPositions[startNode] === null) {
            const processingQueue = [];

            calculatedPositions[startNode] = 0;
            processingQueue.push(startNode);

            let queuePointer = 0;
            while (queuePointer < processingQueue.length) {
                const currentNode = processingQueue[queuePointer++];

                for (const edge of adjacencyMap[currentNode]) {
                    const { target, delta } = edge;

                    if (calculatedPositions[target] === null) {
                        calculatedPositions[target] = calculatedPositions[currentNode] + delta;
                        processingQueue.push(target);
                    }
                }
            }
        }
    }

    for (const constraint of initialConstraints) {
        const { source, destination, expectedDelta } = constraint;
        if (calculatedPositions[destination] - calculatedPositions[source] !== expectedDelta) {
            isConsistent = false;
            break;
        }
    }

    console.log(isConsistent ? "Yes" : "No");
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
