const acquireStandardInput = () => {
    return require("node:fs").readFileSync(0, "utf8");
};

const obtainData = (sourceText) => {
    let tokens = sourceText.trim().split(/\s+/);
    let currentIdx = 0;
    return {
        fetchNumeric: () => Number(tokens[currentIdx++]),
        fetchSequence: (count) => Array.from({ length: count }, () => Number(tokens[currentIdx++])),
        fetchGrid: (rows, cols) => Array.from({ length: rows }, () => Array.from({ length: cols }, () => Number(tokens[currentIdx++])))
    };
};

const establishPrioritizedCollection = () => {
    let internalStorage = [];
    const compareElements = (a, b) => a[0] - b[0];

    const siftUp = (index) => {
        while (index > 0) {
            let parentIndex = (index - 1) >> 1;
            if (compareElements(internalStorage[parentIndex], internalStorage[index]) <= 0) {
                break;
            }
            [internalStorage[index], internalStorage[parentIndex]] = [internalStorage[parentIndex], internalStorage[index]];
            index = parentIndex;
        }
    };

    const siftDown = (index) => {
        let lastIndex = internalStorage.length - 1;
        while (true) {
            let leftChildIndex = (index << 1) + 1;
            let rightChildIndex = (index << 1) + 2;
            let smallestIndex = index;

            if (leftChildIndex <= lastIndex && compareElements(internalStorage[leftChildIndex], internalStorage[smallestIndex]) < 0) {
                smallestIndex = leftChildIndex;
            }
            if (rightChildIndex <= lastIndex && compareElements(internalStorage[rightChildIndex], internalStorage[smallestIndex]) < 0) {
                smallestIndex = rightChildIndex;
            }

            if (smallestIndex === index) {
                break;
            }

            [internalStorage[index], internalStorage[smallestIndex]] = [internalStorage[smallestIndex], internalStorage[index]];
            index = smallestIndex;
        }
    };

    return {
        insertItem: (item) => {
            internalStorage.push(item);
            siftUp(internalStorage.length - 1);
        },
        extractMinimum: () => {
            if (internalStorage.length === 0) {
                return undefined;
            }
            if (internalStorage.length === 1) {
                return internalStorage.pop();
            }
            const minItem = internalStorage[0];
            internalStorage[0] = internalStorage.pop();
            siftDown(0);
            return minItem;
        },
        isEmpty: () => internalStorage.length === 0
    };
};

const createMultiDimArray = (defaultValue, ...dimensions) => {
    if (dimensions.length === 0) {
        return defaultValue;
    }
    const currentDim = dimensions[0];
    const remainingDims = dimensions.slice(1);
    return Array.from({ length: currentDim }, () => createMultiDimArray(defaultValue, ...remainingDims));
};

const executeGraphProblem = () => {
    const inputReader = obtainData(acquireStandardInput());

    const numLocations = inputReader.fetchNumeric();
    const numConnections = inputReader.fetchNumeric();
    let initialSilver = inputReader.fetchNumeric();

    const connectionList = createMultiDimArray([], numLocations);
    for (let k = 0; k < numConnections; k++) {
        const [origin, target, silverCost, timeCost] = inputReader.fetchSequence(4);
        const adjustedOrigin = origin - 1;
        const adjustedTarget = target - 1;
        connectionList[adjustedOrigin].push([adjustedTarget, silverCost, timeCost]);
        connectionList[adjustedTarget].push([adjustedOrigin, silverCost, timeCost]);
    }

    const silverExchangeDetails = inputReader.fetchGrid(numLocations, 2);

    const SILVER_LIMIT_EXCLUSIVE = 2501;
    const INFINITE_TIME = Number.MAX_SAFE_INTEGER;

    const minimumTimesToState = createMultiDimArray(INFINITE_TIME, numLocations, SILVER_LIMIT_EXCLUSIVE);
    const finalMinimumTimes = createMultiDimArray(INFINITE_TIME, numLocations);

    let remainingNodes = numLocations;

    const journeyQueue = establishPrioritizedCollection();

    if (initialSilver >= SILVER_LIMIT_EXCLUSIVE) {
        initialSilver = SILVER_LIMIT_EXCLUSIVE - 1;
    }

    journeyQueue.insertItem([0, 0, initialSilver]);
    minimumTimesToState[0][initialSilver] = 0;

    while (!journeyQueue.isEmpty()) {
        const [currentTime, currentNode, currentSilver] = journeyQueue.extractMinimum();

        if (minimumTimesToState[currentNode][currentSilver] < currentTime) {
            continue;
        }

        if (finalMinimumTimes[currentNode] === INFINITE_TIME) {
            remainingNodes--;
            finalMinimumTimes[currentNode] = currentTime;
        }

        if (currentSilver < SILVER_LIMIT_EXCLUSIVE - 1) {
            const newTimeAfterExchange = currentTime + silverExchangeDetails[currentNode][1];
            const gainedSilver = silverExchangeDetails[currentNode][0];
            let newSilverAfterExchange = currentSilver + gainedSilver;
            if (newSilverAfterExchange >= SILVER_LIMIT_EXCLUSIVE - 1) {
                newSilverAfterExchange = SILVER_LIMIT_EXCLUSIVE - 1;
            }

            if (minimumTimesToState[currentNode][newSilverAfterExchange] > newTimeAfterExchange) {
                minimumTimesToState[currentNode][newSilverAfterExchange] = newTimeAfterExchange;
                journeyQueue.insertItem([newTimeAfterExchange, currentNode, newSilverAfterExchange]);
            }
        }

        for (const [neighborNode, requiredSilver, travelTime] of connectionList[currentNode]) {
            const silverRemainingAfterTravel = currentSilver - requiredSilver;
            if (silverRemainingAfterTravel < 0) {
                continue;
            }

            const newTimeAfterTravel = currentTime + travelTime;
            if (minimumTimesToState[neighborNode][silverRemainingAfterTravel] > newTimeAfterTravel) {
                minimumTimesToState[neighborNode][silverRemainingAfterTravel] = newTimeAfterTravel;
                journeyQueue.insertItem([newTimeAfterTravel, neighborNode, silverRemainingAfterTravel]);
            }
        }
    }

    return finalMinimumTimes.slice(1).join("\n");
};

const programResult = executeGraphProblem();
if (programResult !== undefined) {
    console.log(programResult);
}