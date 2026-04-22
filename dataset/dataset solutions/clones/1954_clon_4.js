let rawInputBuffer = '';
process.stdin.on('data', chunk => {
    rawInputBuffer += chunk.toString();
});

process.stdin.on('end', () => {
    const finalResult = processGraphPathfinder();
    if (finalResult !== undefined) {
        process.stdout.write(finalResult + '\n');
    }
});

let inputTokenSource;
let currentTokenPtr = 0;

function* tokenSequenceGenerator() {
    const parsedTokens = rawInputBuffer.split(/\s+/).filter(Boolean);
    while (currentTokenPtr < parsedTokens.length) {
        yield parsedTokens[currentTokenPtr++];
    }
}

function retrieveNextInteger() {
    return parseInt(inputTokenSource.next().value, 10);
}

function retrieveMultipleIntegers(count) {
    const numberCollection = [];
    for (let i = 0; i < count; i++) {
        numberCollection.push(retrieveNextInteger());
    }
    return numberCollection;
}

function construct2DArray(rows, columns, initialElement) {
    const newGrid = new Array(rows);
    for (let r = 0; r < rows; r++) {
        newGrid[r] = new Array(columns).fill(initialElement);
    }
    return newGrid;
}

class MinPriorityHeap {
    #elements = [];

    addItem(itemTuple) {
        this.#elements.push(itemTuple);
        this.#heapifyUp(this.#elements.length - 1);
    }

    extractSmallest() {
        if (this.isEmpty()) {
            return undefined;
        }
        const smallest = this.#elements[0];
        const lastElement = this.#elements.pop();
        if (!this.isEmpty()) {
            this.#elements[0] = lastElement;
            this.#heapifyDown(0);
        }
        return smallest;
    }

    isEmpty() {
        return this.#elements.length === 0;
    }

    #heapifyUp(index) {
        const item = this.#elements[index];
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            let parent = this.#elements[parentIndex];
            if (item[0] >= parent[0]) {
                break;
            }
            this.#elements[index] = parent;
            index = parentIndex;
        }
        this.#elements[index] = item;
    }

    #heapifyDown(index) {
        const totalLength = this.#elements.length;
        const item = this.#elements[index];

        while (true) {
            let leftChildIdx = 2 * index + 1;
            let rightChildIdx = 2 * index + 2;
            let leftChildVal, rightChildVal;
            let swapCandidateIdx = null;

            if (leftChildIdx < totalLength) {
                leftChildVal = this.#elements[leftChildIdx];
                if (leftChildVal[0] < item[0]) {
                    swapCandidateIdx = leftChildIdx;
                }
            }
            if (rightChildIdx < totalLength) {
                rightChildVal = this.#elements[rightChildIdx];
                if (
                    (swapCandidateIdx === null && rightChildVal[0] < item[0]) ||
                    (swapCandidateIdx !== null && rightChildVal[0] < leftChildVal[0])
                ) {
                    swapCandidateIdx = rightChildIdx;
                }
            }

            if (swapCandidateIdx === null) {
                break;
            }

            this.#elements[index] = this.#elements[swapCandidateIdx];
            index = swapCandidateIdx;
        }
        this.#elements[index] = item;
    }
}


function processGraphPathfinder() {
    inputTokenSource = tokenSequenceGenerator();

    const [numNodes, numConnections, initialCoinSupply] = retrieveMultipleIntegers(3);
    const maximumCoinCapacity = numNodes * 50 - numNodes;

    const nodeAdjacencies = new Map(); // Map: nodeID -> Array of {destination, coinCost, travelTime}
    for (let i = 0; i < numNodes; i++) {
        nodeAdjacencies.set(i, []);
    }

    for (let k = 0; k < numConnections; k++) {
        const [origin, terminus, coinPrice, duration] = retrieveMultipleIntegers(4);
        const nodeA = origin - 1;
        const nodeB = terminus - 1;
        nodeAdjacencies.get(nodeA).push({ destination: nodeB, coinCost: coinPrice, travelTime: duration });
        nodeAdjacencies.get(nodeB).push({ destination: nodeA, coinCost: coinPrice, travelTime: duration });
    }

    const tradeDetails = []; // Array of {coinGain, timeExpense}
    for (let i = 0; i < numNodes; i++) {
        const [gainAmt, expenseTime] = retrieveMultipleIntegers(2);
        tradeDetails.push({ coinGain: gainAmt, timeExpense: expenseTime });
    }

    const infiniteTimeValue = 1e18;
    const minimumStateTimes = construct2DArray(numNodes, maximumCoinCapacity + 1, infiniteTimeValue);

    const shortestArrivals = new Array(numNodes).fill(infiniteTimeValue);
    let unvisitedNodeCount = numNodes;

    const eventScheduler = new MinPriorityHeap();

    let currentCoinBalance = initialCoinSupply;
    if (currentCoinBalance > maximumCoinCapacity) {
        currentCoinBalance = maximumCoinCapacity;
    }

    // Item format: [priority_time, node_index, current_coin_balance]
    eventScheduler.addItem([0, 0, currentCoinBalance]);
    minimumStateTimes[0][currentCoinBalance] = 0;

    while (!eventScheduler.isEmpty() && unvisitedNodeCount > 0) {
        const [currentTimeElapsed, currentNode, currentCoins] = eventScheduler.extractSmallest();

        if (currentTimeElapsed > minimumStateTimes[currentNode][currentCoins]) {
            continue;
        }

        if (shortestArrivals[currentNode] === infiniteTimeValue) {
            shortestArrivals[currentNode] = currentTimeElapsed;
            unvisitedNodeCount--;
        }

        // Action 1: Convert gold to silver at currentNode
        if (currentCoins < maximumCoinCapacity) {
            const { coinGain, timeExpense } = tradeDetails[currentNode];
            const nextCoinBalance = Math.min(currentCoins + coinGain, maximumCoinCapacity);
            const nextTimeElapsed = currentTimeElapsed + timeExpense;

            if (nextTimeElapsed < minimumStateTimes[currentNode][nextCoinBalance]) {
                minimumStateTimes[currentNode][nextCoinBalance] = nextTimeElapsed;
                eventScheduler.addItem([nextTimeElapsed, currentNode, nextCoinBalance]);
            }
        }

        // Action 2: Traverse an edge from currentNode
        for (const adjacentConnection of nodeAdjacencies.get(currentNode)) {
            const { destination, coinCost, travelTime } = adjacentConnection;

            const remainingCoins = currentCoins - coinCost;
            if (remainingCoins < 0) {
                continue;
            }

            const totalTimeForPath = currentTimeElapsed + travelTime;

            if (totalTimeForPath < minimumStateTimes[destination][remainingCoins]) {
                minimumStateTimes[destination][remainingCoins] = totalTimeForPath;
                eventScheduler.addItem([totalTimeForPath, destination, remainingCoins]);
            }
        }
    }

    return shortestArrivals.slice(1).join('\n');
}