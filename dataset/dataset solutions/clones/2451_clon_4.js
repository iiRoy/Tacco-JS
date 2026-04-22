class InputParser {
    constructor(sourceData) {
        this.dataSegments = sourceData.split(/\s+/).filter(Boolean);
        this.segmentIndex = 0;
    }

    readNumber() {
        if (this.segmentIndex >= this.dataSegments.length) {
            throw new Error("Input exhaustion.");
        }
        return parseInt(this.dataSegments[this.segmentIndex++], 10);
    }

    readString() {
        if (this.segmentIndex >= this.dataSegments.length) {
            throw new Error("Input exhaustion.");
        }
        return this.dataSegments[this.segmentIndex++];
    }
}

function constructMultiArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array.from({ length: currentDimensionSize }, () =>
        constructMultiArray(initialValue, ...remainingDimensions)
    );
}

const INFINITY_VAL = 1_000_000_007;

class LogisticsSimulator {
    constructor(parser) {
        this.inputReader = parser;
        this.nodeCount = this.inputReader.readNumber();
        this.edgeCount = this.inputReader.readNumber();

        this.shortestPathMatrix = constructMultiArray(INFINITY_VAL, this.nodeCount, this.nodeCount);
        this.adjacencies = new Map(); // node -> Array<neighbor>

        this.maxTotalTime = this.inputReader.readNumber();
        this.maxTotalTimeSquared = this.maxTotalTime * this.maxTotalTime;

        this.dailyResults = new Array(this.maxTotalTime);

        this.deliveryQueue = new Map(); // destinationNode -> Array<orderTimestamp>

        this.currentVehicleNode = 0;
        this.remainingPathLength = 0;
        this.currentTimelineDay = 0;
        this.lastOrderProcessedDay = -1;
        this.totalSatisfactionScore = 0;

        this.setupGraphStructure();
        this.calculateAllShortestPaths();
    }

    setupGraphStructure() {
        for (let i = 0; i < this.nodeCount; i++) {
            this.shortestPathMatrix[i][i] = 0;
            this.adjacencies.set(i, []);
        }

        for (let i = 0; i < this.edgeCount; i++) {
            const nodeA = this.inputReader.readNumber() - 1;
            const nodeB = this.inputReader.readNumber() - 1;
            const connectionWeight = this.inputReader.readNumber();

            this.shortestPathMatrix[nodeA][nodeB] = Math.min(this.shortestPathMatrix[nodeA][nodeB], connectionWeight);
            this.shortestPathMatrix[nodeB][nodeA] = Math.min(this.shortestPathMatrix[nodeB][nodeA], connectionWeight);

            this.adjacencies.get(nodeA).push(nodeB);
            this.adjacencies.get(nodeB).push(nodeA);
        }
    }

    calculateAllShortestPaths() {
        for (let intermediate = 0; intermediate < this.nodeCount; intermediate++) {
            for (let source = 0; source < this.nodeCount; source++) {
                for (let target = 0; target < this.nodeCount; target++) {
                    const pathViaIntermediate = this.shortestPathMatrix[source][intermediate] + this.shortestPathMatrix[intermediate][target];
                    if (pathViaIntermediate < this.shortestPathMatrix[source][target]) {
                        this.shortestPathMatrix[source][target] = pathViaIntermediate;
                    }
                }
            }
        }
    }

    processIncomingOrders() {
        while (this.lastOrderProcessedDay < this.currentTimelineDay) {
            this.lastOrderProcessedDay++;
            const batchSize = this.inputReader.readNumber();
            for (let i = 0; i < batchSize; i++) {
                this.inputReader.readNumber(); // Discard order identifier
                const destination = this.inputReader.readNumber() - 1;

                if (!this.deliveryQueue.has(destination)) {
                    this.deliveryQueue.set(destination, []);
                }
                this.deliveryQueue.get(destination).push(this.lastOrderProcessedDay);
            }
        }
    }

    fulfillCurrentDeliveries() {
        if (this.deliveryQueue.has(this.currentVehicleNode)) {
            const ordersAtLocation = this.deliveryQueue.get(this.currentVehicleNode);
            while (ordersAtLocation.length > 0) {
                const orderOriginDay = ordersAtLocation.pop();
                const totalTimeForOrder = this.currentTimelineDay - orderOriginDay;
                this.totalSatisfactionScore += this.maxTotalTimeSquared - (totalTimeForOrder * totalTimeForOrder);
            }
            this.deliveryQueue.delete(this.currentVehicleNode);
        }
    }

    determineNextRoute() {
        let optimalTargetNode = -1;
        let maxPendingItems = -1;

        const availableDestinations = Array.from(this.deliveryQueue.entries())
            .filter(([dest, orders]) =>
                orders.length > 0 &&
                this.shortestPathMatrix[this.currentVehicleNode][dest] <= (this.maxTotalTime - this.currentTimelineDay)
            );

        for (const [destNode, orders] of availableDestinations) {
            if (orders.length > maxPendingItems) {
                maxPendingItems = orders.length;
                optimalTargetNode = destNode;
            }
        }

        if (optimalTargetNode === -1) {
            if (this.currentVehicleNode === 0) {
                return -2; // At depot, no tasks, no path
            }
            return this.findNextHop(this.currentVehicleNode, 0); // Return to depot
        }

        return this.findNextHop(this.currentVehicleNode, optimalTargetNode);
    }

    findNextHop(startLocation, endLocation) {
        const connectedNodes = this.adjacencies.get(startLocation);

        if (connectedNodes && connectedNodes.includes(endLocation)) {
            this.remainingPathLength = this.shortestPathMatrix[startLocation][endLocation] - 1;
            this.currentVehicleNode = endLocation;
            return endLocation;
        }

        if (connectedNodes) {
            for (const connectedNode of connectedNodes) {
                if (this.shortestPathMatrix[startLocation][endLocation] === this.shortestPathMatrix[startLocation][connectedNode] + this.shortestPathMatrix[connectedNode][endLocation]) {
                    this.remainingPathLength = this.shortestPathMatrix[startLocation][connectedNode] - 1;
                    this.currentVehicleNode = connectedNode;
                    return connectedNode;
                }
            }
        }
        return -2; // Error or invalid state
    }

    executeDailyOperations() {
        if (this.remainingPathLength > 0) {
            this.remainingPathLength--;
            return this.currentVehicleNode;
        }

        if (this.currentVehicleNode === 0) {
            this.processIncomingOrders();
        } else {
            this.fulfillCurrentDeliveries();
        }
        
        return this.determineNextRoute();
    }

    initiateSimulation() {
        for (this.currentTimelineDay = 0; this.currentTimelineDay < this.maxTotalTime; this.currentTimelineDay++) {
            this.dailyResults[this.currentTimelineDay] = this.executeDailyOperations() + 1;
        }
        return this.dailyResults.join("\n");
    }
}

const programInput = require("fs").readFileSync("/dev/stdin", "utf8");
const inputProcessor = new InputParser(programInput);
const simulationEngine = new LogisticsSimulator(inputProcessor);
console.log(simulationEngine.initiateSimulation());