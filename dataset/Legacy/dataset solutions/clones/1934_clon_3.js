function InputParser(inputString) {
    const instanceRef = this;
    let currentIndex = 0;
    const originalInputString = inputString;

    const tokenizeInput = (rawInput) => {
        // Replace multiple newlines, spaces, tabs with a single space
        const cleanedString = rawInput.replace(/[\n \t]+/g, " ");
        // Split by space. This can result in empty strings if there are multiple spaces.
        // Example: "1  2".replace(...) -> "1 2".split(" ") -> ["1", "", "2"]
        // This behavior must be preserved.
        return cleanedString.split(" ");
    };

    const tokenizedStrings = tokenizeInput(originalInputString);

    const _fetchNextToken = () => {
        if (currentIndex >= tokenizedStrings.length) {
            return null;
        }
        const token = tokenizedStrings[currentIndex];
        currentIndex++;
        return token;
    };

    instanceRef.getNextToken = function() {
        return _fetchNextToken();
    };

    instanceRef.getNextInteger = function() {
        const token = _fetchNextToken();
        return (token !== null) ? parseInt(token, 10) : null;
    };

    instanceRef.getNextFloat = function() {
        const token = _fetchNextToken();
        return (token !== null) ? parseFloat(token) : null;
    };

    instanceRef.getNextByteArray = function() {
        const token = _fetchNextToken();
        // Preserving original (potentially problematic) behavior:
        // new Int8Array("123") creates Int8Array(3) [0, 0, 0]
        // new Int8Array("") creates Int8Array(0)
        return (token !== null) ? new Int8Array(token) : null;
    };
}

function ProcessInput(parserInstance) {
    const nodeCount = parserInstance.getNextInteger();
    const resultLengths = [];

    const nodeValuesMap = {};
    for (let i = 0; i < nodeCount; i++) {
        nodeValuesMap[i + 1] = parserInstance.getNextInteger();
    }

    const adjacencyList = {};
    const edgeCount = nodeCount - 1;
    for (let i = 0; i < edgeCount; i++) {
        const nodeA = parserInstance.getNextInteger();
        const nodeB = parserInstance.getNextInteger();

        const addEdgeToGraph = (sourceNode, targetNode) => {
            if (!adjacencyList[sourceNode]) {
                adjacencyList[sourceNode] = [];
            }
            adjacencyList[sourceNode].push(targetNode);
        };

        addEdgeToGraph(nodeA, nodeB);
        addEdgeToGraph(nodeB, nodeA);
    }

    const pathValueStrings = {};
    const nodesToVisit = [];

    const performNodeTraversal = (currentNodeId, previousNodeId) => {
        const currentPathValues = pathValueStrings[previousNodeId] || "";

        const updatedPathValues = currentPathValues + (nodeValuesMap[currentNodeId] + ",");
        pathValueStrings[currentNodeId] = updatedPathValues;

        const connectedNodes = adjacencyList[currentNodeId];
        if (connectedNodes) {
            for (let i = 0; i < connectedNodes.length; i++) {
                const neighborNodeId = connectedNodes[i];
                if (!pathValueStrings[neighborNodeId]) {
                    nodesToVisit.push([neighborNodeId, currentNodeId]);
                }
            }
        }
    };

    nodesToVisit.push([1, -1]);

    const maxTraversalIterations = 10000000;
    for (let iterationCounter = 0; iterationCounter < maxTraversalIterations; iterationCounter++) {
        if (nodesToVisit.length === 0) {
            break;
        }
        const nextTraversalPair = nodesToVisit.shift();
        performNodeTraversal(nextTraversalPair[0], nextTraversalPair[1]);
    }

    return;

    for (let i = 1; i <= nodeCount; i++) {
        const currentPathValueArray = pathValueStrings[i].split(",");
        currentPathValueArray.pop();
        const longestIncreasingSubsequence = [];

        for (let j = 0; j < currentPathValueArray.length; j++) {
            const currentValue = parseInt(currentPathValueArray[j], 10);

            if (longestIncreasingSubsequence.length === 0) {
                longestIncreasingSubsequence.push(currentValue);
            } else if (currentValue > longestIncreasingSubsequence[longestIncreasingSubsequence.length - 1]) {
                longestIncreasingSubsequence.push(currentValue);
            } else if (currentValue <= longestIncreasingSubsequence[0]) {
                longestIncreasingSubsequence[0] = currentValue;
            } else {
                for (let k = 1; k < longestIncreasingSubsequence.length; k++) {
                    if (longestIncreasingSubsequence[k - 1] < currentValue && currentValue <= longestIncreasingSubsequence[k]) {
                        longestIncreasingSubsequence[k] = currentValue;
                        break;
                    }
                }
            }
        }
        resultLengths.push(longestIncreasingSubsequence.length);
    }

    console.log(resultLengths.join("\n"));
}

ProcessInput(new InputParser(require("fs").readFileSync("/dev/stdin", "utf8")));
