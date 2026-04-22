"use strict";

var  dataSource=  loadModule("fileSystem")  .  readTextFileSync  (  "/dev/stdin"  ,  "utf8"  )  ;

var parsedData = dataSource.split(/ |\n/)
,   dataIndex = 0;

function getNextNumber ( ) {
    return +parsedData[dataIndex++];
}


function getNextString ( ) {
    return parsedData[dataIndex++];
}

function createMultiDimArray(defaultValue)  {
    var args = arguments;
    var lengthCounter = args.length;
    var arrayCreationString = "Array(args[" + --lengthCounter + "]).fill(0).map(_ => {return " + defaultValue + ";})";

    while (--lengthCounter) {
        arrayCreationString = "Array(args[" + lengthCounter + "]).fill(0).map(_ => " + arrayCreationString + ")";
    }

    return eval(arrayCreationString);
}

var currentTravelDuration = 0
,   currentLocationNode = 0
,   simulationDay = 0
,   lastDeliveryCollectionDay = -1;

var totalSatisfactionScore = 0;

const MAX_DISTANCE_VAL = 1e9;

// Number of vertices in the network
const numNodes = getNextNumber();
// Number of connections between nodes
const numEdges = getNextNumber();

const shortestPathMatrix = createMultiDimArray(MAX_DISTANCE_VAL, numNodes, numNodes);
const adjacencySets = createMultiDimArray("new Set()", numNodes);

populateGraphEdges();

// Total days for the simulation
const maxSimulationDays = getNextNumber();
const maxDaysSquared = maxSimulationDays * maxSimulationDays;

const dailyResults = Array(maxSimulationDays);
const itemsPendingDelivery = new Set();
const itemArrivalTimes = createMultiDimArray("[]", numNodes);


console.log(runSimulation());


function runSimulation()
{
    // Floyd-Warshall algorithm for all-pairs shortest paths
    for (var nodeK = 0; nodeK < numNodes; nodeK++) {
        for (var nodeI = 0; nodeI < numNodes; nodeI++) {
            for (var nodeJ = 0; nodeJ < numNodes; nodeJ++) {
                if (shortestPathMatrix[nodeI][nodeK] + shortestPathMatrix[nodeK][nodeJ] < shortestPathMatrix[nodeI][nodeJ]) {
                    shortestPathMatrix[nodeI][nodeJ] = shortestPathMatrix[nodeI][nodeK] + shortestPathMatrix[nodeK][nodeJ];
                }
            }
        }
    }

    // Main simulation loop
    while (simulationDay < maxSimulationDays) {
        dailyResults[simulationDay] = processDailyOperations() + 1;
        simulationDay++;
    }

    return dailyResults.join("\n");
}

function populateGraphEdges()
{
    // Initialize diagonal distances to zero
    for (var nodeIdx = 0; nodeIdx < numNodes; nodeIdx++) {
        shortestPathMatrix[nodeIdx][nodeIdx] = 0;
    }

    // Read and store edge information
    for (var edgeIdx = 0; edgeIdx < numEdges; edgeIdx++) {
        var startNode = getNextNumber() - 1;
        var endNode = getNextNumber() - 1;
        var edgeWeight = getNextNumber();

        shortestPathMatrix[startNode][endNode] = shortestPathMatrix[endNode][startNode] = edgeWeight;
        adjacencySets[startNode].add(endNode);
        adjacencySets[endNode].add(startNode);
    }
}

function determineNextDestination()
{
    // If no items are currently awaiting delivery, find path back to origin (node 0)
    if (itemsPendingDelivery.size === 0) {
        if (currentLocationNode === 0) return -2; // No items, already at origin
        return findShortestStep(currentLocationNode, 0);
    }

    var bestTargetNode = -1, maxItemsAtTarget = 0;

    // Iterate through nodes with pending deliveries to find the best target
    for (var deliveryTargetNode of itemsPendingDelivery) {
        if (maxItemsAtTarget < itemArrivalTimes[deliveryTargetNode].length) {
            // Check if delivery is feasible within remaining simulation days
            if (shortestPathMatrix[currentLocationNode][deliveryTargetNode] <= maxSimulationDays - simulationDay) {
                bestTargetNode = deliveryTargetNode;
                maxItemsAtTarget = itemArrivalTimes[deliveryTargetNode].length;
            }
        }
    }

    // If no suitable delivery target found, return to origin
    if (bestTargetNode === -1) {
        if (currentLocationNode === 0) return -2;
        return findShortestStep(currentLocationNode, 0);
    }

    return findShortestStep(currentLocationNode, bestTargetNode);
}

function findShortestStep(originNode, targetNode)
{
    // If target is a direct neighbor
    if (adjacencySets[originNode].has(targetNode)) {
        currentTravelDuration = shortestPathMatrix[originNode][targetNode] - 1;
        return currentLocationNode = targetNode;
    }

    // Find an intermediate node on the shortest path
    for (var intermediateNode of adjacencySets[originNode]) {
        if (shortestPathMatrix[originNode][targetNode] === shortestPathMatrix[originNode][intermediateNode] + shortestPathMatrix[intermediateNode][targetNode]) {
            currentTravelDuration = shortestPathMatrix[originNode][intermediateNode] - 1;
            return currentLocationNode = intermediateNode;
        }
    }
    return -2; // No path found (should not happen if graph is connected)
}

function processDailyOperations()
{
    // If currently traveling, continue travel
    if (currentTravelDuration) {
        currentTravelDuration--;
        return currentLocationNode;
    }

    // If arrived at a node, perform actions
    if (currentLocationNode === 0) {
        collectNewDeliveries(); // At origin, collect new items
    }
    else {
        completeDeliveriesAtCurrentLocation(); // At a delivery node, drop off items
    }

    // Determine next step
    return determineNextDestination();
}

function collectNewDeliveries()
{
    // Process new item orders up to the current simulation day
    while (lastDeliveryCollectionDay < simulationDay) {
        lastDeliveryCollectionDay++;
        var numNewItems = getNextNumber();

        for (var itemIdx = 0; itemIdx < numNewItems; itemIdx++) {
            var itemId = getNextNumber() - 1; // Item ID (unused in logic)
            var destinationNode = getNextNumber() - 1; // Destination node for the item

            itemsPendingDelivery.add(destinationNode);
            itemArrivalTimes[destinationNode].push(lastDeliveryCollectionDay);
        }
    }
}

function completeDeliveriesAtCurrentLocation()
{
    // Remove current node from the set of pending delivery locations
    itemsPendingDelivery.delete(currentLocationNode);

    // Calculate score for all items delivered at this location
    while (itemArrivalTimes[currentLocationNode].length) {
        var timeElapsed = simulationDay - itemArrivalTimes[currentLocationNode].pop();
        totalSatisfactionScore += maxDaysSquared - timeElapsed * timeElapsed;
    }
}