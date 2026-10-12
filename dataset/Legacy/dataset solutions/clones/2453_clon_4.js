function createMultiDimArray(initialValue, ...dimensions) {
    const makeArray = (dims, currentDimIndex) => {
        if (currentDimIndex === dims.length - 1) {
            return Array(dims[currentDimIndex]).fill(initialValue);
        }
        return Array(dims[currentDimIndex]).fill(0).map(() => makeArray(dims, currentDimIndex + 1));
    };
    return makeArray(dimensions, 0);
}

class DisjointSet {
    #parentElements;
    constructor(nodeCount) {
        this.#parentElements = Array(nodeCount + 1).fill(-1);
    }

    findRepresentative(element) {
        if (this.#parentElements[element] < 0) {
            return element;
        }
        return (this.#parentElements[element] = this.findRepresentative(this.#parentElements[element]));
    }

    uniteSets(elemA, elemB) {
        let rootA = this.findRepresentative(elemA);
        let rootB = this.findRepresentative(elemB);

        if (rootA === rootB) {
            return false;
        }

        if (this.#parentElements[rootB] < this.#parentElements[rootA]) {
            [rootA, rootB] = [rootB, rootA];
        }
        this.#parentElements[rootA] += this.#parentElements[rootB];
        this.#parentElements[rootB] = rootA;
        return true;
    }

    getSetSize(element) {
        return -this.#parentElements[this.findRepresentative(element)];
    }
}

class DeliveryLogistics {
    #vertexCount;
    #edgeCount;
    #shortestPaths;
    #directConnections;
    #adjacencyLists;
    #forbiddenNodes;
    #maxSimulationTime;
    #maxSimulationTimeSquared;

    #currentDay = 0;
    #currentPosition = 0;
    #travelRemaining = 0;
    #lastOrderDay = -1;
    #cumulativeScore = 0;

    #activeDeliveryTargets = new Set();
    #pendingOrders = new Set();
    #deliveryRoute = [];
    #orderArrivalTimes;

    #inputBuffer = [];
    #bufferPointer = 0;

    static #INFINITY = 1e9;

    #consumeInput() {
        return +this.#inputBuffer[this.#bufferPointer++];
    }

    async initialize(inputGenerator) {
        let inputLine;

        inputLine = (await inputGenerator.next()).value;
        let [vStr, eStr] = inputLine.split(" ");
        this.#vertexCount = +vStr;
        this.#edgeCount = +eStr;

        this.#shortestPaths = createMultiDimArray(DeliveryLogistics.#INFINITY, this.#vertexCount, this.#vertexCount);
        this.#directConnections = createMultiDimArray(DeliveryLogistics.#INFINITY, this.#vertexCount, this.#vertexCount);
        this.#adjacencyLists = createMultiDimArray([], this.#vertexCount);
        this.#orderArrivalTimes = createMultiDimArray([], this.#vertexCount);

        for (let i = 0; i < this.#vertexCount; i++) {
            this.#shortestPaths[i][i] = 0;
        }

        for (let i = 0; i < this.#edgeCount; i++) {
            inputLine = (await inputGenerator.next()).value;
            let [v1Str, v2Str, dStr] = inputLine.split(" ");
            let nodeA = +v1Str - 1;
            let nodeB = +v2Str - 1;
            let distance = +dStr;

            this.#shortestPaths[nodeA][nodeB] = this.#shortestPaths[nodeB][nodeA] = distance;
            this.#directConnections[nodeA][nodeB] = this.#directConnections[nodeB][nodeA] = distance;
            this.#adjacencyLists[nodeA].push(nodeB);
            this.#adjacencyLists[nodeB].push(nodeA);
        }

        for (let k = 0; k < this.#vertexCount; k++) {
            for (let i = 0; i < this.#vertexCount; i++) {
                for (let j = 0; j < this.#vertexCount; j++) {
                    this.#shortestPaths[i][j] = Math.min(this.#shortestPaths[i][j], this.#shortestPaths[i][k] + this.#shortestPaths[k][j]);
                }
            }
        }

        inputLine = (await inputGenerator.next()).value;
        this.#forbiddenNodes = inputLine.split(" ").map(Number);

        this.#maxSimulationTime = +(await inputGenerator.next()).value;
        this.#maxSimulationTimeSquared = this.#maxSimulationTime * this.#maxSimulationTime;
    }

    #constructMinimumSpanningTree(targetNodes) {
        const relevantNodes = Array.from(targetNodes).concat(0);
        const nodeCount = relevantNodes.length;
        const potentialEdges = [];

        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                const u = relevantNodes[i];
                const v = relevantNodes[j];
                potentialEdges.push({ u, v, weight: this.#shortestPaths[u][v] });
            }
        }

        potentialEdges.sort((a, b) => a.weight - b.weight);

        const connectivityTracker = new DisjointSet(this.#vertexCount);
        const mstEdges = [];

        for (const edge of potentialEdges) {
            if (connectivityTracker.uniteSets(edge.u, edge.v)) {
                mstEdges.push(edge);
            }
            if (mstEdges.length === nodeCount - 1) {
                break;
            }
        }
        return mstEdges;
    }

    #generateDeliveryPath(startNode, parentNode, graphRepresentation, pathAccumulator) {
        pathAccumulator.push(startNode);
        for (const neighbor of graphRepresentation[startNode]) {
            if (neighbor !== parentNode) {
                this.#generateDeliveryPath(neighbor, startNode, graphRepresentation, pathAccumulator);
            }
        }
    }

    #ingestNewOrders() {
        this.#pendingOrders.clear();
        this.#deliveryRoute = [];

        while (this.#lastOrderDay < this.#currentDay) {
            this.#lastOrderDay++;
            const newOrderCount = this.#consumeInput();
            for (let i = 0; i < newOrderCount; i++) {
                const orderId = this.#consumeInput() - 1;
                const destinationVertex = this.#consumeInput() - 1;
                this.#activeDeliveryTargets.add(destinationVertex);
                this.#orderArrivalTimes[destinationVertex].push(this.#lastOrderDay);
            }
        }

        if (this.#activeDeliveryTargets.size === 0) {
            return;
        }

        const treeEdges = this.#constructMinimumSpanningTree(this.#activeDeliveryTargets);
        const deliveryGraph = createMultiDimArray([], this.#vertexCount);

        for (const edge of treeEdges) {
            deliveryGraph[edge.u].push(edge.v);
            deliveryGraph[edge.v].push(edge.u);
        }

        const tempPath = [];
        this.#generateDeliveryPath(0, -1, deliveryGraph, tempPath);
        this.#deliveryRoute = tempPath.reverse();
        this.#deliveryRoute.pop();
    }

    #completeDelivery() {
        this.#activeDeliveryTargets.delete(this.#currentPosition);
        while (this.#orderArrivalTimes[this.#currentPosition].length > 0) {
            const arrivalDay = this.#orderArrivalTimes[this.#currentPosition].pop();
            const timeElapsed = this.#currentDay - arrivalDay;
            this.#cumulativeScore += this.#maxSimulationTimeSquared - timeElapsed * timeElapsed;
        }
    }

    #determineNextStep(targetNode) {
        if (targetNode === this.#currentPosition) {
            return -2;
        }

        for (const neighbor of this.#adjacencyLists[this.#currentPosition]) {
            if (this.#shortestPaths[this.#currentPosition][targetNode] === this.#directConnections[this.#currentPosition][neighbor] + this.#shortestPaths[neighbor][targetNode]) {
                this.#travelRemaining = this.#directConnections[this.#currentPosition][neighbor] - 1;
                this.#currentPosition = neighbor;
                return this.#currentPosition;
            }
        }
        return -2;
    }

    #planNextMovement() {
        if (this.#activeDeliveryTargets.size === 0) {
            return (this.#currentPosition === 0) ? -2 : this.#determineNextStep(0);
        }

        if (this.#currentPosition === this.#deliveryRoute[this.#deliveryRoute.length - 1]) {
            this.#deliveryRoute.pop();
            while (this.#deliveryRoute.length > 0 && this.#pendingOrders.has(this.#deliveryRoute[this.#deliveryRoute.length - 1])) {
                this.#deliveryRoute.pop();
            }
            if (this.#deliveryRoute.length === 0) {
                return this.#determineNextStep(0);
            }
        }
        return this.#determineNextStep(this.#deliveryRoute[this.#deliveryRoute.length - 1]);
    }

    executeDailyAction() {
        if (this.#travelRemaining > 0) {
            this.#travelRemaining--;
            return this.#currentPosition;
        }

        if (this.#currentPosition === 0) {
            this.#ingestNewOrders();
        } else {
            this.#completeDelivery();
        }
        return this.#planNextMovement();
    }

    async runSimulation(inputGenerator, outputCallback) {
        await this.initialize(inputGenerator);

        for (; this.#currentDay < this.#maxSimulationTime; this.#currentDay++) {
            let inputLine = (await inputGenerator.next()).value;
            this.#inputBuffer.push(+inputLine);
            let newOrdersToday = +inputLine;

            for (let i = 0; i < newOrdersToday; i++) {
                inputLine = (await inputGenerator.next()).value;
                let [orderID, destinationNode] = inputLine.split(" ").map(Number);
                this.#inputBuffer.push(orderID, destinationNode);
                this.#pendingOrders.add(destinationNode - 1);
            }

            inputLine = (await inputGenerator.next()).value;
            let dummyCount = +inputLine;
            for (let i = 0; i < dummyCount; i++) {
                await inputGenerator.next();
            }

            const nextActionNode = this.executeDailyAction();
            outputCallback(nextActionNode + 1);

            inputLine = (await inputGenerator.next()).value;
            if (inputLine[0] !== "O") {
                return;
            }
            inputLine = (await inputGenerator.next()).value;
            dummyCount = +inputLine;
            for (let i = 0; i < dummyCount; i++) {
                await inputGenerator.next();
            }
        }
    }
}

const readlineInterface = require("readline").createInterface(process.stdin, process.stdout);
const inputLineGenerator = (function* () {
    const getNextLine = () => new Promise(resolve => readlineInterface.once("line", resolve));
    while (true) {
        yield getNextLine();
    }
})();

async function main() {
    const simulator = new DeliveryLogistics();
    await simulator.runSimulation(inputLineGenerator, console.log);
}

main();
