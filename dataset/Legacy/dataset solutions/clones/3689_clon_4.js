function processGraphData(inputString) {
    const inputLines = inputString.split("\n");

    const firstLineValues = inputLines[0].split(" ").map(Number);
    const nodeCount = firstLineValues[0];
    const edgeCount = firstLineValues[1];
    const startNodeA = firstLineValues[2] - 1;
    const startNodeB = firstLineValues[3] - 1;

    const sourceNodes = [];
    const targetNodes = [];
    const weightsA = [];
    const weightsB = [];

    Array.from({ length: edgeCount }).forEach((_, idx) => {
        const edgeData = inputLines[idx + 1].split(" ").map(Number);
        sourceNodes.push(edgeData[0] - 1);
        targetNodes.push(edgeData[1] - 1);
        weightsA.push(edgeData[2]);
        weightsB.push(edgeData[3]);
    });

    const distancesFromA = calculateShortestPaths(sourceNodes, targetNodes, weightsA, startNodeA, nodeCount);
    const distancesFromB = calculateShortestPaths(sourceNodes, targetNodes, weightsB, startNodeB, nodeCount);

    const MAX_VALUE_CONSTANT = 1e15;

    const initialValues = Array.from({ length: nodeCount }, (_, idx) =>
        MAX_VALUE_CONSTANT - distancesFromA[idx] - distancesFromB[idx]
    );

    let runningMax = -Infinity;
    const finalResult = initialValues.reduceRight((acc, val, idx) => {
        runningMax = Math.max(runningMax, val);
        acc[idx] = runningMax;
        return acc;
    }, new Array(nodeCount));

    console.log(finalResult.join("\n"));
}

function calculateShortestPaths(edgeSources, edgeTargets, edgeWeights, startVertex, totalVertices) {
    const adjacencyList = Array.from({ length: totalVertices }, () => []);

    edgeSources.forEach((src, idx) => {
        const trg = edgeTargets[idx];
        const wgt = edgeWeights[idx];
        adjacencyList[src].push({ neighbor: trg, weight: wgt });
        adjacencyList[trg].push({ neighbor: src, weight: wgt });
    });

    const vertexDistances = new Array(totalVertices).fill(Infinity);
    vertexDistances[startVertex] = 0;

    class MinPriorityQueue {
        constructor() {
            this.heap = [];
        }

        _getParentIndex(idx) { return Math.floor((idx - 1) / 2); }
        _getLeftChildIndex(idx) { return 2 * idx + 1; }
        _getRightChildIndex(idx) { return 2 * idx + 2; }

        _hasParent(idx) { return this._getParentIndex(idx) >= 0; }
        _hasLeftChild(idx) { return this._getLeftChildIndex(idx) < this.heap.length; }
        _hasRightChild(idx) { return this._getRightChildIndex(idx) < this.heap.length; }

        _getParent(idx) { return this.heap[this._getParentIndex(idx)]; }
        _getLeftChild(idx) { return this.heap[this._getLeftChildIndex(idx)]; }
        _getRightChild(idx) { return this.heap[this._getRightChildIndex(idx)]; }

        _swap(idx1, idx2) {
            [this.heap[idx1], this.heap[idx2]] = [this.heap[idx2], this.heap[idx1]];
        }

        _bubbleUp() {
            let index = this.heap.length - 1;
            while (this._hasParent(index) && this._getParent(index)[0] > this.heap[index][0]) {
                this._swap(index, this._getParentIndex(index));
                index = this._getParentIndex(index);
            }
        }

        _sinkDown() {
            let index = 0;
            while (this._hasLeftChild(index)) {
                let smallerChildIndex = this._getLeftChildIndex(index);
                if (this._hasRightChild(index) && this._getRightChild(index)[0] < this._getLeftChild(index)[0]) {
                    smallerChildIndex = this._getRightChildIndex(index);
                }

                if (this.heap[index][0] < this.heap[smallerChildIndex][0]) {
                    break;
                } else {
                    this._swap(index, smallerChildIndex);
                }
                index = smallerChildIndex;
            }
        }

        enqueue(item) {
            this.heap.push(item);
            this._bubbleUp();
        }

        dequeue() {
            if (this.heap.length === 0) return null;
            if (this.heap.length === 1) return this.heap.pop();

            const item = this.heap[0];
            this.heap[0] = this.heap.pop();
            this._sinkDown();
            return item;
        }

        size() {
            return this.heap.length;
        }
    }

    const pathQueue = new MinPriorityQueue();
    pathQueue.enqueue([0, startVertex]);

    while (pathQueue.size() > 0) {
        const [currentDistance, currentVertex] = pathQueue.dequeue();

        if (currentDistance > vertexDistances[currentVertex]) {
            continue;
        }

        for (const edge of adjacencyList[currentVertex]) {
            const neighborVertex = edge.neighbor;
            const edgeWeight = edge.weight;
            const newDistance = currentDistance + edgeWeight;

            if (newDistance < vertexDistances[neighborVertex]) {
                vertexDistances[neighborVertex] = newDistance;
                pathQueue.enqueue([newDistance, neighborVertex]);
            }
        }
    }

    return vertexDistances;
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
