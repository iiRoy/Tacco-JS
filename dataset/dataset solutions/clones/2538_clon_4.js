const cloneArray = (arr) => [...arr];

const addElementToSet = (set, element) => {
    const newSet = new Set(set);
    newSet.add(element);
    return newSet;
};

const addElementToList = (list, element) => [...list, element];

const updateMap = (map, key, value) => {
    const newMap = new Map(map);
    newMap.set(key, value);
    return newMap;
};

const obtainGraphData = (inputContent) => {
    const contentLines = inputContent.trim().split('\n');
    const [totalNodes, totalEdges] = contentLines[0].split(' ').map(Number);

    let adjacencyMatrix = new Map();
    let reverseAdjacencyMatrix = new Map();

    for (let nodeIdentifier = 1; nodeIdentifier <= totalNodes; nodeIdentifier++) {
        adjacencyMatrix = updateMap(adjacencyMatrix, nodeIdentifier, []);
        reverseAdjacencyMatrix = updateMap(reverseAdjacencyMatrix, nodeIdentifier, []);
    }

    for (let i = 1; i <= totalEdges; i++) {
        const [originNode, destinationNode] = contentLines[i].split(' ').map(Number);
        const currentNeighbors = adjacencyMatrix.get(originNode);
        adjacencyMatrix = updateMap(adjacencyMatrix, originNode, addElementToList(currentNeighbors, destinationNode));

        const currentReverseNeighbors = reverseAdjacencyMatrix.get(destinationNode);
        reverseAdjacencyMatrix = updateMap(reverseAdjacencyMatrix, destinationNode, addElementToList(currentReverseNeighbors, originNode));
    }

    return {
        totalNodes: totalNodes,
        forwardGraph: adjacencyMatrix,
        transposedGraph: reverseAdjacencyMatrix
    };
};

const performFirstDFS = (
    nodeIdentifier,
    currentForwardGraph,
    visitedNodesSet,
    nodeOrderStack
) => {
    if (visitedNodesSet.has(nodeIdentifier)) {
        return { visited: visitedNodesSet, order: nodeOrderStack };
    }

    let newVisited = addElementToSet(visitedNodesSet, nodeIdentifier);
    let currentOrder = nodeOrderStack;

    const neighbors = currentForwardGraph.get(nodeIdentifier) || [];
    for (const neighborId of neighbors) {
        const dfsResult = performFirstDFS(
            neighborId,
            currentForwardGraph,
            newVisited,
            currentOrder
        );
        newVisited = dfsResult.visited;
        currentOrder = dfsResult.order;
    }

    return {
        visited: newVisited,
        order: addElementToList(currentOrder, nodeIdentifier)
    };
};

const performSecondDFS = (
    nodeIdentifier,
    currentTransposedGraph,
    visitedNodesSet,
    currentSccNodes
) => {
    if (visitedNodesSet.has(nodeIdentifier)) {
        return { visited: visitedNodesSet, scc: currentSccNodes };
    }

    let newVisited = addElementToSet(visitedNodesSet, nodeIdentifier);
    let newScc = addElementToList(currentSccNodes, nodeIdentifier);

    const reverseNeighbors = currentTransposedGraph.get(nodeIdentifier) || [];
    for (const reverseNeighborId of reverseNeighbors) {
        const dfsResult = performSecondDFS(
            reverseNeighborId,
            currentTransposedGraph,
            newVisited,
            newScc
        );
        newVisited = dfsResult.visited;
        newScc = dfsResult.scc;
    }

    return { visited: newVisited, scc: newScc };
};

const findStronglyConnectedComponents = (totalNodes, forwardGraph, transposedGraph) => {
    let globalVisitedFirstPass = new Set();
    let finishingOrderStack = [];

    for (let node = 1; node <= totalNodes; node++) {
        const dfsResult = performFirstDFS(
            node,
            forwardGraph,
            globalVisitedFirstPass,
            finishingOrderStack
        );
        globalVisitedFirstPass = dfsResult.visited;
        finishingOrderStack = dfsResult.order;
    }

    let globalVisitedSecondPass = new Set();
    let sccList = [];

    for (let i = finishingOrderStack.length - 1; i >= 0; i--) {
        const nodeToProcess = finishingOrderStack[i];
        if (!globalVisitedSecondPass.has(nodeToProcess)) {
            const dfsResult = performSecondDFS(
                nodeToProcess,
                transposedGraph,
                globalVisitedSecondPass,
                []
            );
            globalVisitedSecondPass = dfsResult.visited;
            sccList = addElementToList(sccList, dfsResult.scc);
        }
    }

    return sccList;
};

const isSimpleCycle = (sccNodes, forwardGraph) => {
    if (sccNodes.length <= 1) return false;

    const inDegree = new Map(sccNodes.map(n => [n, 0]));
    const outDegree = new Map(sccNodes.map(n => [n, 0]));

    for (const u of sccNodes) {
        const neighbors = forwardGraph.get(u) || [];
        for (const v of neighbors) {
            if (sccNodes.includes(v)) {
                outDegree.set(u, outDegree.get(u) + 1);
                inDegree.set(v, inDegree.get(v) + 1);
            }
        }
    }

    for (const node of sccNodes) {
        if (inDegree.get(node) !== 1 || outDegree.get(node) !== 1) {
            return false;
        }
    }
    return true;
};

const normalizeCycle = (cycleNodes) => {
    if (cycleNodes.length === 0) return [];

    let minStartingNode = cycleNodes[0];
    let minIndex = 0;

    for (let i = 1; i < cycleNodes.length; i++) {
        if (cycleNodes[i] < minStartingNode) {
            minStartingNode = cycleNodes[i];
            minIndex = i;
        }
    }
    return cycleNodes.slice(minIndex).concat(cycleNodes.slice(0, minIndex));
};

const compareNormalizedCycles = (cycleA, cycleB) => {
    if (!cycleA) return 1;
    if (!cycleB) return -1;

    const minLength = Math.min(cycleA.length, cycleB.length);
    for (let i = 0; i < minLength; i++) {
        if (cycleA[i] !== cycleB[i]) {
            return cycleA[i] - cycleB[i];
        }
    }
    return cycleA.length - cycleB.length;
};

const processGraphInput = (rawInput) => {
    const { totalNodes, forwardGraph, transposedGraph } = obtainGraphData(rawInput);

    const allSccs = findStronglyConnectedComponents(totalNodes, forwardGraph, transposedGraph);

    let candidateCycles = [];

    for (const scc of allSccs) {
        if (isSimpleCycle(scc, forwardGraph)) {
            const smallestNodeInScc = scc.reduce((min, current) => Math.min(min, current), Infinity);
            let currentPath = [];
            let currentNode = smallestNodeInScc;
            let visitedInScc = new Set();
            
            while (!visitedInScc.has(currentNode) && scc.includes(currentNode)) {
                visitedInScc.add(currentNode);
                currentPath.push(currentNode);
                const nextNode = (forwardGraph.get(currentNode) || []).find(n => scc.includes(n));
                if (nextNode === undefined) {
                    currentPath = []; 
                    break;
                }
                currentNode = nextNode;
                if (currentNode === smallestNodeInScc && currentPath.length === scc.length) {
                    break;
                }
            }

            if (currentPath.length > 0) {
                 candidateCycles = addElementToList(candidateCycles, normalizeCycle(currentPath));
            }
        }
    }

    candidateCycles.sort(compareNormalizedCycles);

    if (candidateCycles.length > 0) {
        return candidateCycles[0].join('\n');
    } else {
        return '-1';
    }
};

const fileSystemModule = require('fs');
const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const finalOutput = processGraphInput(standardInputContent);

console.log(finalOutput);