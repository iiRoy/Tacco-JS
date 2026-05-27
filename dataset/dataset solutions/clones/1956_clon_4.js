class InputReader {
    constructor(inputString) {
        this.tokenBuffer = inputString.split(/ |\n/);
        this.currentIndex = 0;
    }

    fetchNumber() {
        return Number(this.tokenBuffer[this.currentIndex++]);
    }

    fetchNumbers(count) {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(Number(this.tokenBuffer[this.currentIndex++]));
        }
        return result;
    }

    fetchMatrix(height, width) {
        const matrix = [];
        for (let r = 0; r < height; r++) {
            const row = [];
            for (let c = 0; c < width; c++) {
                row.push(Number(this.tokenBuffer[this.currentIndex++]));
            }
            matrix.push(row);
        }
        return matrix;
    }
}

function createNestedArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    return Array.from({ length: currentDimensionSize }, () =>
        createNestedArray(initialValue, ...remainingDimensions)
    );
}

class MinHeap {
    constructor() {
        this.dataStore = [];
    }

    insert(item) {
        this.dataStore.push(item);
        this._bubbleUp(this.dataStore.length - 1);
    }

    extractMin() {
        if (this.dataStore.length === 0) {
            return undefined;
        }
        if (this.dataStore.length === 1) {
            return this.dataStore.pop();
        }

        const minItem = this.dataStore[0];
        this.dataStore[0] = this.dataStore.pop();
        this._sinkDown(0);
        return minItem;
    }

    get size() {
        return this.dataStore.length;
    }

    _bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.dataStore[parentIndex].time <= this.dataStore[index].time) {
                break;
            }
            [this.dataStore[parentIndex], this.dataStore[index]] = [this.dataStore[index], this.dataStore[parentIndex]];
            index = parentIndex;
        }
    }

    _sinkDown(index) {
        const lastIndex = this.dataStore.length - 1;
        while (true) {
            let smallestIndex = index;
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;

            if (leftChildIndex <= lastIndex && this.dataStore[leftChildIndex].time < this.dataStore[smallestIndex].time) {
                smallestIndex = leftChildIndex;
            }

            if (rightChildIndex <= lastIndex && this.dataStore[rightChildIndex].time < this.dataStore[smallestIndex].time) {
                smallestIndex = rightChildIndex;
            }

            if (smallestIndex === index) {
                break;
            }

            [this.dataStore[index], this.dataStore[smallestIndex]] = [this.dataStore[smallestIndex], this.dataStore[index]];
            index = smallestIndex;
        }
    }
}

function processGraphTraversal() {
    const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
    const dataParser = new InputReader(rawInput);

    const [nodeCount, edgeCount, initialSilver] = dataParser.fetchNumbers(3);

    const adjacencyList = createNestedArray([], nodeCount);
    for (let i = 0; i < edgeCount; i++) {
        const [sourceNode, targetNode, silverCost, timeCost] = dataParser.fetchNumbers(4);
        const adjustedSource = sourceNode - 1;
        const adjustedTarget = targetNode - 1;
        adjacencyList[adjustedSource].push({ target: adjustedTarget, silver: silverCost, time: timeCost });
        adjacencyList[adjustedTarget].push({ target: adjustedSource, silver: silverCost, time: timeCost });
    }

    const exchangeRates = dataParser.fetchMatrix(nodeCount, 2);

    const minTimeAtNodeSilver = createNestedArray(1e18, nodeCount, 2501);
    
    const finalTravelTimes = createNestedArray(1e18, nodeCount);

    let unvisitedNodesCount = nodeCount;
    const priorityQueueInstance = new MinHeap();

    const clampedInitialSilver = Math.min(initialSilver, 2500);
    
    priorityQueueInstance.insert({ time: 0, node: 0, silver: clampedInitialSilver });
    minTimeAtNodeSilver[0][clampedInitialSilver] = 0;

    while (priorityQueueInstance.size > 0 && unvisitedNodesCount > 0) {
        const { time: currentTime, node: currentNode, silver: currentSilver } = priorityQueueInstance.extractMin();

        if (minTimeAtNodeSilver[currentNode][currentSilver] < currentTime) {
            continue;
        }

        if (finalTravelTimes[currentNode] === 1e18) {
            finalTravelTimes[currentNode] = currentTime;
            unvisitedNodesCount--;
        }

        const silverToGain = exchangeRates[currentNode][0];
        const timeForExchange = exchangeRates[currentNode][1];
        
        if (currentSilver < 2500) {
            const nextSilverAfterExchange = Math.min(currentSilver + silverToGain, 2500);
            const timeAfterExchange = currentTime + timeForExchange;

            if (minTimeAtNodeSilver[currentNode][nextSilverAfterExchange] > timeAfterExchange) {
                minTimeAtNodeSilver[currentNode][nextSilverAfterExchange] = timeAfterExchange;
                priorityQueueInstance.insert({ time: timeAfterExchange, node: currentNode, silver: nextSilverAfterExchange });
            }
        }

        for (const neighborEdge of adjacencyList[currentNode]) {
            const { target: neighborNode, silver: edgeSilverCost, time: edgeTimeCost } = neighborEdge;

            const silverAfterTravel = currentSilver - edgeSilverCost;
            if (silverAfterTravel < 0) {
                continue;
            }

            const timeAfterTravel = currentTime + edgeTimeCost;

            if (minTimeAtNodeSilver[neighborNode][silverAfterTravel] > timeAfterTravel) {
                minTimeAtNodeSilver[neighborNode][silverAfterTravel] = timeAfterTravel;
                priorityQueueInstance.insert({ time: timeAfterTravel, node: neighborNode, silver: silverAfterTravel });
            }
        }
    }

    return finalTravelTimes.slice(1).join("\n");
}

const problemOutput = processGraphTraversal();
if (problemOutput !== undefined) {
    console.log(problemOutput);
}
