"use strict";
const fileSystem = require("fs");

// Helper for multi-dimensional array creation without eval
function buildMultiArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array.from({ length: currentDimensionSize }, () =>
        buildMultiArray(initialValue, ...remainingDimensions)
    );
}

// Input processing class to replace global `cin` and `cx`
class StreamParser {
    constructor(rawData) {
        this.dataTokens = rawData.split(/ |\n/);
        this.tokenPointer = 0;
    }

    readNextInteger() {
        return +this.dataTokens[this.tokenPointer++];
    }

    readNextString() {
        return this.dataTokens[this.tokenPointer++];
    }
}

// Main simulation class to encapsulate state and logic
class DeliverySimulation {
    constructor(inputParser) {
        this.parser = inputParser;

        // Renamed global state variables
        this.pathSegmentLength = 0; // leng
        this.currentVehicleNode = 0; // nextV
        this.currentSimulationDay = 0; // day
        this.lastOrderProcessingDay = -1; // takeday
        this.cumulativeScore = 0; // score

        this.INFINITY = 1e9;
        this.numVertices = this.parser.readNextInteger(); // V
        this.numEdges = this.parser.readNextInteger(); // E

        // Renamed data structures
        this.shortestPathMatrix = buildMultiArray(this.INFINITY, this.numVertices, this.numVertices); // dist
        this.directEdgeMatrix = buildMultiArray(this.INFINITY, this.numVertices, this.numVertices); // directDist
        this.nodeAdjacencyLists = buildMultiArray([], this.numVertices); // e

        this.maxSimulationDays = this.parser.readNextInteger(); // tmax
        this.maxSimulationDaysSquared = this.maxSimulationDays * this.maxSimulationDays; // tmax2
        this.dailyOutcomeRecords = []; // ans

        this.activeDeliveryItems = new Set(); // has
        this.itemOrderTimestamps = buildMultiArray([], this.numVertices); // orderTime

        this.initializeGraphData();
        this.computeAllPairsShortestPaths();
    }

    // Equivalent to original `getE()`
    initializeGraphData() {
        for (let i = 0; i < this.numVertices; i++) {
            this.shortestPathMatrix[i][i] = 0;
        }
        for (let i = 0; i < this.numEdges; i++) {
            const nodeA = this.parser.readNextInteger() - 1;
            const nodeB = this.parser.readNextInteger() - 1;
            const distance = this.parser.readNextInteger();

            this.shortestPathMatrix[nodeA][nodeB] = this.shortestPathMatrix[nodeB][nodeA] = distance;
            this.directEdgeMatrix[nodeA][nodeB] = this.directEdgeMatrix[nodeB][nodeA] = distance;
            this.nodeAdjacencyLists[nodeA].push(nodeB);
            this.nodeAdjacencyLists[nodeB].push(nodeA);
        }
    }

    // Encapsulated Floyd-Warshall algorithm
    computeAllPairsShortestPaths() {
        for (let intermediateNode = 0; intermediateNode < this.numVertices; intermediateNode++) {
            for (let startNode = 0; startNode < this.numVertices; startNode++) {
                for (let endNode = 0; endNode < this.numVertices; endNode++) {
                    const pathViaIntermediate = this.shortestPathMatrix[startNode][intermediateNode] + this.shortestPathMatrix[intermediateNode][endNode];
                    if (pathViaIntermediate < this.shortestPathMatrix[startNode][endNode]) {
                        this.shortestPathMatrix[startNode][endNode] = pathViaIntermediate;
                    }
                }
            }
        }
    }

    // Equivalent to original `main()`
    runSimulation() {
        for (let dayCounter = 0; dayCounter < this.maxSimulationDays; dayCounter++) {
            this.currentSimulationDay = dayCounter;
            const currentDayResult = this.processDailyOperations() + 1; // solve() equivalent

            if (this.pathSegmentLength < 0) {
                console.log(this.currentSimulationDay, this.pathSegmentLength, this.currentVehicleNode);
                return; // Early exit as per original behavior
            }
            this.dailyOutcomeRecords.push(currentDayResult);
        }
        return this.dailyOutcomeRecords.join("\n");
    }

    // Equivalent to original `solve()` with dispatch map for node actions
    processDailyOperations() {
        if (this.pathSegmentLength > 0) {
            this.pathSegmentLength--;
            return this.currentVehicleNode;
        }

        const nodeActionHandlers = {
            0: () => this.handleOriginNodeArrival(), // take() equivalent
            'default': () => this.handleDeliveryNodeArrival() // give() equivalent
        };
        (nodeActionHandlers[this.currentVehicleNode] || nodeActionHandlers['default'])();

        return this.determineNextRoute(); // deliver() equivalent
    }

    // Equivalent to original `take()`
    handleOriginNodeArrival() {
        while (this.lastOrderProcessingDay < this.currentSimulationDay) {
            this.lastOrderProcessingDay++;
            const numberOfNewOrders = this.parser.readNextInteger();
            for (let i = 0; i < numberOfNewOrders; i++) {
                const itemId = this.parser.readNextInteger() - 1; // Original code reads 'id' but uses 'd' for delivery node. Assuming 'd' is the delivery node.
                const deliveryNode = this.parser.readNextInteger() - 1;
                this.activeDeliveryItems.add(deliveryNode);
                this.itemOrderTimestamps[deliveryNode].push(this.lastOrderProcessingDay);
            }
        }
    }

    // Equivalent to original `give()`
    handleDeliveryNodeArrival() {
        this.activeDeliveryItems.delete(this.currentVehicleNode);
        const deliveredTimestamps = this.itemOrderTimestamps[this.currentVehicleNode];
        while (deliveredTimestamps.length > 0) {
            const orderTimestamp = deliveredTimestamps.pop();
            const timeElapsed = this.currentSimulationDay - orderTimestamp;
            this.cumulativeScore += this.maxSimulationDaysSquared - timeElapsed * timeElapsed;
        }
    }

    // Equivalent to original `deliver()` using Array.from().reduce for selection
    determineNextRoute() {
        if (this.activeDeliveryItems.size === 0) {
            return (this.currentVehicleNode === 0) ? -2 : this.findNextHop(0);
        }

        let bestTargetNode = -1;
        let maxOrdersAtTarget = 0;

        Array.from(this.activeDeliveryItems).reduce((_accumulator, targetNode) => {
            if (this.shortestPathMatrix[this.currentVehicleNode][targetNode] <= this.maxSimulationDays - this.currentSimulationDay) {
                const ordersCount = this.itemOrderTimestamps[targetNode].length;
                if (ordersCount > maxOrdersAtTarget) {
                    maxOrdersAtTarget = ordersCount;
                    bestTargetNode = targetNode;
                }
            }
            return _accumulator; // Accumulator is not functionally used here, but structure is different
        }, null);

        if (bestTargetNode === -1) {
            return -2;
        }
        return this.findNextHop(bestTargetNode);
    }

    // Equivalent to original `minPath()` using Array.find()
    findNextHop(destinationNode) {
        const nextHopNode = this.nodeAdjacencyLists[this.currentVehicleNode].find(neighbor =>
            this.shortestPathMatrix[this.currentVehicleNode][destinationNode] ===
            this.directEdgeMatrix[this.currentVehicleNode][neighbor] + this.shortestPathMatrix[neighbor][destinationNode]
        );

        if (nextHopNode !== undefined) {
            this.pathSegmentLength = this.directEdgeMatrix[this.currentVehicleNode][nextHopNode] - 1;
            this.currentVehicleNode = nextHopNode;
            return this.currentVehicleNode;
        }
        return -2;
    }
}

// Main execution block
const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");
const inputProcessor = new StreamParser(rawInputData);
const simulationInstance = new DeliverySimulation(inputProcessor);

console.log(simulationInstance.runSimulation());
