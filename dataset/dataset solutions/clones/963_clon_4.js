const processingParameters = { dataOrigin: '/dev/stdin', lineDelimiter: '\n' }; // linux
// const processingParameters = { dataOrigin: 'tmp', lineDelimiter: '\r\n' }; // win

const fileContent = require('node:fs').readFileSync(processingParameters.dataOrigin, { encoding: 'ascii' });

const contentSegments = fileContent.split(processingParameters.lineDelimiter).filter(segment => segment.length > 0);

const totalVertices = Number(contentSegments.shift());

const graphEntities = new Map(); // Stores all node objects, keyed by their ID

const establishLink = (entityCollection, primaryId, secondaryId, connectionValue) => {
    let currentPrimary = entityCollection.get(primaryId);
    if (!currentPrimary) {
        currentPrimary = {
            uniqueId: primaryId,
            shortestPath: Number.MAX_VALUE,
            priorVertex: null,
            connectedTo: new Map() // Adjacency list for this node
        };
        entityCollection.set(primaryId, currentPrimary);
    }
    currentPrimary.connectedTo.set(secondaryId, connectionValue);

    // Ensure the secondary node also exists in the collection
    if (!entityCollection.has(secondaryId)) {
        entityCollection.set(secondaryId, {
            uniqueId: secondaryId,
            shortestPath: Number.MAX_VALUE,
            priorVertex: null,
            connectedTo: new Map()
        });
    }
};

contentSegments.forEach(currentSegment => {
    const numericalValues = currentSegment.match(/\d+/g).map(Number);
    const startVertexId = numericalValues[0];

    // Ensure the starting vertex exists in the graphEntities map
    if (!graphEntities.has(startVertexId)) {
        graphEntities.set(startVertexId, {
            uniqueId: startVertexId,
            shortestPath: Number.MAX_VALUE,
            priorVertex: null,
            connectedTo: new Map()
        });
    }

    for (let currentIdx = 1; currentIdx < numericalValues.length; currentIdx += 2) {
        const endVertexId = numericalValues[currentIdx];
        const linkWeight = numericalValues[currentIdx + 1];
        establishLink(graphEntities, startVertexId, endVertexId, linkWeight);
    }
});

// Initialize the distance for the source node (node 0)
const sourceVertex = graphEntities.get(0);
if (sourceVertex) {
    sourceVertex.shortestPath = 0;
} else {
    // If node 0 wasn't mentioned in the input, create it and set its distance
    graphEntities.set(0, {
        uniqueId: 0,
        shortestPath: 0,
        priorVertex: null,
        connectedTo: new Map()
    });
}


class MinimumValuePriorityQueue {
    constructor() {
        this.internalHeap = [];
    }

    // Adds an element to the queue
    enqueue(item) {
        this.internalHeap.push(item);
        this._heapifyUp(this.internalHeap.length - 1);
    }

    // Removes and returns the element with the smallest 'shortestPath' value
    dequeue() {
        if (this.isEmpty()) return undefined;
        const minItem = this.internalHeap[0];
        const lastItem = this.internalHeap.pop();
        if (!this.isEmpty()) {
            this.internalHeap[0] = lastItem;
            this._heapifyDown(0);
        }
        return minItem;
    }

    // Checks if the queue is empty
    isEmpty() {
        return this.internalHeap.length === 0;
    }

    _heapifyUp(index) {
        const itemToPlace = this.internalHeap[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.internalHeap[parentIndex];
            if (itemToPlace.shortestPath >= parent.shortestPath) break;
            this.internalHeap[parentIndex] = itemToPlace;
            this.internalHeap[index] = parent;
            index = parentIndex;
        }
    }

    _heapifyDown(index) {
        const heapSize = this.internalHeap.length;
        const itemToPlace = this.internalHeap[index];
        while (true) {
            let leftChildPosition = 2 * index + 1;
            let rightChildPosition = 2 * index + 2;
            let leftChild, rightChild;
            let swapPosition = null;

            if (leftChildPosition < heapSize) {
                leftChild = this.internalHeap[leftChildPosition];
                if (leftChild.shortestPath < itemToPlace.shortestPath) {
                    swapPosition = leftChildPosition;
                }
            }
            if (rightChildPosition < heapSize) {
                rightChild = this.internalHeap[rightChildPosition];
                if (
                    (swapPosition === null && rightChild.shortestPath < itemToPlace.shortestPath) ||
                    (swapPosition !== null && rightChild.shortestPath < leftChild.shortestPath)
                ) {
                    swapPosition = rightChildPosition;
                }
            }
            if (swapPosition === null) break;
            this.internalHeap[index] = this.internalHeap[swapPosition];
            this.internalHeap[swapPosition] = itemToPlace;
            index = swapPosition;
        }
    }
}

const computeMinimumPathways = (graphStructure, initialIdentifier) => {
    const processingQueue = new MinimumValuePriorityQueue();
    const finalizedVertices = new Set(); 

    const startingVertex = graphStructure.get(initialIdentifier);
    if (startingVertex) {
        processingQueue.enqueue(startingVertex);
    }

    while (!processingQueue.isEmpty()) {
        const currentVertex = processingQueue.dequeue();

        if (finalizedVertices.has(currentVertex.uniqueId)) {
            continue;
        }
        finalizedVertices.add(currentVertex.uniqueId);

        currentVertex.connectedTo.forEach((costToNeighbor, neighborIdentifier) => {
            const neighborVertex = graphStructure.get(neighborIdentifier);
            if (!neighborVertex) {
                return; 
            }

            const prospectiveNewDistance = currentVertex.shortestPath + costToNeighbor;

            if (prospectiveNewDistance < neighborVertex.shortestPath) {
                neighborVertex.shortestPath = prospectiveNewDistance;
                neighborVertex.priorVertex = currentVertex.uniqueId;
                processingQueue.enqueue(neighborVertex); 
            }
        });
    }
};

computeMinimumPathways(graphEntities, 0); 

graphEntities.forEach(vertexInformation => {
    const finalDistance = vertexInformation.shortestPath === Number.MAX_VALUE ? 'Infinity' : vertexInformation.shortestPath;
    console.log(`${vertexInformation.uniqueId} ${finalDistance}`);
});