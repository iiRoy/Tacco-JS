class InputProcessor {
    #currentIndex = 0;
    #originalInputString;
    #tokenizedStrings;

    constructor(input) {
        this.#originalInputString = input;
        this.#tokenizedStrings = this.#processInputString(input);
    }

    #processInputString(sourceString) {
        const cleanedString = sourceString.replace(/[\n \t]+/g, " ");
        const splitTokens = cleanedString.split(" ");
        // The original code explicitly pushes each element from split into a new array.
        // This preserves behavior if split produces empty strings.
        const finalTokens = [];
        for (let i = 0; i < splitTokens.length; i++) {
            finalTokens.push(splitTokens[i]);
        }
        return finalTokens;
    }

    #fetchNextTokenInternal() {
        const currentTokenIndex = this.#currentIndex;
        if (currentTokenIndex >= this.#tokenizedStrings.length) {
            return null;
        }
        const retrievedToken = this.#tokenizedStrings[currentTokenIndex];
        this.#currentIndex++;
        return retrievedToken;
    }

    getNextToken() {
        return this.#fetchNextTokenInternal();
    }

    getNextInteger() {
        const tokenValue = this.#fetchNextTokenInternal();
        return (tokenValue !== null) ? parseInt(tokenValue, 10) : null;
    }

    getNextDecimal() {
        const tokenValue = this.#fetchNextTokenInternal();
        return (tokenValue !== null) ? parseFloat(tokenValue) : null;
    }
    
    getNextByte() {
        const tokenValue = this.#fetchNextTokenInternal();
        // Preserves original behavior: new Int8Array("123") creates Int8Array(3) [0, 0, 0]
        return (tokenValue !== null) ? new Int8Array(tokenValue) : null;
    }
}

function ProcessGraphData(inputReader) {

    const nodeCount = inputReader.getNextInteger();
    const finalResults = [];
    
    const nodeValuesMap = {};
    for (let i = 0; i < nodeCount; i++) {
        const currentId = i + 1;
        nodeValuesMap[currentId] = inputReader.getNextInteger();
    }
    
    const adjacencyList = {};
    const numberOfEdges = nodeCount - 1;
    for (let i = 0; i < numberOfEdges; i++) {
        const firstNode = inputReader.getNextInteger();
        const secondNode = inputReader.getNextInteger();
        
        if (!adjacencyList[firstNode]) {
            adjacencyList[firstNode] = [];
        }
        adjacencyList[firstNode].push(secondNode);

        if (!adjacencyList[secondNode]) {
            adjacencyList[secondNode] = [];
        }
        adjacencyList[secondNode].push(firstNode);
    }
    
    const pathValueLists = {};
    const traversalQueue = [];
    
    // This variable is implicitly global in the original code's Main function scope
    // due to assignment without 'var/let/const' inside 'crawlNode'.
    // Declaring it here with 'var' ensures it's accessible and mutable by the
    // 'traverseAndCollect' function and the final 'console.log' statement,
    // preserving the exact observable behavior in strict mode environments like Node.js modules.
    var currentPathValues;

    const traverseAndCollect = (currentNodeId, parentNodeId) => {
        const inheritedPath = pathValueLists[parentNodeId] ? [...pathValueLists[parentNodeId]] : [];
        
        inheritedPath.push(nodeValuesMap[currentNodeId]);
        pathValueLists[currentNodeId] = inheritedPath;
        
        // Update the function-scoped 'currentPathValues' variable
        currentPathValues = inheritedPath;

        const neighborsOfCurrent = adjacencyList[currentNodeId];
        if (neighborsOfCurrent) {
            for (const neighborId of neighborsOfCurrent) {
                if (parentNodeId !== neighborId) {
                    traversalQueue.push([neighborId, currentNodeId]);
                }
            }
        }
    };
    
    traversalQueue.push([1, -1]);
    const maxDebugIterations = 10000000;
    for (let iteration = 0; iteration < maxDebugIterations; iteration++) {
        if (traversalQueue.length === 0) {
            break;
        }
        const [nodeToProcess, parentOfNode] = traversalQueue.shift();
        traverseAndCollect(nodeToProcess, parentOfNode);
    }
    
    console.log(currentPathValues);
    return;
    
    // The following code block is unreachable due to the 'return;' statement above.
    // It is preserved as per Type III cloning rules.
    for (let i = 1; i <= nodeCount; i++) {
        
        const currentPathList = pathValueLists[i];
        const longestIncreasingSubsequence = [];

        for (let j = 0; j < currentPathList.length; j++) {
            const elementValue = currentPathList[j];
            if (longestIncreasingSubsequence.length === 0) {
                longestIncreasingSubsequence.push(elementValue);
            }
            else if (elementValue > longestIncreasingSubsequence[longestIncreasingSubsequence.length - 1]) {
                longestIncreasingSubsequence.push(elementValue);
            }
            else if (elementValue <= longestIncreasingSubsequence[0]) {
                longestIncreasingSubsequence[0] = elementValue;
            }
            else {
                for (let k = 1; k < longestIncreasingSubsequence.length; k++) {
                    if (longestIncreasingSubsequence[k - 1] < elementValue && elementValue <= longestIncreasingSubsequence[k]) {
                        longestIncreasingSubsequence[k] = elementValue;
                        break;
                    }
                }
            }
        }
        finalResults.push(longestIncreasingSubsequence.length);
    }
    
    console.log(finalResults.join("\n"));
}
ProcessGraphData(new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8")));
