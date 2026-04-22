const extractNumericValues = (lineContent) => lineContent.split(" ").map(Number);

const PartitionManager = (totalElements) => {
    const parentLinks = new Map();
    const depthMeasures = new Map();

    for (let i = 0; i < totalElements; ++i) {
        parentLinks.set(i, i);
        depthMeasures.set(i, 0);
    }

    const identifyRepresentative = (element) => {
        let currentElement = element;
        const pathTraversal = [];
        while (parentLinks.get(currentElement) !== currentElement) {
            pathTraversal.push(currentElement);
            currentElement = parentLinks.get(currentElement);
        }
        for (const traversedElement of pathTraversal) {
            parentLinks.set(traversedElement, currentElement);
        }
        return currentElement;
    };

    const mergeSets = (elementA, elementB) => {
        const rootA = identifyRepresentative(elementA);
        const rootB = identifyRepresentative(elementB);

        if (rootA === rootB) {
            return;
        }

        const rankA = depthMeasures.get(rootA);
        const rankB = depthMeasures.get(rootB);

        if (rankA < rankB) {
            parentLinks.set(rootA, rootB);
        } else if (rankB < rankA) {
            parentLinks.set(rootB, rootA);
        } else {
            parentLinks.set(rootB, rootA);
            depthMeasures.set(rootA, rankA + 1);
        }
    };

    return {
        identifyRepresentative,
        mergeSets
    };
};

const executeGraphAnalysis = (inputData) => {
    const dataLines = inputData.trim().split("\n");
    const [nodeQuantity, friendConnections, blockades] = extractNumericValues(dataLines[0]);

    const dsuInstance = PartitionManager(nodeQuantity);
    const restrictedPairs = new Map();

    for (let i = 1; i <= friendConnections; ++i) {
        const [firstNode, secondNode] = extractNumericValues(dataLines[i]).map(n => n - 1);
        dsuInstance.mergeSets(firstNode, secondNode);

        if (!restrictedPairs.has(firstNode)) restrictedPairs.set(firstNode, new Set());
        if (!restrictedPairs.has(secondNode)) restrictedPairs.set(secondNode, new Set());
        restrictedPairs.get(firstNode).add(secondNode);
        restrictedPairs.get(secondNode).add(firstNode);
    }

    for (let i = friendConnections + 1; i <= friendConnections + blockades; ++i) {
        const [firstNode, secondNode] = extractNumericValues(dataLines[i]).map(n => n - 1);
        if (!restrictedPairs.has(firstNode)) restrictedPairs.set(firstNode, new Set());
        if (!restrictedPairs.has(secondNode)) restrictedPairs.set(secondNode, new Set());
        restrictedPairs.get(firstNode).add(secondNode);
        restrictedPairs.get(secondNode).add(firstNode);
    }

    for (let i = 0; i < nodeQuantity; ++i) {
        if (!restrictedPairs.has(i)) restrictedPairs.set(i, new Set());
        restrictedPairs.get(i).add(i);
    }

    const elementGroups = new Map();
    for (let i = 0; i < nodeQuantity; ++i) {
        const componentRoot = dsuInstance.identifyRepresentative(i);
        if (!elementGroups.has(componentRoot)) {
            elementGroups.set(componentRoot, new Set());
        }
        elementGroups.get(componentRoot).add(i);
    }

    const potentialConnectionCounts = Array.from({ length: nodeQuantity }, (_, currentIdx) => {
        const currentElementRoot = dsuInstance.identifyRepresentative(currentIdx);
        const fellowComponentMembers = elementGroups.get(currentElementRoot);

        if (!fellowComponentMembers) return 0;

        let counter = 0;
        const currentRestricted = restrictedPairs.get(currentIdx) || new Set();

        for (const member of fellowComponentMembers) {
            if (!currentRestricted.has(member)) {
                counter++;
            }
        }
        return counter;
    });

    console.log(potentialConnectionCounts.join(" "));
};

executeGraphAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));