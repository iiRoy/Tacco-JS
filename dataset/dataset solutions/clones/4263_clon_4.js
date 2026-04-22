let inputBuffer = '';
process.stdin.on('data', (dataChunk) => {
    inputBuffer += dataChunk.toString();
});

process.stdin.on('end', () => {
    const totalNodes = parseInt(inputBuffer.trim(), 10);
    if (isNaN(totalNodes) || totalNodes < 1) {
        return; // Invalid input, though competitive programming usually ensures valid K.
    }

    const graphAdjacency = new Map(); // Represents the graph using an adjacency list
    for (let currentIdx = 0; currentIdx < totalNodes; currentIdx++) {
        graphAdjacency.set(currentIdx, []);
    }

    for (let currentIdx = 0; currentIdx < totalNodes; currentIdx++) {
        // Add edge: currentIdx -> (currentIdx + 1) % totalNodes with cost 1
        graphAdjacency.get(currentIdx).push([(currentIdx + 1) % totalNodes, 1]);
        // Add edge: currentIdx -> (currentIdx * 10) % totalNodes with cost 0
        graphAdjacency.get(currentIdx).push([(currentIdx * 10) % totalNodes, 0]);
    }

    const sourceVertex = 1;
    const targetVertex = 0;

    const minimumCosts = new Map();
    for (let vtx = 0; vtx < totalNodes; vtx++) {
        minimumCosts.set(vtx, Infinity);
    }
    minimumCosts.set(sourceVertex, 0);

    // Custom Min-Priority Queue implementation
    class NodePriorityQueue {
        constructor() {
            this.heapElements = [];
        }

        offer(item) { // item is [priority_cost, node_index]
            this.heapElements.push(item);
            this._bubbleUp();
        }

        poll() {
            if (this.isEmpty()) return null;
            if (this.heapElements.length === 1) return this.heapElements.pop();

            const topItem = this.heapElements[0];
            this.heapElements[0] = this.heapElements.pop();
            this._bubbleDown();
            return topItem;
        }

        isEmpty() {
            return this.heapElements.length === 0;
        }

        _bubbleUp() {
            let currentIndex = this.heapElements.length - 1;
            while (currentIndex > 0) {
                const parentIndex = Math.floor((currentIndex - 1) / 2);
                if (this.heapElements[parentIndex][0] > this.heapElements[currentIndex][0]) {
                    [this.heapElements[parentIndex], this.heapElements[currentIndex]] = [this.heapElements[currentIndex], this.heapElements[parentIndex]];
                    currentIndex = parentIndex;
                } else {
                    break;
                }
            }
        }

        _bubbleDown() {
            let currentIndex = 0;
            const lastIndex = this.heapElements.length - 1;
            while (true) {
                const leftChild = 2 * currentIndex + 1;
                const rightChild = 2 * currentIndex + 2;
                let smallestChild = currentIndex;

                if (leftChild <= lastIndex && this.heapElements[leftChild][0] < this.heapElements[smallestChild][0]) {
                    smallestChild = leftChild;
                }
                if (rightChild <= lastIndex && this.heapElements[rightChild][0] < this.heapElements[smallestChild][0]) {
                    smallestChild = rightChild;
                }

                if (smallestChild !== currentIndex) {
                    [this.heapElements[currentIndex], this.heapElements[smallestChild]] = [this.heapElements[smallestChild], this.heapElements[currentIndex]];
                    currentIndex = smallestChild;
                } else {
                    break;
                }
            }
        }
    }

    const frontierQueue = new NodePriorityQueue();
    frontierQueue.offer([0, sourceVertex]); // [cost_so_far, current_node]

    let finalCalculatedDistance = -1; // Default if path is not found

    while (!frontierQueue.isEmpty()) {
        const [currentCost, activeNode] = frontierQueue.poll();

        if (currentCost > minimumCosts.get(activeNode)) {
            continue; // Already found a shorter path to this node
        }

        if (activeNode === targetVertex) {
            finalCalculatedDistance = currentCost;
            break; // Found the shortest path to the target
        }

        const neighbors = graphAdjacency.get(activeNode) || [];
        for (const [neighborNode, edgeWeight] of neighbors) {
            const potentialNewCost = currentCost + edgeWeight;
            if (potentialNewCost < minimumCosts.get(neighborNode)) {
                minimumCosts.set(neighborNode, potentialNewCost);
                frontierQueue.offer([potentialNewCost, neighborNode]);
            }
        }
    }

    // The original problem adds 1 to the result of d[1][0]
    process.stdout.write((finalCalculatedDistance + 1) + '\n');
});