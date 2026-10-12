class InputTokenizer {
    #tokens;
    #currentIndex;

    constructor(sourceText) {
        const processedText = sourceText.replace(/[\s]+/g, ' ');
        this.#tokens = processedText.split(' ');
        this.#currentIndex = 0;
    }

    #retrieveNextToken() {
        if (this.#currentIndex < this.#tokens.length) {
            return this.#tokens[this.#currentIndex++];
        }
        return null;
    }

    fetchNext() {
        return this.#retrieveNextToken();
    }

    fetchNextInt() {
        const token = this.#retrieveNextToken();
        return token !== null ? parseInt(token, 10) : null;
    }

    fetchNextBigDecimal() {
        const token = this.#retrieveNextToken();
        return token !== null ? parseFloat(token) : null;
    }

    fetchNextByte() {
        const token = this.#retrieveNextToken();
        return token !== null ? new Int8Array(token) : null;
    }
}

class ProcessingQueue {
    #elements = [];
    enqueue(item) {
        this.#elements.push(item);
    }
    dequeue() {
        if (this.#elements.length === 0) {
            return undefined;
        }
        return this.#elements.shift();
    }
    isEmpty() {
        return this.#elements.length === 0;
    }
}

function ProcessGraph(inputSource) {
    const nodeCount = inputSource.fetchNextInt();
    const nodeValueMap = new Map();
    for (let i = 0; i < nodeCount; i++) {
        nodeValueMap.set(i + 1, inputSource.fetchNextInt());
    }

    const adjacencyMap = new Map();
    for (let i = 0; i < nodeCount - 1; i++) {
        const nodeA = inputSource.fetchNextInt();
        const nodeB = inputSource.fetchNextInt();

        if (!adjacencyMap.has(nodeA)) adjacencyMap.set(nodeA, new Set());
        if (!adjacencyMap.has(nodeB)) adjacencyMap.set(nodeB, new Set());

        adjacencyMap.get(nodeA).add(nodeB);
        adjacencyMap.get(nodeB).add(nodeA);
    }

    const pathHistory = new Map();
    let currentPathSnapshot = [];

    const traversalQueue = new ProcessingQueue();
    traversalQueue.enqueue([1, -1]);

    pathHistory.set(-1, []);

    while (!traversalQueue.isEmpty()) {
        const [activeNode, previousNode] = traversalQueue.dequeue();

        const parentPath = pathHistory.get(previousNode) || [];
        const pathForActiveNode = [...parentPath, nodeValueMap.get(activeNode)];
        
        pathHistory.set(activeNode, pathForActiveNode);
        currentPathSnapshot = pathForActiveNode;

        const neighbors = adjacencyMap.get(activeNode);
        if (neighbors) {
            for (const neighbor of neighbors) {
                if (neighbor !== previousNode) {
                    traversalQueue.enqueue([neighbor, activeNode]);
                }
            }
        }
    }
    console.log(currentPathSnapshot);
}

ProcessGraph(new InputTokenizer(require("fs").readFileSync("/dev/stdin", "utf8")));
