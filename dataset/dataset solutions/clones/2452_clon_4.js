"use strict";
const fileSystemInterface = require("fs");

class DataStreamProcessor {
    constructor(sourcePath) {
        this.rawContent = fileSystemInterface.readFileSync(sourcePath, "utf8");
        this.parsedElements = this.rawContent.split(/\s+/).filter(Boolean);
        this.elementIndex = 0;
    }

    retrieveNumericElement() {
        if (this.elementIndex >= this.parsedElements.length) {
            throw new Error("End of input stream reached.");
        }
        return Number(this.parsedElements[this.elementIndex++]);
    }
}

function constructMultiDimensionalArray(initialValue, ...dimensions) {
    const createDimension = (dims) => {
        if (dims.length === 0) {
            return initialValue;
        }
        const currentDimensionSize = dims[0];
        const remainingDimensions = dims.slice(1);
        return Array.from({ length: currentDimensionSize }, () => createDimension(remainingDimensions));
    };
    return createDimension(dimensions);
}

class JourneyPlanner {
    constructor(streamReaderInstance) {
        this.dataAcquirer = streamReaderInstance;

        this._infiniteValue = 1e9;
        this._totalVertices = this.dataAcquirer.retrieveNumericElement();
        this._totalEdges = this.dataAcquirer.retrieveNumericElement();

        this._interNodeDistances = constructMultiDimensionalArray(this._infiniteValue, this._totalVertices, this._totalVertices);
        this._segmentWeights = constructMultiDimensionalArray(this._infiniteValue, this._totalVertices, this._totalVertices);
        this._neighborConnections = constructMultiDimensionalArray([], this._totalVertices);

        this._loadNetworkTopology();

        this._maximumSimulationDuration = this.dataAcquirer.retrieveNumericElement();
        this._durationSquared = this._maximumSimulationDuration * this._maximumSimulationDuration;
        this._dailyActionLog = Array(this._maximumSimulationDuration);

        this._activeDeliveryTargets = new Set();
        this._deliveryRequestTimestamps = constructMultiDimensionalArray([], this._totalVertices);

        this._remainingSegmentLength = 0;
        this._currentVertexIdentifier = 0;
        this._elapsedTimeUnit = 0;
        this._lastOrderBatchTime = -1;
        this._cumulativeEfficiencyScore = 0;
    }

    _loadNetworkTopology() {
        Array.from({ length: this._totalVertices }).forEach((_, nodeIdx) => {
            this._interNodeDistances[nodeIdx][nodeIdx] = 0;
        });

        Array.from({ length: this._totalEdges }).forEach(() => {
            const nodeA = this.dataAcquirer.retrieveNumericElement() - 1;
            const nodeB = this.dataAcquirer.retrieveNumericElement() - 1;
            const weight = this.dataAcquirer.retrieveNumericElement();

            this._interNodeDistances[nodeA][nodeB] = this._interNodeDistances[nodeB][nodeA] = weight;
            this._segmentWeights[nodeA][nodeB] = this._segmentWeights[nodeB][nodeA] = weight;
            this._neighborConnections[nodeA].push(nodeB);
            this._neighborConnections[nodeB].push(nodeA);
        });
    }

    _calculateAllNodeDistances() {
        Array.from({ length: this._totalVertices }).forEach((_, intermediate) => {
            Array.from({ length: this._totalVertices }).forEach((__, source) => {
                Array.from({ length: this._totalVertices }).forEach((___, destination) => {
                    const pathViaIntermediate = this._interNodeDistances[source][intermediate] + this._interNodeDistances[intermediate][destination];
                    if (pathViaIntermediate < this._interNodeDistances[source][destination]) {
                        this._interNodeDistances[source][destination] = pathViaIntermediate;
                    }
                });
            });
        });
    }

    _registerIncomingOrders() {
        while (this._lastOrderBatchTime < this._elapsedTimeUnit) {
            this._lastOrderBatchTime++;
            const newOrderCount = this.dataAcquirer.retrieveNumericElement();
            Array.from({ length: newOrderCount }).forEach(() => {
                const itemIdentifier = this.dataAcquirer.retrieveNumericElement() - 1; // Not used, but consumed
                const deliveryTarget = this.dataAcquirer.retrieveNumericElement() - 1;
                this._activeDeliveryTargets.add(deliveryTarget);
                this._deliveryRequestTimestamps[deliveryTarget].push(this._lastOrderBatchTime);
            });
        }
    }

    _fulfillCurrentDelivery() {
        this._activeDeliveryTargets.delete(this._currentVertexIdentifier);
        while (this._deliveryRequestTimestamps[this._currentVertexIdentifier].length > 0) {
            const orderPlacementTime = this._deliveryRequestTimestamps[this._currentVertexIdentifier].pop();
            const deliveryDuration = this._elapsedTimeUnit - orderPlacementTime;
            this._cumulativeEfficiencyScore += this._durationSquared - deliveryDuration * deliveryDuration;
        }
    }

    _identifyOptimalNextStep(targetNode) {
        const shortestPathLength = this._interNodeDistances[this._currentVertexIdentifier][targetNode];

        const nextHop = this._neighborConnections[this._currentVertexIdentifier].find(neighbor =>
            shortestPathLength === (this._segmentWeights[this._currentVertexIdentifier][neighbor] + this._interNodeDistances[neighbor][targetNode])
        );

        if (nextHop !== undefined) {
            this._remainingSegmentLength = this._segmentWeights[this._currentVertexIdentifier][nextHop] - 1;
            this._currentVertexIdentifier = nextHop;
            return this._currentVertexIdentifier;
        }
        return -2;
    }

    _strategizeNextDelivery() {
        if (this._activeDeliveryTargets.size === 0) {
            if (this._currentVertexIdentifier === 0) {
                return -2;
            }
            return this._identifyOptimalNextStep(0);
        }

        const potentialDestinations = Array.from(this._activeDeliveryTargets);
        const reachableGoals = potentialDestinations.filter(
            (targetNode) => this._interNodeDistances[this._currentVertexIdentifier][targetNode] <= (this._maximumSimulationDuration - this._elapsedTimeUnit)
        );

        if (reachableGoals.length === 0) {
            return -2;
        }

        const bestGoalNode = reachableGoals.reduce((bestCandidate, currentCandidate) => {
            const currentOrderVolume = this._deliveryRequestTimestamps[currentCandidate].length;
            const bestOrderVolume = bestCandidate ? this._deliveryRequestTimestamps[bestCandidate].length : -1;

            if (currentOrderVolume > bestOrderVolume) {
                return currentCandidate;
            }
            return bestCandidate;
        }, null);

        if (bestGoalNode === null) {
            return -2;
        }

        return this._identifyOptimalNextStep(bestGoalNode);
    }

    _processDailyActivities() {
        if (this._remainingSegmentLength > 0) {
            this._remainingSegmentLength--;
            return this._currentVertexIdentifier;
        }

        const actionDispatch = {
            0: () => this._registerIncomingOrders(),
            default: () => this._fulfillCurrentDelivery()
        };
        (actionDispatch[this._currentVertexIdentifier] || actionDispatch.default)();

        return this._strategizeNextDelivery();
    }

    initiateLogisticsOperation() {
        this._calculateAllNodeDistances();

        const simulateRecursiveCycle = (currentCycleDay) => {
            if (currentCycleDay >= this._maximumSimulationDuration) {
                return true;
            }

            const dailyOutcome = this._processDailyActivities();
            this._dailyActionLog[currentCycleDay] = dailyOutcome + 1;

            if (this._remainingSegmentLength < 0) {
                return false;
            }

            this._elapsedTimeUnit++;
            return simulateRecursiveCycle(this._elapsedTimeUnit);
        };

        const simulationFinished = simulateRecursiveCycle(this._elapsedTimeUnit);

        if (!simulationFinished) {
            return this._dailyActionLog.slice(0, this._elapsedTimeUnit).join("\n");
        }

        return this._dailyActionLog.join("\n");
    }
}

const streamReader = new DataStreamProcessor("/dev/stdin");
const planner = new JourneyPlanner(streamReader);
const finalOutput = planner.initiateLogisticsOperation();
console.log(finalOutput);