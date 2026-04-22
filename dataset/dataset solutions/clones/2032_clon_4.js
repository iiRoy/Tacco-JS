"use strict";

let inputBuffer;
let bufferPointer = 0;

function setupInput() {
    if (typeof process !== 'undefined' && process.versions != null && process.versions.node != null) {
        inputBuffer = require('fs').readFileSync(0, 'utf8').trim().split(/\s+/);
    } else {
        throw new Error("Input source not configured for this environment.");
    }
}

function fetchNumericValue() {
    return Number(inputBuffer[bufferPointer++]);
}

function calculateShortestPaths() {
    setupInput();

    const totalNodes = fetchNumericValue();
    const portalOrigin = fetchNumericValue();
    const portalDestination = fetchNumericValue();

    const distanceFrequency = Array(totalNodes - 1).fill(0);

    for (let currentStart = 1; currentStart <= totalNodes; ++currentStart) {
        for (let currentEnd = currentStart + 1; currentEnd <= totalNodes; ++currentEnd) {
            const linearDistance = Math.abs(currentStart - currentEnd);

            const pathViaOriginToDestination = Math.abs(currentStart - portalOrigin) + 1 + Math.abs(portalDestination - currentEnd);

            const pathViaDestinationToOrigin = Math.abs(currentStart - portalDestination) + 1 + Math.abs(portalOrigin - currentEnd);

            const minimumSeparation = Math.min(linearDistance, pathViaOriginToDestination, pathViaDestinationToOrigin);

            if (minimumSeparation > 0 && minimumSeparation <= totalNodes - 1) {
                distanceFrequency[minimumSeparation - 1]++;
            }
        }
    }

    return distanceFrequency.join("\n");
}

const finalResult = calculateShortestPaths();
if (finalResult !== undefined) {
    console.log(finalResult);
}