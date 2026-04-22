let outputPrinter = console.log;
if (typeof process !== "undefined") {
    let dataAccumulator = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
        dataAccumulator += chunk;
    });
    process.stdin.on('end', () => {
        let inputSegments = dataAccumulator.split("\n");
        solutionEntry(inputSegments);
    });
}

function solutionEntry(inputSegments) {
    if (inputSegments.at(-1) === "") {
        inputSegments.pop();
    }

    let processedSegments = inputSegments.map((segment) =>
        segment.split(" ").map(Number)
    );

    let configurationLine = processedSegments.shift();
    let nodeCount = configurationLine[0];
    let linkCount = configurationLine[1];

    let adjacencies = new Map();
    for (let j = 0; j < nodeCount; j++) {
        adjacencies.set(j, new Set());
    }

    processedSegments.forEach((link) => {
        let n1 = link[0];
        let n2 = link[1];
        adjacencies.get(n1).add(n2);
        adjacencies.get(n2).add(n1);
    });

    let visitOrder = new Array(nodeCount).fill(-1);
    let minReachTime = new Array(nodeCount).fill(Number.MAX_SAFE_INTEGER);
    let exploredStatus = new Array(nodeCount).fill(false);
    let timeCounter = 0;
    let separationPoints = [];

    const recordBridge = (u, v) => {
        let sortedPair = [u, v].sort((a, b) => a - b);
        separationPoints.push(sortedPair);
    };

    const traverseGraph = (initialNode) => {
        let discoveryStack = [];

        discoveryStack.push({
            node: initialNode,
            parent: -1,
            adjList: Array.from(adjacencies.get(initialNode)),
            neighborIdx: 0
        });

        while (discoveryStack.length > 0) {
            let currentFrame = discoveryStack.at(-1);
            let u = currentFrame.node;
            let p = currentFrame.parent;

            if (!exploredStatus[u]) {
                exploredStatus[u] = true;
                visitOrder[u] = timeCounter;
                minReachTime[u] = timeCounter;
                timeCounter++;
            }

            let movedToChild = false;
            while (currentFrame.neighborIdx < currentFrame.adjList.length) {
                let v = currentFrame.adjList[currentFrame.neighborIdx];
                currentFrame.neighborIdx++;

                if (v === p) {
                    continue;
                }

                if (exploredStatus[v]) {
                    minReachTime[u] = Math.min(minReachTime[u], visitOrder[v]);
                } else {
                    discoveryStack.push({
                        node: v,
                        parent: u,
                        adjList: Array.from(adjacencies.get(v)),
                        neighborIdx: 0
                    });
                    movedToChild = true;
                    break;
                }
            }

            if (!movedToChild) {
                discoveryStack.pop();

                if (p !== -1) {
                    minReachTime[p] = Math.min(minReachTime[p], minReachTime[u]);
                    if (visitOrder[p] < minReachTime[u]) {
                        recordBridge(p, u);
                    }
                }
            }
        }
    };

    traverseGraph(0);

    let organizedBridges = new Array(nodeCount).fill(null).map(() => []);
    separationPoints.forEach(pair => {
        let u = pair[0];
        let v = pair[1];
        organizedBridges[u].push(v);
    });

    for (let s = 0; s < nodeCount; s++) {
        organizedBridges[s].sort((a, b) => b - a);
        for (let t of organizedBridges[s]) {
            outputPrinter(`${s} ${t}`);
        }
    }
}