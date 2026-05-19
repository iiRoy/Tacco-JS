"use strict";

function createMultiDimArray(dimensions, initialValueFactory) {
    const buildArray = (dims, currentDimIndex) => {
        if (currentDimIndex === dims.length) {
            return initialValueFactory();
        }
        const currentSize = dims[currentDimIndex];
        return Array.from({ length: currentSize }, () => buildArray(dims, currentDimIndex + 1));
    };
    return buildArray(dimensions, 0);
}

class SimulationEngine {
    constructor() {
        this.currentPathRemainingSteps = 0;
        this.vehicleCurrentNode = 0;
        this.currentSimulationDay = 0;
        this.lastOrderCollectionDay = -1;
        this.accumulatedScore = 0;

        this.graphInfinity = 1e9;
        this.nodeQuantity = 0;
        this.edgeQuantity = 0;
        this.allPairsShortestPaths = null;
        this.directEdgeDistances = null;
        this.nodeAdjacencyLists = null;
        this.nextHopOnPath = null;
        this.forbiddenLocations = null;
        this.maximumSimulationDays = 0;
        this.maximumSimulationDaysSquared = 0;

        this.locationsWithPendingDeliveries = new Set();
        this.orderCollectionTimestamps = null;
        this.dailyOperationResults = [];

        this.inputDataBuffer = [];
        this.inputBufferReadIndex = 0;
    }

    initializeGraph(numNodes, numEdges, edgeConnections) {
        this.nodeQuantity = numNodes;
        this.edgeQuantity = numEdges;

        this.allPairsShortestPaths = createMultiDimArray([numNodes, numNodes], () => this.graphInfinity);
        this.directEdgeDistances = createMultiDimArray([numNodes, numNodes], () => this.graphInfinity);
        this.nodeAdjacencyLists = createMultiDimArray([numNodes], () => []);
        this.nextHopOnPath = createMultiDimArray([numNodes, numNodes], () => -1);

        for (let i = 0; i < numNodes; i++) {
            this.allPairsShortestPaths[i][i] = 0;
        }

        for (const { startNode, endNode, weightValue } of edgeConnections) {
            this.allPairsShortestPaths[startNode][endNode] = this.allPairsShortestPaths[endNode][startNode] = weightValue;
            this.directEdgeDistances[startNode][endNode] = this.directEdgeDistances[endNode][startNode] = weightValue;
            this.nodeAdjacencyLists[startNode].push(endNode);
            this.nodeAdjacencyLists[endNode].push(startNode);
            this.nextHopOnPath[startNode][endNode] = endNode;
            this.nextHopOnPath[endNode][startNode] = startNode;
        }

        for (let intermediate = 0; intermediate < numNodes; intermediate++) {
            for (let source = 0; source < numNodes; source++) {
                for (let destination = 0; destination < numNodes; destination++) {
                    if (this.allPairsShortestPaths[source][intermediate] !== this.graphInfinity &&
                        this.allPairsShortestPaths[intermediate][destination] !== this.graphInfinity &&
                        this.allPairsShortestPaths[source][intermediate] + this.allPairsShortestPaths[intermediate][destination] < this.allPairsShortestPaths[source][destination]) {
                        this.allPairsShortestPaths[source][destination] = this.allPairsShortestPaths[source][intermediate] + this.allPairsShortestPaths[intermediate][destination];
                        this.nextHopOnPath[source][destination] = this.nextHopOnPath[source][intermediate];
                    }
                }
            }
        }
        this.orderCollectionTimestamps = createMultiDimArray([numNodes], () => []);
    }

    consumeInputDatum() {
        if (this.inputBufferReadIndex >= this.inputDataBuffer.length) {
            throw new Error("Input buffer exhausted unexpectedly.");
        }
        return +this.inputDataBuffer[this.inputBufferReadIndex++];
    }

    determineNextPathStep(targetNode) {
        if (this.vehicleCurrentNode === targetNode) {
            return this.vehicleCurrentNode;
        }
        const nextIntermediateNode = this.nextHopOnPath[this.vehicleCurrentNode][targetNode];
        if (nextIntermediateNode === -1 || nextIntermediateNode === this.graphInfinity) {
            return -2;
        }
        this.currentPathRemainingSteps = this.allPairsShortestPaths[this.vehicleCurrentNode][targetNode] - 1;
        this.vehicleCurrentNode = nextIntermediateNode;
        return this.vehicleCurrentNode;
    }

    selectNextDeliveryTarget() {
        if (this.locationsWithPendingDeliveries.size === 0) {
            return this.vehicleCurrentNode === 0 ? -2 : this.determineNextPathStep(0);
        }

        let bestCandidateNode = -1;
        let highestOrderCount = -1;

        Array.from(this.locationsWithPendingDeliveries).forEach(candidateNode => {
            const currentOrderCount = this.orderCollectionTimestamps[candidateNode].length;
            const travelDuration = this.allPairsShortestPaths[this.vehicleCurrentNode][candidateNode];

            if (currentOrderCount > 0 && travelDuration <= this.maximumSimulationDays - this.currentSimulationDay) {
                if (bestCandidateNode === -1 || currentOrderCount > highestOrderCount) {
                    highestOrderCount = currentOrderCount;
                    bestCandidateNode = candidateNode;
                }
            }
        });

        if (bestCandidateNode === -1) {
            return -2;
        }
        return this.determineNextPathStep(bestCandidateNode);
    }

    executeDailyOperation() {
        if (this.currentPathRemainingSteps > 0) {
            this.currentPathRemainingSteps--;
            return this.vehicleCurrentNode;
        }

        if (this.vehicleCurrentNode === 0) {
            this.processNewOrderCollections();
        } else {
            this.processOrderDeliveries();
        }
        return this.selectNextDeliveryTarget();
    }

    processNewOrderCollections() {
        while (this.lastOrderCollectionDay < this.currentSimulationDay) {
            this.lastOrderCollectionDay++;
            const numberOfNewOrders = this.consumeInputDatum();
            for (let i = 0; i < numberOfNewOrders; i++) {
                this.consumeInputDatum(); // Item ID, not used
                const deliveryDestination = this.consumeInputDatum() - 1;
                this.locationsWithPendingDeliveries.add(deliveryDestination);
                this.orderCollectionTimestamps[deliveryDestination].push(this.lastOrderCollectionDay);
            }
        }
    }

    processOrderDeliveries() {
        this.locationsWithPendingDeliveries.delete(this.vehicleCurrentNode);
        while (this.orderCollectionTimestamps[this.vehicleCurrentNode].length > 0) {
            const collectionDay = this.orderCollectionTimestamps[this.vehicleCurrentNode].pop();
            const timeElapsed = this.currentSimulationDay - collectionDay;
            this.accumulatedScore += this.maximumSimulationDaysSquared - timeElapsed * timeElapsed;
        }
    }
}

const readlineInterface = require("readline").createInterface(process.stdin, process.stdout);
const simulationCoordinator = (function* () {
    const getNextLine = () => readlineInterface.once("line", s => simulationCoordinator.next(s));

    const simEngine = new SimulationEngine();

    let graphParams = (yield getNextLine()).split(" ");
    simEngine.nodeQuantity = +graphParams[0];
    simEngine.edgeQuantity = +graphParams[1];

    simEngine.allPairsShortestPaths = createMultiDimArray([simEngine.nodeQuantity, simEngine.nodeQuantity], () => simEngine.graphInfinity);
    simEngine.directEdgeDistances = createMultiDimArray([simEngine.nodeQuantity, simEngine.nodeQuantity], () => simEngine.graphInfinity);
    simEngine.nodeAdjacencyLists = createMultiDimArray([simEngine.nodeQuantity], () => []);
    simEngine.nextHopOnPath = createMultiDimArray([simEngine.nodeQuantity, simEngine.nodeQuantity], () => -1);

    for (let i = 0; i < simEngine.nodeQuantity; i++) {
        simEngine.allPairsShortestPaths[i][i] = 0;
    }

    const edgeDataCollection = [];
    for (let i = 0; i < simEngine.edgeQuantity; i++) {
        let edgeInfo = (yield getNextLine()).split(" ");
        let u = +edgeInfo[0] - 1;
        let v = +edgeInfo[1] - 1;
        let d = +edgeInfo[2];
        edgeDataCollection.push({ startNode: u, endNode: v, weightValue: d });
    }
    simEngine.initializeGraph(simEngine.nodeQuantity, simEngine.edgeQuantity, edgeDataCollection);

    simEngine.forbiddenLocations = (yield getNextLine()).split(" ").map(Number);
    simEngine.maximumSimulationDays = +(yield getNextLine());
    simEngine.maximumSimulationDaysSquared = simEngine.maximumSimulationDays * simEngine.maximumSimulationDays;
    simEngine.orderCollectionTimestamps = createMultiDimArray([simEngine.nodeQuantity], () => []);

    for (; simEngine.currentSimulationDay < simEngine.maximumSimulationDays; simEngine.currentSimulationDay++) {
        simEngine.inputDataBuffer = [];
        simEngine.inputBufferReadIndex = 0;

        let numOrdersForDay = +(yield getNextLine());
        simEngine.inputDataBuffer.push(numOrdersForDay);
        for (let i = 0; i < numOrdersForDay; i++) {
            let orderDetails = (yield getNextLine()).split(" ").map(Number);
            simEngine.inputDataBuffer.push(...orderDetails);
        }

        let dummyInputCount1 = +(yield getNextLine());
        for (let i = 0; i < dummyInputCount1; i++) {
            yield getNextLine();
        }

        simEngine.dailyOperationResults[simEngine.currentSimulationDay] = simEngine.executeDailyOperation() + 1;
        console.log(simEngine.dailyOperationResults[simEngine.currentSimulationDay]);

        let terminationSignal = yield getNextLine();
        if (terminationSignal[0] !== "O") return;
        let dummyInputCount2 = +(yield getNextLine());
        for (let i = 0; i < dummyInputCount2; i++) {
            yield getNextLine();
        }
    }
})();
simulationCoordinator.next();
