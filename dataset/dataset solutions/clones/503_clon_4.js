const rawInputSource = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineSegments = rawInputSource.trim().split("\n");

class MinPriorityQueue {
    constructor() {
        this.heapContent = [];
    }

    insertElement(item) {
        this.heapContent.push(item);
        this.siftUp();
    }

    extractMin() {
        if (this.isEmpty()) {
            return undefined;
        }
        const minimumValue = this.heapContent[0];
        const lastElement = this.heapContent.pop();
        if (!this.isEmpty()) {
            this.heapContent[0] = lastElement;
            this.siftDown();
        }
        return minimumValue;
    }

    isEmpty() {
        return this.heapContent.length === 0;
    }

    siftUp() {
        let currentElementIndex = this.heapContent.length - 1;
        while (currentElementIndex > 0) {
            const parentElementIndex = Math.floor((currentElementIndex - 1) / 2);
            if (this.heapContent[parentElementIndex][0] > this.heapContent[currentElementIndex][0]) {
                [this.heapContent[parentElementIndex], this.heapContent[currentElementIndex]] = [this.heapContent[currentElementIndex], this.heapContent[parentElementIndex]];
                currentElementIndex = parentElementIndex;
            } else {
                break;
            }
        }
    }

    siftDown() {
        let currentElementIndex = 0;
        const totalElements = this.heapContent.length;
        const rootElement = this.heapContent[0];
        while (true) {
            let leftChildPosition = 2 * currentElementIndex + 1;
            let rightChildPosition = 2 * currentElementIndex + 2;
            let leftChildItem, rightChildItem;
            let swapPosition = null;

            if (leftChildPosition < totalElements) {
                leftChildItem = this.heapContent[leftChildPosition];
                if (leftChildItem[0] < rootElement[0]) {
                    swapPosition = leftChildPosition;
                }
            }

            if (rightChildPosition < totalElements) {
                rightChildItem = this.heapContent[rightChildPosition];
                if (
                    (swapPosition === null && rightChildItem[0] < rootElement[0]) ||
                    (swapPosition !== null && rightChildItem[0] < leftChildItem[0])
                ) {
                    swapPosition = rightChildPosition;
                }
            }

            if (swapPosition === null) break;
            [this.heapContent[currentElementIndex], this.heapContent[swapPosition]] = [this.heapContent[swapPosition], this.heapContent[currentElementIndex]];
            currentElementIndex = swapPosition;
        }
    }
}

function processProblemScenario(remainingInputLines) {
    if (remainingInputLines.length === 0) {
        return;
    }

    const currentScenarioLine = remainingInputLines.shift();
    const parsedDimensions = currentScenarioLine.split(" ").map(Number);
    const totalVertices = parsedDimensions[0];
    const totalEdges = parsedDimensions[1];

    if (totalVertices === 0 && totalEdges === 0) {
        return; // Termination condition for input processing
    }

    const startingNode = 1;
    const endingNode = totalVertices;
    const maximumBombAllowance = 2;

    const recordedEdgeData = [];
    for (let edgeIndex = 0; edgeIndex < totalEdges; edgeIndex++) {
        recordedEdgeData.push(remainingInputLines.shift().split(" ").map(Number));
    }

    const networkConnections = new Map();
    for (let nodeIdentifier = 1; nodeIdentifier <= totalVertices; nodeIdentifier++) {
        networkConnections.set(nodeIdentifier, []);
    }
    recordedEdgeData.forEach(function(edgeDetail) {
        const originNode = edgeDetail[0];
        const destinationNode = edgeDetail[1];
        const traversalCost = edgeDetail[2];
        networkConnections.get(originNode).push({ target: destinationNode, cost: traversalCost });
        networkConnections.get(destinationNode).push({ target: originNode, cost: traversalCost }); // Bidirectional
    });

    // minimumPathCosts[node_id][bombs_utilized]
    const minimumPathCosts = Array.from({ length: totalVertices + 1 }, () =>
        Array(maximumBombAllowance + 1).fill(Infinity)
    );

    const activeExplorationQueue = new MinPriorityQueue();

    minimumPathCosts[startingNode][0] = 0;
    activeExplorationQueue.insertElement([0, startingNode, 0]); // [accumulated_cost, current_node, bombs_used_so_far]

    while (!activeExplorationQueue.isEmpty()) {
        const [currentAccumulatedCost, currentPosition, currentBombsUtilized] = activeExplorationQueue.extractMin();

        if (currentAccumulatedCost > minimumPathCosts[currentPosition][currentBombsUtilized]) {
            continue; // Already discovered a more efficient route to this state
        }

        const connectedRoutes = networkConnections.get(currentPosition) || [];

        for (const route of connectedRoutes) {
            const nextPosition = route.target;
            const segmentCost = route.cost;

            // Strategy 1: Traverse the segment normally (without using a bomb)
            // This is permitted only if currentBombsUtilized is 0 or 2, mirroring original logic
            if (currentBombsUtilized === 0 || currentBombsUtilized === 2) {
                const newAccumulatedCostNormal = currentAccumulatedCost + segmentCost;
                const newBombsUtilizedNormal = currentBombsUtilized;
                if (newAccumulatedCostNormal < minimumPathCosts[nextPosition][newBombsUtilizedNormal]) {
                    minimumPathCosts[nextPosition][newBombsUtilizedNormal] = newAccumulatedCostNormal;
                    activeExplorationQueue.insertElement([newAccumulatedCostNormal, nextPosition, newBombsUtilizedNormal]);
                }
            }

            // Strategy 2: Use a bomb on this segment (cost is nullified)
            // This is permitted only if currentBombsUtilized is 0 or 1, mirroring original logic
            if (currentBombsUtilized < maximumBombAllowance) {
                const newAccumulatedCostBomb = currentAccumulatedCost; // Cost of segment is skipped
                const newBombsUtilizedBomb = currentBombsUtilized + 1;
                if (newAccumulatedCostBomb < minimumPathCosts[nextPosition][newBombsUtilizedBomb]) {
                    minimumPathCosts[nextPosition][newBombsUtilizedBomb] = newAccumulatedCostBomb;
                    activeExplorationQueue.insertElement([newAccumulatedCostBomb, nextPosition, newBombsUtilizedBomb]);
                }
            }
        }
    }

    let overallShortestPath = Infinity;
    // As per original problem's output logic, paths with exactly one bomb utilized are not considered for the final answer.
    overallShortestPath = Math.min(overallShortestPath, minimumPathCosts[endingNode][0]);
    overallShortestPath = Math.min(overallShortestPath, minimumPathCosts[endingNode][2]);

    console.log(overallShortestPath);

    processProblemScenario(remainingInputLines); // Recursively process the subsequent scenario
}

processProblemScenario(lineSegments);