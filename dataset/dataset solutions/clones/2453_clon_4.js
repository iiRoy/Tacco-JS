const applicationState = {
    currentPathLength: 0,
    currentLocationNode: 0,
    currentDay: 0,
    lastItemCollectionDay: -1,
    cumulativeScore: 0,
    maxDistanceValue: 1e9,
    vertexCount: 0,
    linkCount: 0,
    fullPathCosts: null,
    directLinkCosts: null,
    nodeConnections: null,
    someUnusedValues: null,
    maximumSimulationDuration: 0,
    maximumSimulationDurationSquared: 0,
    itemsAwaitingDelivery: new Set(),
    itemsReadyForCollection: new Set(),
    currentDeliveryPath: [],
    itemArrivalTimestamps: null,
    inputDataSequence: [],
    inputDataCursor: 0,
    outputResults: []
};

const createNestedArray = (initialValue, ...dimensions) => {
    const builder = (dims, currentDepth = 0) => {
        if (currentDepth === dims.length) {
            return initialValue;
        }
        const size = dims[currentDepth];
        return Array.from({ length: size }, () => builder(dims, currentDepth + 1));
    };
    return builder(dimensions);
};

const DisjointSetManager = (totalElements) => {
    const componentParent = Array(totalElements + 1).fill(-1);

    const findSetRepresentative = (elementId) => {
        if (componentParent[elementId] < 0) {
            return elementId;
        }
        return componentParent[elementId] = findSetRepresentative(componentParent[elementId]);
    };

    const mergeSets = (id1, id2) => {
        let rep1 = findSetRepresentative(id1);
        let rep2 = findSetRepresentative(id2);

        if (rep1 === rep2) return true;

        if (componentParent[rep2] < componentParent[rep1]) {
            componentParent[rep1] += componentParent[rep2];
            componentParent[rep2] = rep1;
        } else {
            componentParent[rep2] += componentParent[rep1];
            componentParent[rep1] = rep2;
        }
        return false;
    };

    const areElementsConnected = (id1, id2) => {
        return findSetRepresentative(id1) === findSetRepresentative(id2);
    };

    const getComponentPopulation = (elementId) => {
        return -componentParent[findSetRepresentative(elementId)];
    };

    return {
        findSetRepresentative,
        mergeSets,
        areElementsConnected,
        getComponentPopulation
    };
};

const fetchNextInputDatum = () => {
    return +applicationState.inputDataSequence[applicationState.inputDataCursor++];
};

const computeMinimalSpanningTree = (involvedNodes) => {
    const activeNodes = [...involvedNodes, 0];
    const activeNodeCount = activeNodes.length;
    const candidateEdges = [];

    for (let i = 0; i < activeNodeCount; i++) {
        for (let j = i + 1; j < activeNodeCount; j++) {
            const u = activeNodes[i];
            const v = activeNodes[j];
            candidateEdges.push({ start: u, end: v, weight: applicationState.fullPathCosts[u][v] });
        }
    }
    candidateEdges.sort((a, b) => a.weight - b.weight);

    const dsm = DisjointSetManager(applicationState.vertexCount);
    const mstResultEdges = [];

    for (const edge of candidateEdges) {
        if (dsm.getComponentPopulation(0) === activeNodeCount) break;

        if (!dsm.mergeSets(edge.start, edge.end)) {
            mstResultEdges.push([edge.start, edge.end, edge.weight]);
        }
    }
    return mstResultEdges;
};

const identifyNextTargetDestination = () => {
    if (applicationState.itemsAwaitingDelivery.size === 0) {
        return (applicationState.currentLocationNode === 0) ? -2 : advanceAlongShortestPath(0);
    }

    if (applicationState.currentLocationNode === applicationState.currentDeliveryPath[applicationState.currentDeliveryPath.length - 1]) {
        applicationState.currentDeliveryPath.pop();
        while (applicationState.currentDeliveryPath.length && applicationState.itemsReadyForCollection.has(applicationState.currentDeliveryPath[applicationState.currentDeliveryPath.length - 1])) {
            applicationState.currentDeliveryPath.pop();
        }
        if (applicationState.currentDeliveryPath.length === 0) return advanceAlongShortestPath(0);
    }
    return advanceAlongShortestPath(applicationState.currentDeliveryPath[applicationState.currentDeliveryPath.length - 1]);
};

const advanceAlongShortestPath = (destinationVertex) => {
    if (destinationVertex === applicationState.currentLocationNode) return -2;

    for (const neighborVertex of applicationState.nodeConnections[applicationState.currentLocationNode]) {
        if (applicationState.fullPathCosts[applicationState.currentLocationNode][destinationVertex] ===
            applicationState.directLinkCosts[applicationState.currentLocationNode][neighborVertex] +
            applicationState.fullPathCosts[neighborVertex][destinationVertex]) {
            applicationState.currentPathLength = applicationState.directLinkCosts[applicationState.currentLocationNode][neighborVertex] - 1;
            applicationState.currentLocationNode = neighborVertex;
            return applicationState.currentLocationNode;
        }
    }
    return -2;
};

const performDailyCycle = () => {
    if (applicationState.currentPathLength > 0) {
        applicationState.currentPathLength--;
        return applicationState.currentLocationNode;
    }
    if (applicationState.currentLocationNode === 0) {
        handleItemCollections();
    } else {
        handleItemDeliveries();
    }
    return identifyNextTargetDestination();
};

const handleItemCollections = () => {
    applicationState.itemsReadyForCollection.clear();
    applicationState.currentDeliveryPath = [];

    while (applicationState.lastItemCollectionDay < applicationState.currentDay) {
        applicationState.lastItemCollectionDay++;
        const incomingItemCount = fetchNextInputDatum();
        for (let i = 0; i < incomingItemCount; i++) {
            const itemId = fetchNextInputDatum() - 1;
            const deliveryLocation = fetchNextInputDatum() - 1;
            applicationState.itemsAwaitingDelivery.add(deliveryLocation);
            applicationState.itemArrivalTimestamps[deliveryLocation].push(applicationState.lastItemCollectionDay);
        }
    }
    if (applicationState.itemsAwaitingDelivery.size === 0) return;

    const mstEdges = computeMinimalSpanningTree(applicationState.itemsAwaitingDelivery);
    const treeAdjacencyMap = createNestedArray([], applicationState.vertexCount);
    for (const edge of mstEdges) {
        const u = edge[0];
        const v = edge[1];
        treeAdjacencyMap[u].push(v);
        treeAdjacencyMap[v].push(u);
    }

    const preOrderTraversalNodes = [];
    const traversalStack = [{ node: 0, parent: -1 }];
    const visitedNodesInTraversal = new Set();
    visitedNodesInTraversal.add(0);

    while (traversalStack.length > 0) {
        const { node: currentNode, parent: parentNode } = traversalStack.pop();
        preOrderTraversalNodes.push(currentNode);

        const neighbors = treeAdjacencyMap[currentNode];
        for (let i = neighbors.length - 1; i >= 0; i--) {
            const neighbor = neighbors[i];
            if (neighbor !== parentNode && !visitedNodesInTraversal.has(neighbor)) {
                visitedNodesInTraversal.add(neighbor);
                traversalStack.push({ node: neighbor, parent: currentNode });
            }
        }
    }
    applicationState.currentDeliveryPath = preOrderTraversalNodes;
    applicationState.currentDeliveryPath.reverse();
    applicationState.currentDeliveryPath.pop();
};

const handleItemDeliveries = () => {
    applicationState.itemsAwaitingDelivery.delete(applicationState.currentLocationNode);
    while (applicationState.itemArrivalTimestamps[applicationState.currentLocationNode].length > 0) {
        const arrivalDay = applicationState.itemArrivalTimestamps[applicationState.currentLocationNode].pop();
        const deliveryLag = applicationState.currentDay - arrivalDay;
        applicationState.cumulativeScore += applicationState.maximumSimulationDurationSquared - (deliveryLag * deliveryLag);
    }
};

const inputHandler = require("readline").createInterface(process.stdin, process.stdout);
const simulationFlow = (function* () {
    const obtainLine = () => inputHandler.once("line", (line) => simulationFlow.next(line));

    let receivedLine = yield obtainLine();
    let splitData = receivedLine.split(" ");
    applicationState.linkCount = +splitData[1];
    applicationState.vertexCount = +splitData[0];

    applicationState.fullPathCosts = createNestedArray(applicationState.maxDistanceValue, applicationState.vertexCount, applicationState.vertexCount);
    applicationState.directLinkCosts = createNestedArray(applicationState.maxDistanceValue, applicationState.vertexCount, applicationState.vertexCount);
    applicationState.nodeConnections = createNestedArray([], applicationState.vertexCount);

    for (let i = 0; i < applicationState.vertexCount; i++) {
        applicationState.fullPathCosts[i][i] = 0;
    }

    for (let i = 0; i < applicationState.linkCount; i++) {
        splitData = (yield obtainLine()).split(" ");
        const nodeOne = +splitData[0] - 1;
        const nodeTwo = +splitData[1] - 1;
        const edgeWeight = +splitData[2];

        applicationState.fullPathCosts[nodeOne][nodeTwo] = applicationState.fullPathCosts[nodeTwo][nodeOne] = applicationState.directLinkCosts[nodeOne][nodeTwo] = applicationState.directLinkCosts[nodeTwo][nodeOne] = edgeWeight;
        applicationState.nodeConnections[nodeOne].push(nodeTwo);
        applicationState.nodeConnections[nodeTwo].push(nodeOne);
    }

    for (let intermediateNode = 0; intermediateNode < applicationState.vertexCount; intermediateNode++) {
        for (let startNode = 0; startNode < applicationState.vertexCount; startNode++) {
            for (let endNode = 0; endNode < applicationState.vertexCount; endNode++) {
                if (applicationState.fullPathCosts[startNode][intermediateNode] + applicationState.fullPathCosts[intermediateNode][endNode] < applicationState.fullPathCosts[startNode][endNode]) {
                    applicationState.fullPathCosts[startNode][endNode] = applicationState.fullPathCosts[startNode][intermediateNode] + applicationState.fullPathCosts[intermediateNode][endNode];
                }
            }
        }
    }

    applicationState.someUnusedValues = (yield obtainLine()).split(" ").map(val => +val);
    applicationState.maximumSimulationDuration = +(yield obtainLine());
    applicationState.maximumSimulationDurationSquared = applicationState.maximumSimulationDuration * applicationState.maximumSimulationDuration;
    applicationState.itemArrivalTimestamps = createNestedArray([], applicationState.vertexCount);

    for (; applicationState.currentDay < applicationState.maximumSimulationDuration; applicationState.currentDay++) {
        let tempInput = +(yield obtainLine());
        applicationState.inputDataSequence.push(tempInput);
        for (let i = 0; i < tempInput; i++) {
            let parsedInput = (yield obtainLine()).split(" ").map(val => +val);
            applicationState.inputDataSequence.push(parsedInput[0], parsedInput[1]);
            applicationState.itemsReadyForCollection.add(parsedInput[1]);
        }
        tempInput = +(yield obtainLine());
        for (let i = 0; i < tempInput; i++) {
            yield obtainLine();
        }

        applicationState.outputResults[applicationState.currentDay] = performDailyCycle() + 1;
        console.log(applicationState.outputResults[applicationState.currentDay]);

        tempInput = yield obtainLine();
        if (tempInput[0] !== "O") return;
        tempInput = +(yield obtainLine());
        for (let i = 0; i < tempInput; i++) {
            yield obtainLine();
        }
    }
})();
simulationFlow.next();