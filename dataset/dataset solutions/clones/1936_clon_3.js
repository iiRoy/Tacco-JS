function InputReader(inputString) {
    const instance = this;
    instance.currentIndex = 0;
    instance.originalInputString = inputString;

    const processAndTokenize = (rawString) => {
        const cleanedString = rawString.replace(/[\n \t]+/g, " ");
        return cleanedString.split(" ");
    };

    instance.tokenizedStrings = processAndTokenize(inputString);

    const retrieveNextRawToken = () => {
        if (instance.currentIndex >= instance.tokenizedStrings.length) {
            return null;
        }
        const token = instance.tokenizedStrings[instance.currentIndex];
        instance.currentIndex++;
        return token;
    };

    instance.readNextToken = () => {
        const token = retrieveNextRawToken();
        return (token !== undefined && token !== null) ? token : null;
    };

    instance.readNextInt = () => {
        const token = retrieveNextRawToken();
        return (token !== undefined && token !== null) ? parseInt(token, 10) : null;
    };

    instance.readNextFloat = () => {
        const token = retrieveNextRawToken();
        return (token !== undefined && token !== null) ? parseFloat(token) : null;
    };

    instance.readNextByteArray = () => {
        const token = retrieveNextRawToken();
        return (token !== undefined && token !== null) ? new Int8Array(token) : null;
    };
}

function processInput(inputScanner) {
    const nodeCount = inputScanner.readNextInt();
    const resultLengths = [];

    const nodeValuesMap = {};
    for (let i = 0; i < nodeCount; i++) {
        nodeValuesMap[i + 1] = inputScanner.readNextInt();
    }

    const adjacencyList = {};

    const addGraphEdge = (sourceNode, targetNode) => {
        if (!adjacencyList[sourceNode]) {
            adjacencyList[sourceNode] = [targetNode];
        } else {
            adjacencyList[sourceNode].push(targetNode);
        }
    };

    for (let i = 0; i < nodeCount - 1; i++) {
        const nodeA = inputScanner.readNextInt();
        const nodeB = inputScanner.readNextInt();
        addGraphEdge(nodeA, nodeB);
        addGraphEdge(nodeB, nodeA);
    }

    const pathValueLists = {};

    const traverseTreeAndCollectPaths = (currentNodeId, parentNodeId, currentPathValues) => {
        const pathForCurrentNode = [...currentPathValues];
        pathForCurrentNode.push(nodeValuesMap[currentNodeId]);
        pathValueLists[currentNodeId] = pathForCurrentNode;

        const neighbors = adjacencyList[currentNodeId];
        if (neighbors) {
            for (const neighborNodeId of neighbors) {
                if (parentNodeId !== neighborNodeId) {
                    traverseTreeAndCollectPaths(neighborNodeId, currentNodeId, pathForCurrentNode);
                }
            }
        }
    };

    traverseTreeAndCollectPaths(1, -1, []);

    const calculateModifiedLisLength = (path) => {
        const lisSequence = [];

        for (const currentValue of path) {
            if (lisSequence.length === 0 || currentValue > lisSequence[lisSequence.length - 1]) {
                lisSequence.push(currentValue);
            } else if (currentValue <= lisSequence[0]) {
                lisSequence[0] = currentValue;
            } else {
                let low = 0;
                let high = lisSequence.length - 1;
                let insertionPoint = -1;

                while (low <= high) {
                    const mid = Math.floor((low + high) / 2);
                    if (lisSequence[mid] >= currentValue) {
                        insertionPoint = mid;
                        high = mid - 1;
                    } else {
                        low = mid + 1;
                    }
                }
                lisSequence[insertionPoint] = currentValue;
            }
        }
        return lisSequence.length;
    };

    for (let i = 1; i <= nodeCount; i++) {
        const currentPath = pathValueLists[i];
        resultLengths.push(calculateModifiedLisLength(currentPath));
    }

    console.log(resultLengths.join("\n"));
}

processInput(new InputReader(require("fs").readFileSync("/dev/stdin", "utf8")));
