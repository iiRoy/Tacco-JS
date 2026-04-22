const obtainInputTokens = (rawInputString) => {
    const allTokens = rawInputString.split(/[\s\n]+/).filter(Boolean);
    let currentTokenIndex = 0;

    const retrieveNextValue = (asNumeric = true) => {
        if (currentTokenIndex >= allTokens.length) {
            throw new Error("End of input reached.");
        }
        const token = allTokens[currentTokenIndex++];
        return asNumeric ? Number(token) : token;
    };

    const retrieveMultipleValues = (quantity, asNumeric = true) => {
        const values = [];
        for (let k = 0; k < quantity; k++) {
            values.push(retrieveNextValue(asNumeric));
        }
        return values;
    };

    return { retrieveNextValue, retrieveMultipleValues };
};

class MinHeap {
    constructor() {
        this.heapElements = [];
    }

    add(priority, value) {
        this.heapElements.push({ priority, value });
        this.bubbleUp();
    }

    extractMin() {
        if (this.isEmpty()) {
            return undefined;
        }
        const minElement = this.heapElements[0];
        const lastElement = this.heapElements.pop();
        if (!this.isEmpty()) {
            this.heapElements[0] = lastElement;
            this.bubbleDown();
        }
        return minElement;
    }

    size() {
        return this.heapElements.length;
    }

    isEmpty() {
        return this.heapElements.length === 0;
    }

    bubbleUp() {
        let currentIndex = this.heapElements.length - 1;
        while (currentIndex > 0) {
            const parentIndex = Math.floor((currentIndex - 1) / 2);
            if (this.heapElements[currentIndex].priority < this.heapElements[parentIndex].priority) {
                [this.heapElements[currentIndex], this.heapElements[parentIndex]] =
                    [this.heapElements[parentIndex], this.heapElements[currentIndex]];
                currentIndex = parentIndex;
            } else {
                break;
            }
        }
    }

    bubbleDown() {
        let currentIndex = 0;
        const totalElements = this.heapElements.length;
        const currentElement = this.heapElements[0];

        while (true) {
            const leftChildIndex = 2 * currentIndex + 1;
            const rightChildIndex = 2 * currentIndex + 2;
            let swapIndex = null;

            if (leftChildIndex < totalElements) {
                if (this.heapElements[leftChildIndex].priority < currentElement.priority) {
                    swapIndex = leftChildIndex;
                }
            }

            if (rightChildIndex < totalElements) {
                if (
                    (swapIndex === null && this.heapElements[rightChildIndex].priority < currentElement.priority) ||
                    (swapIndex !== null && this.heapElements[rightChildIndex].priority < this.heapElements[leftChildIndex].priority)
                ) {
                    swapIndex = rightChildIndex;
                }
            }

            if (swapIndex === null) {
                break;
            }

            [this.heapElements[currentIndex], this.heapElements[swapIndex]] =
                [this.heapElements[swapIndex], this.heapElements[currentIndex]];
            currentIndex = swapIndex;
        }
    }
}

const calculateShortestPaths = (startPoint, adjacencyMap, totalNodes) => {
    const INFINITY_VALUE = Number.POSITIVE_INFINITY;
    const pathCosts = Array(totalNodes).fill(INFINITY_VALUE);
    pathCosts[startPoint] = 0;

    const visitQueue = new MinHeap();
    visitQueue.add(0, startPoint);

    while (!visitQueue.isEmpty()) {
        const { priority: currentCost, value: currentNode } = visitQueue.extractMin();

        if (currentCost > pathCosts[currentNode]) {
            continue;
        }

        const neighbors = adjacencyMap.get(currentNode) || [];
        for (const edge of neighbors) {
            const potentialNewCost = currentCost + edge.weight;
            if (potentialNewCost < pathCosts[edge.target]) {
                pathCosts[edge.target] = potentialNewCost;
                visitQueue.add(potentialNewCost, edge.target);
            }
        }
    }
    return pathCosts;
};

const executeScenario = (rawInput) => {
    const inputReader = obtainInputTokens(rawInput);
    const [cityCount, roadCount, initialFunds] = inputReader.retrieveMultipleValues(3);

    const MAX_FUNDS_STATE = 2500;
    const totalPossibleStates = cityCount * MAX_FUNDS_STATE;

    const nodeConnections = new Map();

    const establishConnection = (origin, destination, weight) => {
        if (!nodeConnections.has(origin)) {
            nodeConnections.set(origin, []);
        }
        nodeConnections.get(origin).push({ target: destination, weight: weight });
    };

    for (let r = 0; r < roadCount; r++) {
        const [sourceCity, targetCity, fundsRequired, travelCost] = inputReader.retrieveMultipleValues(4);
        const adjustedSourceBase = (sourceCity - 1) * MAX_FUNDS_STATE;
        const adjustedTargetBase = (targetCity - 1) * MAX_FUNDS_STATE;

        for (let currentMoneyLevel = MAX_FUNDS_STATE - 1; currentMoneyLevel >= fundsRequired; currentMoneyLevel--) {
            establishConnection(
                adjustedSourceBase + currentMoneyLevel,
                adjustedTargetBase + (currentMoneyLevel - fundsRequired),
                travelCost
            );
            establishConnection(
                adjustedTargetBase + currentMoneyLevel,
                adjustedSourceBase + (currentMoneyLevel - fundsRequired),
                travelCost
            );
        }
    }

    for (let c = 0; c < cityCount; c++) {
        const [exchangeAmount, exchangeFee] = inputReader.retrieveMultipleValues(2);
        const cityBaseState = c * MAX_FUNDS_STATE;

        for (let currentMoneyLevel = 0; currentMoneyLevel < MAX_FUNDS_STATE - 1; currentMoneyLevel++) {
            const nextMoneyLevel = Math.min(MAX_FUNDS_STATE - 1, currentMoneyLevel + exchangeAmount);
            establishConnection(
                cityBaseState + currentMoneyLevel,
                cityBaseState + nextMoneyLevel,
                exchangeFee
            );
        }
    }

    const startNodeComplexIndex = Math.min(MAX_FUNDS_STATE - 1, initialFunds);

    const allPathCosts = calculateShortestPaths(startNodeComplexIndex, nodeConnections, totalPossibleStates);

    const minimumCostsPerCity = Array(cityCount).fill(Number.POSITIVE_INFINITY);

    for (let cityIndex = 1; cityIndex < cityCount; cityIndex++) {
        const baseOffset = cityIndex * MAX_FUNDS_STATE;
        for (let moneyState = 0; moneyState < MAX_FUNDS_STATE; moneyState++) {
            minimumCostsPerCity[cityIndex] = Math.min(
                minimumCostsPerCity[cityIndex],
                allPathCosts[baseOffset + moneyState]
            );
        }
    }

    return minimumCostsPerCity.slice(1).join("\n");
};

const standardInput = require("fs").readFileSync("/dev/stdin", "utf8");
const programOutput = executeScenario(standardInput);
if (programOutput !== undefined) {
    console.log(programOutput);
}