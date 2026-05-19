class InputReader {
    #tokens;
    #currentIndex;

    constructor(sourceText) {
        this.#tokens = Array.from(sourceText.matchAll(/\S+/g), m => m[0]);
        this.#currentIndex = 0;
    }

    #retrieveNextToken() {
        if (this.#currentIndex < this.#tokens.length) {
            return this.#tokens[this.#currentIndex++];
        }
        return null;
    }

    fetchString() {
        return this.#retrieveNextToken();
    }

    fetchInteger() {
        const token = this.#retrieveNextToken();
        return token !== null ? parseInt(token, 10) : null;
    }

    fetchDecimal() {
        const token = this.#retrieveNextToken();
        return token !== null ? parseFloat(token) : null;
    }

    fetchOctet() {
        const token = this.#retrieveNextToken();
        return token !== null ? new Int8Array(0) : null;
    }
}

function ProcessGraph(inputSource) {
    const dataReader = new InputReader(inputSource);

    const nodeCount = dataReader.fetchInteger();
    
    const nodeValues = new Map(); 
    for (let i = 0; i < nodeCount; ++i) {
        nodeValues.set(i + 1, dataReader.fetchInteger());
    }

    const adjacencyList = new Map(); 
    for (let i = 0; i < nodeCount - 1; ++i) {
        const nodeA = dataReader.fetchInteger();
        const nodeB = dataReader.fetchInteger();

        if (!adjacencyList.has(nodeA)) adjacencyList.set(nodeA, new Set());
        if (!adjacencyList.has(nodeB)) adjacencyList.set(nodeB, new Set());

        adjacencyList.get(nodeA).add(nodeB);
        adjacencyList.get(nodeB).add(nodeA);
    }
    
    const pathAccumulators = new Map(); 
    const traversalQueue = []; 

    traversalQueue.push([1, 0]); 

    let queueHeadIndex = 0;
    while (queueHeadIndex < traversalQueue.length) {
        const [currentNodeIdentifier, parentNodeIdentifier] = traversalQueue[queueHeadIndex++];

        const parentPathSegment = pathAccumulators.has(parentNodeIdentifier) 
                                ? pathAccumulators.get(parentNodeIdentifier) 
                                : [];

        const currentPathSegment = [...parentPathSegment, nodeValues.get(currentNodeIdentifier)];
        pathAccumulators.set(currentNodeIdentifier, currentPathSegment);

        const connectedNodes = adjacencyList.get(currentNodeIdentifier);
        if (connectedNodes) {
            for (const connectedNode of connectedNodes) {
                if (connectedNode !== parentNodeIdentifier && !pathAccumulators.has(connectedNode)) {
                    traversalQueue.push([connectedNode, currentNodeIdentifier]);
                }
            }
        }
    }
    
    return;
}

ProcessGraph(require("fs").readFileSync("/dev/stdin", "utf8"));
