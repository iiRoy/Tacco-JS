function Main(input) {
    const dataLines = input.split("\n");

    const [numNodes, numFriends, numBlocks] = dataLines[0].split(" ").map(Number);

    const parentArray = Array.from({ length: numNodes }, (_, index) => index);
    const rankArray = Array(numNodes).fill(0);

    const retrieveSetRepresentative = (nodeIdentifier) => {
        let currentElement = nodeIdentifier;
        const pathElements = [];
        while (parentArray[currentElement] !== currentElement) {
            pathElements.push(currentElement);
            currentElement = parentArray[currentElement];
        }
        for (const pathNode of pathElements) {
            parentArray[pathNode] = currentElement;
        }
        return currentElement;
    };

    const mergeSets = (firstNode, secondNode) => {
        let rootOne = retrieveSetRepresentative(firstNode);
        let rootTwo = retrieveSetRepresentative(secondNode);

        if (rootOne === rootTwo) {
            return;
        }

        if (rankArray[rootOne] < rankArray[rootTwo]) {
            parentArray[rootOne] = rootTwo;
        } else if (rankArray[rootTwo] < rankArray[rootOne]) {
            parentArray[rootTwo] = rootOne;
        } else {
            parentArray[rootTwo] = rootOne;
            rankArray[rootOne]++;
        }
    };

    const directLinkRegistry = new Map();

    for (let k = 0; k < numFriends; k++) {
        const [nodeX, nodeY] = dataLines[k + 1].split(" ").map(s => Number(s) - 1);
        mergeSets(nodeX, nodeY);

        if (!directLinkRegistry.has(nodeX)) directLinkRegistry.set(nodeX, new Set());
        if (!directLinkRegistry.has(nodeY)) directLinkRegistry.set(nodeY, new Set());
        directLinkRegistry.get(nodeX).add(nodeY);
        directLinkRegistry.get(nodeY).add(nodeX);
    }

    for (let k = 0; k < numBlocks; k++) {
        const [nodeX, nodeY] = dataLines[k + numFriends + 1].split(" ").map(s => Number(s) - 1);
        
        if (!directLinkRegistry.has(nodeX)) directLinkRegistry.set(nodeX, new Set());
        if (!directLinkRegistry.has(nodeY)) directLinkRegistry.set(nodeY, new Set());
        directLinkRegistry.get(nodeX).add(nodeY);
        directLinkRegistry.get(nodeY).add(nodeX);
    }

    const componentMemberMap = new Map();
    for (let k = 0; k < numNodes; k++) {
        const componentRoot = retrieveSetRepresentative(k);
        if (!componentMemberMap.has(componentRoot)) {
            componentMemberMap.set(componentRoot, new Set());
        }
        componentMemberMap.get(componentRoot).add(k);
    }

    const finalResultArray = new Array(numNodes).fill(0);

    for (let k = 0; k < numNodes; k++) {
        const currentElementRoot = retrieveSetRepresentative(k);
        const membersOfCurrentComponent = componentMemberMap.get(currentElementRoot);
        const currentElementDirectLinks = directLinkRegistry.get(k) || new Set();

        let potentialCount = 0;
        for (const componentMember of membersOfCurrentComponent) {
            if (componentMember === k) {
                continue;
            }
            if (!currentElementDirectLinks.has(componentMember)) {
                potentialCount++;
            }
        }
        finalResultArray[k] = potentialCount;
    }

    console.log(finalResultArray.join(" "));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
