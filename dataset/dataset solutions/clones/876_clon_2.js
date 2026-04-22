/*
 * Program written by a developer on October 10, 2013, for processing graph data.
 */

var fileSystemHandler = require('fs'),
    fileDataSize = fileSystemHandler.fstatSync(process.stdin.fd).size,
    incomingBuffer = new Buffer(fileDataSize),
    processedByteCount = fileSystemHandler.readSync(process.stdin.fd, incomingBuffer, 0, fileDataSize, 0),
    lineData = incomingBuffer.toString('utf8', 0, processedByteCount).split('\n');

executeProcessing();


function DisjointSetManager(elementCapacity) {
    // This function implements a Disjoint Set Union (DSU) data structure.
    var loopIndex,
        parentTracker = [];

    // Initialize each element as its own parent (root of its own set).
    for (loopIndex = 0; loopIndex < elementCapacity; loopIndex++) {
        parentTracker[loopIndex] = -1;
    }

    function mergeComponents(firstElement, secondElement) {
        firstElement = locateRoot(firstElement);
        secondElement = locateRoot(secondElement);

        // If elements are already in the same set, no merge needed.
        if (firstElement !== secondElement) {
            // Union by size/rank heuristic: attach smaller tree to root of larger tree.
            if (parentTracker[firstElement] < parentTracker[secondElement]) {
                parentTracker[firstElement] += parentTracker[secondElement];
                parentTracker[secondElement] = firstElement;
            } else {
                parentTracker[secondElement] += parentTracker[firstElement];
                parentTracker[firstElement] = secondElement;
            }
        }
        // Return true if a merge occurred, false otherwise.
        return firstElement !== secondElement;
    }


    function locateRoot(targetElement) {
        // Path compression optimization: flatten tree structure.
        return parentTracker[targetElement] < 0 ? targetElement : parentTracker[targetElement] = locateRoot(parentTracker[targetElement]);
    }


    function countActiveComponents(activeStatus) {
        var componentCounter = 0;
        // Iterate through all elements to find roots of active components.
        for (loopIndex = 0; loopIndex < elementCapacity; loopIndex++) {
            if (activeStatus[loopIndex] && parentTracker[loopIndex] < 0) {
                componentCounter++;
            }
        }
        return componentCounter;
    }


    function areInSameComponent(firstElement, secondElement) {
        // Check if two elements have the same root.
        return locateRoot(firstElement) === locateRoot(secondElement);
    }

    // Expose public methods of the DSU structure.
    return {
        mergeComponents: mergeComponents,
        locateRoot: locateRoot,
        countActiveComponents: countActiveComponents,
        areInSameComponent: areInSameComponent
    };
}


function executeProcessing() {
    var temporaryLineParts, vertexCount, connectionCount,
        outerLoopIdx, innerLoopIdx, unusedVar, // k is unused in original
        vertexAvailability, // stores node details like availability days
        connectionList, currentConnection, // arrays for graph edges
        disjointStructureInstance, // DSU instance
        cumulativeCost, // result variable
        isVertexIncluded; // boolean array for active vertices

    // Main processing loop, continues until termination condition is met.
    while (true) {
        temporaryLineParts = lineData.shift().split(' ');
        vertexCount = +temporaryLineParts[0];
        connectionCount = +temporaryLineParts[1];

        // Termination condition: both counts are zero.
        if (vertexCount === 0 && connectionCount === 0) {
            break;
        }

        vertexAvailability = [];
        isVertexIncluded = [];

        // Initialize vertex data and active status.
        for (outerLoopIdx = 0; outerLoopIdx < vertexCount; outerLoopIdx++) {
            vertexAvailability[outerLoopIdx] = {
                vertexIndex: outerLoopIdx,
                availabilityDays: +lineData.shift()
            };
            isVertexIncluded[outerLoopIdx] = false;
        }

        connectionList = [];

        // Parse connection data (edges).
        for (outerLoopIdx = 0; outerLoopIdx < connectionCount; outerLoopIdx++) {
            temporaryLineParts = lineData.shift().split(' ');
            // Store connections as [source, destination, weight] (0-indexed).
            connectionList[outerLoopIdx] = [temporaryLineParts[0] - 1, temporaryLineParts[1] - 1, temporaryLineParts[2] - 0];
        }

        // Sort vertices by their availability days.
        vertexAvailability.sort(function (firstVertex, secondVertex) {
            return firstVertex.availabilityDays - secondVertex.availabilityDays;
        });

        // Sort connections by their weights (cost).
        connectionList.sort(function (firstEdge, secondEdge) {
            return firstEdge[2] - secondEdge[2];
        });

        // Initialize Disjoint Set Union structure for the current graph.
        disjointStructureInstance = DisjointSetManager(vertexCount);
        cumulativeCost = 0;

        // Iterate through vertices in reverse order of availability days.
        for (outerLoopIdx = vertexCount - 1; outerLoopIdx >= 0; outerLoopIdx--) {
            // Mark current vertex as included/active.
            isVertexIncluded[vertexAvailability[outerLoopIdx].vertexIndex] = true;

            // Handle vertices with the same availability days.
            while (outerLoopIdx > 0 && vertexAvailability[outerLoopIdx].availabilityDays === vertexAvailability[outerLoopIdx - 1].availabilityDays) {
                outerLoopIdx--;
                isVertexIncluded[vertexAvailability[outerLoopIdx].vertexIndex] = true;
            }

            // Iterate through sorted connections to build MST among active vertices.
            for (innerLoopIdx = 0; innerLoopIdx < connectionCount; innerLoopIdx++) {
                currentConnection = connectionList[innerLoopIdx];
                // If both endpoints of the connection are active and not yet connected, unite them.
                if (isVertexIncluded[currentConnection[0]] && isVertexIncluded[currentConnection[1]] && !disjointStructureInstance.areInSameComponent(currentConnection[0], currentConnection[1])) {
                    disjointStructureInstance.mergeComponents(currentConnection[0], currentConnection[1]);
                    cumulativeCost += currentConnection[2]; // Add connection weight to total cost.
                }
            }

            // If at any point, the active vertices form more than one connected component,
            // it means an MST cannot be formed. Reset and re-evaluate.
            if (disjointStructureInstance.countActiveComponents(isVertexIncluded) > 1) {
                cumulativeCost = 0;
                disjointStructureInstance = DisjointSetManager(vertexCount); // Re-initialize DSU.
                // Original code had a commented-out break here, implying it would stop processing this set.
                // We follow the original's active logic, which means it continues and resets.
            }
        }
        // Output the calculated minimum spanning tree cost for the current test case.
        console.log(cumulativeCost);
    }
}