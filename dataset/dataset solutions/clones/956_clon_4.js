class EdgePriorityQueue {
    constructor() {
        this.dataStorage = [];
    }

    insert(elementTuple) { // elementTuple is [weight, vertexIndex]
        this.dataStorage.push(elementTuple);
        this._heapifyUp(this.dataStorage.length - 1);
    }

    extractMinimum() {
        if (this.isEmpty()) {
            return null;
        }
        const minVal = this.dataStorage[0];
        const lastVal = this.dataStorage.pop();
        if (!this.isEmpty()) {
            this.dataStorage[0] = lastVal;
            this._heapifyDown(0);
        }
        return minVal;
    }

    isEmpty() {
        return this.dataStorage.length === 0;
    }

    _heapifyUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            // Compare by weight (first element of tuple)
            if (this.dataStorage[parentIndex][0] > this.dataStorage[index][0]) {
                [this.dataStorage[parentIndex], this.dataStorage[index]] = [this.dataStorage[index], this.dataStorage[parentIndex]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    _heapifyDown(index) {
        const lastIndex = this.dataStorage.length - 1;
        while (true) {
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            let smallestAt = index;

            // Compare by weight
            if (leftChild <= lastIndex && this.dataStorage[leftChild][0] < this.dataStorage[smallestAt][0]) {
                smallestAt = leftChild;
            }

            if (rightChild <= lastIndex && this.dataStorage[rightChild][0] < this.dataStorage[smallestAt][0]) {
                smallestAt = rightChild;
            }

            if (smallestAt !== index) {
                [this.dataStorage[index], this.dataStorage[smallestAt]] = [this.dataStorage[smallestAt], this.dataStorage[index]];
                index = smallestAt;
            } else {
                break;
            }
        }
    }
}

(function processGraphData() {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const inputLines = fileContent.toString().split('\n').map(l => l.trim()).filter(l => l.length > 0);

    const nodeCount = parseInt(inputLines.shift(), 10);
    const connectionMatrix = inputLines.map(line =>
        line.split(' ').map(val => (val === '-1') ? Number.MAX_SAFE_INTEGER : parseInt(val, 10))
    );

    let totalSpanningTreeCost = 0;
    const verticesIncluded = new Array(nodeCount).fill(false);
    const minEdgeCostToTree = new Array(nodeCount).fill(Number.MAX_SAFE_INTEGER);

    const frontierEdges = new EdgePriorityQueue();

    // Start Prim's from the first node (index 0)
    minEdgeCostToTree[0] = 0;
    frontierEdges.insert([0, 0]); // [cost, vertexIndex]

    while (!frontierEdges.isEmpty()) {
        const [currentEdgeWeight, currentVertex] = frontierEdges.extractMinimum();

        if (verticesIncluded[currentVertex]) {
            continue; // Already processed this vertex
        }

        verticesIncluded[currentVertex] = true;
        totalSpanningTreeCost += currentEdgeWeight;

        for (let neighborIndex = 0; neighborIndex < nodeCount; neighborIndex++) {
            if (!verticesIncluded[neighborIndex]) {
                const weightToNeighbor = connectionMatrix[currentVertex][neighborIndex];
                if (weightToNeighbor < minEdgeCostToTree[neighborIndex]) {
                    minEdgeCostToTree[neighborIndex] = weightToNeighbor;
                    frontierEdges.insert([weightToNeighbor, neighborIndex]);
                }
            }
        }
    }

    console.log(totalSpanningTreeCost);
})();