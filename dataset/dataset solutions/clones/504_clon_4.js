function createMinHeap() {
    const heapItems = [];

    function getParentPosition(pos) { return Math.floor((pos - 1) / 2); }
    function getLeftChildPosition(pos) { return 2 * pos + 1; }
    function getRightChildPosition(pos) { return 2 * pos + 2; }

    function hasParentItem(pos) { return getParentPosition(pos) >= 0; }
    function hasLeftChildItem(pos) { return getLeftChildPosition(pos) < heapItems.length; }
    function hasRightChildItem(pos) { return getRightChildPosition(pos) < heapItems.length; }

    function getParent(pos) { return heapItems[getParentPosition(pos)]; }
    function getLeftChild(pos) { return heapItems[getLeftChildPosition(pos)]; }
    function getRightChild(pos) { return heapItems[getRightChildPosition(pos)]; }

    function swapElements(pos1, pos2) {
        [heapItems[pos1], heapItems[pos2]] = [heapItems[pos2], heapItems[pos1]];
    }

    function moveUp() {
        let currentPosition = heapItems.length - 1;
        while (hasParentItem(currentPosition) && getParent(currentPosition)[0] > heapItems[currentPosition][0]) {
            swapElements(currentPosition, getParentPosition(currentPosition));
            currentPosition = getParentPosition(currentPosition);
        }
    }

    function moveDown() {
        let currentPosition = 0;
        while (hasLeftChildItem(currentPosition)) {
            let smallerChildPosition = getLeftChildPosition(currentPosition);
            if (hasRightChildItem(currentPosition) && getRightChild(currentPosition)[0] < getLeftChild(currentPosition)[0]) {
                smallerChildPosition = getRightChildPosition(currentPosition);
            }

            if (heapItems[currentPosition][0] < heapItems[smallerChildPosition][0]) {
                break;
            } else {
                swapElements(currentPosition, smallerChildPosition);
            }
            currentPosition = smallerChildPosition;
        }
    }

    return {
        enqueue: function(itemValue) {
            heapItems.push(itemValue);
            moveUp();
        },
        dequeueMin: function() {
            if (heapItems.length === 0) return undefined;
            if (heapItems.length === 1) return heapItems.pop();
            const minimum = heapItems[0];
            heapItems[0] = heapItems.pop();
            moveDown();
            return minimum;
        },
        isEmpty: function() {
            return heapItems.length === 0;
        }
    };
}

const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const contentSegments = sourceContent.trim().split("\n");
let currentSegmentIndex = 0;

function retrieveNextSegment() {
    return contentSegments[currentSegmentIndex++];
}

while (true) {
    const graphDimensions = retrieveNextSegment().split(" ").map(Number);
    if (graphDimensions[0] === 0 && graphDimensions[1] === 0) break;

    const totalNodes = graphDimensions[0];
    const totalEdges = graphDimensions[1];
    const originNode = 1;
    const destinationNode = totalNodes;

    const graphConnections = new Map();
    for (let nodeIdentifier = 1; nodeIdentifier <= totalNodes; ++nodeIdentifier) {
        graphConnections.set(nodeIdentifier, []);
    }

    for (let edgeCounter = 0; edgeCounter < totalEdges; ++edgeCounter) {
        const connectionDetails = retrieveNextSegment().split(" ").map(Number);
        const pointOne = connectionDetails[0];
        const pointTwo = connectionDetails[1];
        const linkCost = connectionDetails[2];
        graphConnections.get(pointOne).push({ neighbor: pointTwo, weight: linkCost });
        graphConnections.get(pointTwo).push({ neighbor: pointOne, weight: linkCost });
    }

    const minimumPathCosts = new Map();
    for (let nodeIdentifier = 1; nodeIdentifier <= totalNodes; ++nodeIdentifier) {
        minimumPathCosts.set(nodeIdentifier, [Infinity, Infinity, Infinity]);
    }

    const stateQueue = createMinHeap();
    minimumPathCosts.get(originNode)[0] = 0;
    stateQueue.enqueue([0, originNode, 0]);

    while (!stateQueue.isEmpty()) {
        const [cumulativeCost, activeNode, activeStateVariant] = stateQueue.dequeueMin();

        if (cumulativeCost > minimumPathCosts.get(activeNode)[activeStateVariant]) {
            continue;
        }

        const connectedNeighbors = graphConnections.get(activeNode) || [];

        for (const connectedLink of connectedNeighbors) {
            const nextNode = connectedLink.neighbor;
            const linkWeight = connectedLink.weight;

            if (activeStateVariant === 0) {
                const potentialCostZero = cumulativeCost + linkWeight;
                if (potentialCostZero < minimumPathCosts.get(nextNode)[0]) {
                    minimumPathCosts.get(nextNode)[0] = potentialCostZero;
                    stateQueue.enqueue([potentialCostZero, nextNode, 0]);
                }
            }

            if (activeStateVariant === 0) {
                const potentialCostOne = cumulativeCost;
                if (potentialCostOne < minimumPathCosts.get(nextNode)[1]) {
                    minimumPathCosts.get(nextNode)[1] = potentialCostOne;
                    stateQueue.enqueue([potentialCostOne, nextNode, 1]);
                }
            }

            if (activeStateVariant === 1) {
                const potentialCostTwoFromOne = cumulativeCost;
                if (potentialCostTwoFromOne < minimumPathCosts.get(nextNode)[2]) {
                    minimumPathCosts.get(nextNode)[2] = potentialCostTwoFromOne;
                    stateQueue.enqueue([potentialCostTwoFromOne, nextNode, 2]);
                }
            }

            if (activeStateVariant === 2) {
                const potentialCostTwoFromTwo = cumulativeCost + linkWeight;
                if (potentialCostTwoFromTwo < minimumPathCosts.get(nextNode)[2]) {
                    minimumPathCosts.get(nextNode)[2] = potentialCostTwoFromTwo;
                    stateQueue.enqueue([potentialCostTwoFromTwo, nextNode, 2]);
                }
            }
        }
    }

    const finalNodeCosts = minimumPathCosts.get(destinationNode);
    let ultimateResult = Infinity;
    ultimateResult = Math.min(ultimateResult, finalNodeCosts[0]);
    ultimateResult = Math.min(ultimateResult, finalNodeCosts[2]);

    console.log(ultimateResult);
}