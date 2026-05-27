function createMultiDimArray(dimensions, initialValue) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimSize = dimensions[0];
    const remainingDims = dimensions.slice(1);
    const arr = new Array(currentDimSize);
    for (let i = 0; i < currentDimSize; i++) {
        arr[i] = createMultiDimArray(remainingDims, initialValue);
    }
    return arr;
}

class DisjointSet {
    constructor(nodeCount) {
        this.parent = new Array(nodeCount + 1).fill(-1);
    }

    findSet(idx) {
        if (this.parent[idx] < 0) {
            return idx;
        }
        return this.parent[idx] = this.findSet(this.parent[idx]);
    }

    areConnected(firstIdx, secondIdx) {
        return this.findSet(firstIdx) === this.findSet(secondIdx);
    }

    uniteSets(firstIdx, secondIdx) {
        let rootA = this.findSet(firstIdx);
        let rootB = this.findSet(secondIdx);

        if (rootA === rootB) {
            return false;
        }

        if (this.parent[rootB] < this.parent[rootA]) {
            [rootA, rootB] = [rootB, rootA];
        }
        this.parent[rootA] += this.parent[rootB];
        this.parent[rootB] = rootA;
        return true;
    }

    getSetSize(idx) {
        return -this.parent[this.findSet(idx)];
    }
}

class DeliverySimulation {
    constructor() {
        this.pathSegmentLength = 0;
        this.currentLocation = 0;
        this.currentDay = 0;
        this.lastOrderDay = -1;
        this.totalScore = 0;

        this.infinity = 1e9;
        this.numVertices;
        this.numEdges;
        this.allPairDistances;
        this.directEdgeWeights;
        this.adjacencyLists;
        this.factorArray;
        this.maximumTime;
        this.maximumTimeSquared;

        this.activeDeliveries = new Set();
        this.deliveryRoute = [];
        this.orderArrivalDays = [];
        this.inputQueue = [];
        this.inputPointer = 0;
        this.outputLog = [];
    }

    retrieveNextInput() {
        return +this.inputQueue[this.inputPointer++];
    }

    computeMinimumSpanningTree(vertexSubset) {
        const relevantVertices = Array.from(vertexSubset).concat(0);
        const subsetSize = relevantVertices.length;
        const potentialEdges = [];

        for (let i = 0; i < subsetSize; i++) {
            for (let j = i + 1; j < subsetSize; j++) {
                const u = relevantVertices[i];
                const v = relevantVertices[j];
                potentialEdges.push({
                    u: u,
                    v: v,
                    weight: this.allPairDistances[u][v]
                });
            }
        }

        potentialEdges.sort((edgeA, edgeB) => edgeA.weight - edgeB.weight);

        const dsu = new DisjointSet(this.numVertices);
        const mstEdges = [];
        
        for (const edge of potentialEdges) {
            if (dsu.uniteSets(edge.u, edge.v)) {
                mstEdges.push(edge);
                let currentComponentSize = 0;
                const rootOfZero = dsu.findSet(0);
                for(const rv of relevantVertices) {
                    if (dsu.findSet(rv) === rootOfZero) {
                        currentComponentSize++;
                    }
                }
                if (currentComponentSize === subsetSize) {
                    break;
                }
            }
        }
        return mstEdges;
    }

    determineNextMove() {
        if (this.activeDeliveries.size === 0) {
            if (this.currentLocation === 0) return -2;
            return this.navigatePath(0);
        }
        if (this.deliveryRoute.length > 0 && this.currentLocation === this.deliveryRoute[this.deliveryRoute.length - 1]) {
            this.deliveryRoute.pop();
        }
        if (this.deliveryRoute.length === 0) {
            return this.navigatePath(0);
        }
        return this.navigatePath(this.deliveryRoute[this.deliveryRoute.length - 1]);
    }

    navigatePath(targetVertex) {
        if (targetVertex === this.currentLocation) return -2;

        for (const neighbor of this.adjacencyLists[this.currentLocation]) {
            if (this.allPairDistances[this.currentLocation][targetVertex] ===
                this.directEdgeWeights[this.currentLocation][neighbor] + this.allPairDistances[neighbor][targetVertex]) {
                this.pathSegmentLength = this.directEdgeWeights[this.currentLocation][neighbor] - 1;
                this.currentLocation = neighbor;
                return this.currentLocation;
            }
        }
        return -2;
    }

    executeSimulationStep() {
        if (this.pathSegmentLength > 0) {
            this.pathSegmentLength--;
            return this.currentLocation;
        }
        if (this.currentLocation === 0) {
            this.processNewOrders();
        } else {
            this.completeDelivery();
        }
        return this.determineNextMove();
    }

    processNewOrders() {
        this.deliveryRoute = [];
        while (this.lastOrderDay < this.currentDay) {
            this.lastOrderDay++;
            const numNewOrders = this.retrieveNextInput();
            for (let i = 0; i < numNewOrders; i++) {
                this.retrieveNextInput();
                const destinationVertex = this.retrieveNextInput() - 1;
                this.activeDeliveries.add(destinationVertex);
                this.orderArrivalDays[destinationVertex].push(this.lastOrderDay);
            }
        }

        if (this.activeDeliveries.size === 0) return;

        const mstEdges = this.computeMinimumSpanningTree(this.activeDeliveries);
        const mstAdjacency = createMultiDimArray([this.numVertices], []);
        for (const edge of mstEdges) {
            mstAdjacency[edge.u].push(edge.v);
            mstAdjacency[edge.v].push(edge.u);
        }
        
        this.deliveryRoute = [];
        this.buildDeliveryRouteDFS(0, -1, mstAdjacency);
        this.deliveryRoute.reverse();
        this.deliveryRoute.pop();
    }

    buildDeliveryRouteDFS(currentV, parentV, mstAdjacency) {
        this.deliveryRoute.push(currentV);
        for (const neighbor of mstAdjacency[currentV]) {
            if (neighbor !== parentV) {
                this.buildDeliveryRouteDFS(neighbor, currentV, mstAdjacency);
            }
        }
    }

    completeDelivery() {
        this.activeDeliveries.delete(this.currentLocation);
        const arrivalTimes = this.orderArrivalDays[this.currentLocation];
        while (arrivalTimes.length > 0) {
            const orderDay = arrivalTimes.pop();
            const deliveryTime = this.currentDay - orderDay;
            this.totalScore += this.maximumTimeSquared - deliveryTime * deliveryTime;
        }
    }

    async initializeSimulation(inputReader) {
        let line = await inputReader.readLine();
        let parts = line.split(" ");
        this.numEdges = +parts[1];
        this.numVertices = +parts[0];

        this.allPairDistances = createMultiDimArray([this.numVertices, this.numVertices], this.infinity);
        this.directEdgeWeights = createMultiDimArray([this.numVertices, this.numVertices], this.infinity);
        this.adjacencyLists = createMultiDimArray([this.numVertices], []);

        for (let i = 0; i < this.numVertices; i++) {
            this.allPairDistances[i][i] = 0;
        }

        for (let i = 0; i < this.numEdges; i++) {
            line = await inputReader.readLine();
            parts = line.split(" ");
            const vertex1 = +parts[0] - 1;
            const vertex2 = +parts[1] - 1;
            const distance = +parts[2];

            this.allPairDistances[vertex1][vertex2] = this.allPairDistances[vertex2][vertex1] = distance;
            this.directEdgeWeights[vertex1][vertex2] = this.directEdgeWeights[vertex2][vertex1] = distance;
            this.adjacencyLists[vertex1].push(vertex2);
            this.adjacencyLists[vertex2].push(vertex1);
        }

        for (let k = 0; k < this.numVertices; k++) {
            for (let i = 0; i < this.numVertices; i++) {
                for (let j = 0; j < this.numVertices; j++) {
                    const pathThroughK = this.allPairDistances[i][k] + this.allPairDistances[k][j];
                    if (pathThroughK < this.allPairDistances[i][j]) {
                        this.allPairDistances[i][j] = pathThroughK;
                    }
                }
            }
        }

        line = await inputReader.readLine();
        this.factorArray = line.split(" ").map(val => +val);

        line = await inputReader.readLine();
        this.maximumTime = +line;
        this.maximumTimeSquared = this.maximumTime * this.maximumTime;

        this.orderArrivalDays = createMultiDimArray([this.numVertices], []);

        for (; this.currentDay < this.maximumTime; this.currentDay++) {
            let numEvents = +(await inputReader.readLine());
            this.inputQueue.push(numEvents);
            for (let i = 0; i < numEvents; i++) {
                let eventData = (await inputReader.readLine()).split(" ").map(val => +val);
                this.inputQueue.push(eventData[0], eventData[1]);
            }

            numEvents = +(await inputReader.readLine());
            for (let i = 0; i < numEvents; i++) {
                await inputReader.readLine();
            }

            this.outputLog[this.currentDay] = this.executeSimulationStep() + 1;
            console.log(this.outputLog[this.currentDay]);

            let statusLine = await inputReader.readLine();
            if (statusLine[0] !== "O") return;

            numEvents = +(await inputReader.readLine());
            for (let i = 0; i < numEvents; i++) {
                await inputReader.readLine();
            }
        }
    }
}

class InputReader {
    constructor(inputSource) {
        this.source = inputSource;
        this.lineQueue = [];
        this.resolveQueue = [];

        this.source.on("line", (line) => {
            if (this.resolveQueue.length > 0) {
                const resolve = this.resolveQueue.shift();
                resolve(line);
            } else {
                this.lineQueue.push(line);
            }
        });
    }

    readLine() {
        return new Promise((resolve) => {
            if (this.lineQueue.length > 0) {
                resolve(this.lineQueue.shift());
            } else {
                this.resolveQueue.push(resolve);
            }
        });
    }
}

const standardInputReader = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
});

const reader = new InputReader(standardInputReader);
const simulation = new DeliverySimulation();
simulation.initializeSimulation(reader).then(() => {
    standardInputReader.close();
});
