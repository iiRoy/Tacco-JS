let rawInputAccumulator = '';

(async function() {
    const inputPromise = new Promise(resolve => {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', chunk => {
            rawInputAccumulator += chunk;
        });
        process.stdin.on('end', () => {
            resolve(rawInputAccumulator);
        });
    });

    const collectedInput = await inputPromise;
    initiateTraversal(collectedInput);
})();

class MinPriorityQueue {
    constructor() {
        this.elements = [];
    }

    add(element) {
        this.elements.push(element);
        this.bubbleUp();
    }

    extractMin() {
        const minElement = this.elements[0];
        const lastElement = this.elements.pop();
        if (this.elements.length > 0) {
            this.elements[0] = lastElement;
            this.sinkDown();
        }
        return minElement;
    }

    isEmpty() {
        return this.elements.length === 0;
    }

    peek() {
        return this.elements[0];
    }

    bubbleUp() {
        let index = this.elements.length - 1;
        const element = this.elements[index];
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            let parent = this.elements[parentIndex];
            if (element.elapsed >= parent.elapsed) break;
            this.elements[parentIndex] = element;
            this.elements[index] = parent;
            index = parentIndex;
        }
    }

    sinkDown() {
        let index = 0;
        const totalLength = this.elements.length;
        const element = this.elements[0];
        while (true) {
            let leftChildIdx = 2 * index + 1;
            let rightChildIdx = 2 * index + 2;
            let leftChild, rightChild;
            let swapIdx = null;

            if (leftChildIdx < totalLength) {
                leftChild = this.elements[leftChildIdx];
                if (leftChild.elapsed < element.elapsed) {
                    swapIdx = leftChildIdx;
                }
            }
            if (rightChildIdx < totalLength) {
                rightChild = this.elements[rightChildIdx];
                if (
                    (swapIdx === null && rightChild.elapsed < element.elapsed) ||
                    (swapIdx !== null && rightChild.elapsed < leftChild.elapsed)
                ) {
                    swapIdx = rightChildIdx;
                }
            }
            if (swapIdx === null) break;
            this.elements[index] = this.elements[swapIdx];
            this.elements[swapIdx] = element;
            index = swapIdx;
        }
    }
}

function initiateTraversal(incomingPayload) {
    const payloadLines = incomingPayload.split('\n');

    const firstLineParams = payloadLines[0].split(' ').map(Number);
    const vertexCount = firstLineParams[0];
    const edgeCount = firstLineParams[1];
    const initialCapacity = firstLineParams[2];

    const nodeCapacities = new Map();
    const adjacencyRegistry = new Map();
    const connectionDetails = [];

    for (let currentIdx = 0; currentIdx < vertexCount; currentIdx++) {
        nodeCapacities.set(currentIdx, Number(payloadLines[currentIdx + 1]));
        adjacencyRegistry.set(currentIdx, []);
    }

    for (let currentIdx = 0; currentIdx < edgeCount; currentIdx++) {
        const connectionInfo = payloadLines[currentIdx + vertexCount + 1].split(' ').map(Number);
        const originNode = connectionInfo[0] - 1;
        const destinationNode = connectionInfo[1] - 1;
        const transitCost = connectionInfo[2];

        adjacencyRegistry.get(originNode).push({
            destination: destinationNode,
            tariff: transitCost
        });
        adjacencyRegistry.get(destinationNode).push({
            destination: originNode,
            tariff: transitCost
        });
        connectionDetails.push({
            from: originNode,
            to: destinationNode,
            weight: transitCost
        });
    }

    function computeResidualCosts(vertexTotal, terminalNode, connections) {
        const pathEstimates = new Map();
        for (let idx = 0; idx < vertexTotal; idx++) {
            pathEstimates.set(idx, Infinity);
        }
        pathEstimates.set(terminalNode, 0);

        let hasUpdated = true;
        let iterationCounter = 0;
        const maxIterations = vertexTotal * 2; 

        while (hasUpdated && iterationCounter < maxIterations) {
            hasUpdated = false;
            for (const connection of connections) {
                const origin = connection.from;
                const destination = connection.to;
                const cost = connection.weight;

                const currentOriginEstimate = pathEstimates.get(origin);
                const currentDestEstimate = pathEstimates.get(destination);

                if (currentDestEstimate > currentOriginEstimate + cost && nodeCapacities.get(destination) >= cost) {
                    pathEstimates.set(destination, currentOriginEstimate + cost);
                    hasUpdated = true;
                }
                if (currentOriginEstimate > currentDestEstimate + cost && nodeCapacities.get(origin) >= cost) {
                    pathEstimates.set(origin, currentDestEstimate + cost);
                    hasUpdated = true;
                }
            }
            iterationCounter++;
        }
        return pathEstimates;
    }

    const residualPathCosts = computeResidualCosts(vertexCount, vertexCount - 1, connectionDetails);

    const travelQueue = new MinPriorityQueue();
    const visitedStates = new Map();

    const initialJourney = {
        location: 0,
        elapsed: 0,
        energy: initialCapacity
    };
    travelQueue.add(initialJourney);

    const initialVisitedRecords = [];
    initialVisitedRecords.push({ pastTime: 0, pastFuel: initialCapacity });
    visitedStates.set(0, initialVisitedRecords);

    let minimumTransitTime = Infinity;

    while (!travelQueue.isEmpty()) {
        const currentJourney = travelQueue.extractMin();

        if (currentJourney.elapsed + residualPathCosts.get(currentJourney.location) * 2 - currentJourney.energy >= minimumTransitTime) {
            continue;
        }

        const currentAdjacencies = adjacencyRegistry.get(currentJourney.location);
        for (const connection of currentAdjacencies) {
            const nextDestination = connection.destination;
            const edgeTariff = connection.tariff;

            if (nodeCapacities.get(currentJourney.location) < edgeTariff) {
                continue;
            }

            let newJourney;
            const nextNodeCapacity = nodeCapacities.get(nextDestination);

            if (nextNodeCapacity + edgeTariff < currentJourney.energy) {
                newJourney = {
                    location: nextDestination,
                    elapsed: currentJourney.elapsed + edgeTariff + currentJourney.energy - (nextNodeCapacity + edgeTariff),
                    energy: nextNodeCapacity
                };
            } else if (nextNodeCapacity + edgeTariff >= currentJourney.energy && currentJourney.energy >= edgeTariff) {
                newJourney = {
                    location: nextDestination,
                    elapsed: currentJourney.elapsed + edgeTariff,
                    energy: currentJourney.energy - edgeTariff
                };
            } else {
                newJourney = {
                    location: nextDestination,
                    elapsed: currentJourney.elapsed + edgeTariff + edgeTariff - currentJourney.energy,
                    energy: 0
                };
            }

            if (nextDestination === vertexCount - 1) {
                minimumTransitTime = Math.min(minimumTransitTime, newJourney.elapsed + nodeCapacities.get(vertexCount - 1) - newJourney.energy);
            } else {
                let existingRecords = visitedStates.get(nextDestination) || [];
                let isRedundant = existingRecords.some(pastRecord =>
                    pastRecord.pastTime < newJourney.elapsed && pastRecord.pastFuel >= newJourney.energy
                );

                if (!isRedundant) {
                    existingRecords.push({ pastTime: newJourney.elapsed, pastFuel: newJourney.energy });
                    visitedStates.set(nextDestination, existingRecords);
                    travelQueue.add(newJourney);
                }
            }
        }
    }

    if (minimumTransitTime === Infinity) {
        console.log(-1);
    } else {
        console.log(minimumTransitTime);
    }
}