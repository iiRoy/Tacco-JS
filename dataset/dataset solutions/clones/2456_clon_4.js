"use strict";

function makeDimensionedArray(dimensions, initialValue) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimSize = dimensions[0];
    const remainingDims = dimensions.slice(1);
    return Array.from({ length: currentDimSize }, () => makeDimensionedArray(remainingDims, initialValue));
}

const IMPOSSIBLE_COST = 1e9;

let simulationState = {
    nodeCount: 0,
    edgeCount: 0,
    pathCosts: null,
    directEdgeCosts: null,
    adjacencies: null,
    nextHopOnPath: null,
    maxSimulationDuration: 0,
    maxSimulationDurationSquared: 0,
    pendingDeliveries: new Set(),
    deliverySchedule: null,
    eventDataQueue: [],
    eventDataPointer: 0,
    remainingTravelSteps: 0,
    currentVehicleLocation: 0,
    currentSimulationDay: 0,
    lastOrderPickupDayProcessed: -1,
    totalAccumulatedScore: 0,
    outputLog: []
};

const ioHandler = require("readline").createInterface(process.stdin, process.stdout);

async function retrieveLine() {
    return new Promise(resolve => ioHandler.once("line", resolve));
}

function consumeNextEventValue() {
    return +simulationState.eventDataQueue[simulationState.eventDataPointer++];
}

function processIncomingOrders() {
    while (simulationState.lastOrderPickupDayProcessed < simulationState.currentSimulationDay) {
        simulationState.lastOrderPickupDayProcessed++;
        let count = consumeNextEventValue();
        for (let i = 0; i < count; ++i) {
            let itemId = consumeNextEventValue() - 1;
            let destinationNode = consumeNextEventValue() - 1;
            simulationState.pendingDeliveries.add(destinationNode);
            simulationState.deliverySchedule[destinationNode].push(simulationState.lastOrderPickupDayProcessed);
        }
    }
}

function completeDeliveries() {
    simulationState.pendingDeliveries.delete(simulationState.currentVehicleLocation);
    while (simulationState.deliverySchedule[simulationState.currentVehicleLocation].length > 0) {
        let pickupDay = simulationState.deliverySchedule[simulationState.currentVehicleLocation].pop();
        let timeElapsed = simulationState.currentSimulationDay - pickupDay;
        simulationState.totalAccumulatedScore += simulationState.maxSimulationDurationSquared - timeElapsed * timeElapsed;
    }
}

function determineNextPathSegment(targetNode) {
    const fromNode = simulationState.currentVehicleLocation;
    const nextHop = simulationState.nextHopOnPath[fromNode][targetNode];

    if (fromNode === targetNode) {
        simulationState.remainingTravelSteps = 0;
        return fromNode;
    }

    if (nextHop === -1 || nextHop === undefined || simulationState.directEdgeCosts[fromNode][nextHop] === IMPOSSIBLE_COST) {
        return -2;
    }

    simulationState.remainingTravelSteps = simulationState.directEdgeCosts[fromNode][nextHop] - 1;
    simulationState.currentVehicleLocation = nextHop;
    return simulationState.currentVehicleLocation;
}

function selectNextDestination() {
    if (simulationState.pendingDeliveries.size === 0) {
        if (simulationState.currentVehicleLocation === 0) return -2;
        return determineNextPathSegment(0);
    }

    const reachableCandidates = Array.from(simulationState.pendingDeliveries).filter(node =>
        simulationState.pathCosts[simulationState.currentVehicleLocation][node] <=
        simulationState.maxSimulationDuration - simulationState.currentSimulationDay
    );

    if (reachableCandidates.length === 0) {
        return determineNextPathSegment(0);
    }

    let optimalTargetNode = reachableCandidates.reduce((bestNode, currentNode) => {
        const currentOrders = simulationState.deliverySchedule[currentNode].length;
        const bestOrders = simulationState.deliverySchedule[bestNode].length;
        if (currentOrders > bestOrders) {
            return currentNode;
        }
        return bestNode;
    }, reachableCandidates[0]);

    return determineNextPathSegment(optimalTargetNode);
}

function evaluateDailyAction() {
    if (simulationState.remainingTravelSteps > 0) {
        simulationState.remainingTravelSteps--;
        return simulationState.currentVehicleLocation;
    }

    if (simulationState.currentVehicleLocation === 0) {
        processIncomingOrders();
    } else {
        completeDeliveries();
    }

    return selectNextDestination();
}

async function startSimulation() {
    let lineParts = (await retrieveLine()).split(" ");
    simulationState.nodeCount = +lineParts[0];
    simulationState.edgeCount = +lineParts[1];

    simulationState.pathCosts = makeDimensionedArray([simulationState.nodeCount, simulationState.nodeCount], IMPOSSIBLE_COST);
    simulationState.directEdgeCosts = makeDimensionedArray([simulationState.nodeCount, simulationState.nodeCount], IMPOSSIBLE_COST);
    simulationState.adjacencies = makeDimensionedArray([simulationState.nodeCount], []);
    simulationState.nextHopOnPath = makeDimensionedArray([simulationState.nodeCount, simulationState.nodeCount], -1);

    for (let i = 0; i < simulationState.nodeCount; ++i) {
        simulationState.pathCosts[i][i] = 0;
        simulationState.nextHopOnPath[i][i] = i;
    }

    for (let i = 0; i < simulationState.edgeCount; ++i) {
        lineParts = (await retrieveLine()).split(" ");
        let nodeA = +lineParts[0] - 1;
        let nodeB = +lineParts[1] - 1;
        let distance = +lineParts[2];
        simulationState.pathCosts[nodeA][nodeB] = simulationState.pathCosts[nodeB][nodeA] = distance;
        simulationState.directEdgeCosts[nodeA][nodeB] = simulationState.directEdgeCosts[nodeB][nodeA] = distance;
        simulationState.adjacencies[nodeA].push(nodeB);
        simulationState.adjacencies[nodeB].push(nodeA);
        simulationState.nextHopOnPath[nodeA][nodeB] = nodeB;
        simulationState.nextHopOnPath[nodeB][nodeA] = nodeA;
    }

    for (let k = 0; k < simulationState.nodeCount; ++k) {
        for (let i = 0; i < simulationState.nodeCount; ++i) {
            for (let j = 0; j < simulationState.nodeCount; ++j) {
                if (simulationState.pathCosts[i][k] !== IMPOSSIBLE_COST && simulationState.pathCosts[k][j] !== IMPOSSIBLE_COST &&
                    simulationState.pathCosts[i][k] + simulationState.pathCosts[k][j] < simulationState.pathCosts[i][j]) {
                    simulationState.pathCosts[i][j] = simulationState.pathCosts[i][k] + simulationState.pathCosts[k][j];
                    simulationState.nextHopOnPath[i][j] = simulationState.nextHopOnPath[i][k];
                }
            }
        }
    }

    (await retrieveLine()).split(" ").map(val => +val);
    simulationState.maxSimulationDuration = +(await retrieveLine());
    simulationState.maxSimulationDurationSquared = simulationState.maxSimulationDuration * simulationState.maxSimulationDuration;

    simulationState.deliverySchedule = makeDimensionedArray([simulationState.nodeCount], []);

    for (; simulationState.currentSimulationDay < simulationState.maxSimulationDuration; ++simulationState.currentSimulationDay) {
        let numNewItems = +(await retrieveLine());
        simulationState.eventDataQueue.push(numNewItems);
        for (let i = 0; i < numNewItems; ++i) {
            lineParts = (await retrieveLine()).split(" ").map(val => +val);
            simulationState.eventDataQueue.push(lineParts[0], lineParts[1]);
        }
        let numDummy1 = +(await retrieveLine());
        for (let i = 0; i < numDummy1; ++i) {
            await retrieveLine();
        }

        const vehicleDestination = evaluateDailyAction();
        simulationState.outputLog[simulationState.currentSimulationDay] = vehicleDestination + 1;
        console.log(simulationState.outputLog[simulationState.currentSimulationDay]);

        let statusLine = await retrieveLine();
        if (statusLine[0] !== "O") {
            ioHandler.close();
            return;
        }
        let numDummy2 = +(await retrieveLine());
        for (let i = 0; i < numDummy2; ++i) {
            await retrieveLine();
        }
    }
    ioHandler.close();
}

startSimulation();