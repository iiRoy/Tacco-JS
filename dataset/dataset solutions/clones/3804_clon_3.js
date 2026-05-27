"use strict";
const fileSystem = require("fs");
const EAST_DIRECTION_CHAR = "E";
const WEST_DIRECTION_CHAR = "W";

let rawInputData = fileSystem.readFileSync("/dev/stdin", "utf-8");
rawInputData = rawInputData.split("\n");

let directionSequence = rawInputData[1];
const sequenceLength = directionSequence.length;

// Helper function to compute the initial metric value for the first leader position (index 0).
// This metric counts how many people to the right of the leader are facing EAST.
const computeInitialMetric = (sequence) => {
    let initialMetric = 0;
    // Iterate from the second person (index 1) to the end of the sequence.
    for (let currentPersonIndex = 1; currentPersonIndex < sequence.length; currentPersonIndex++) {
        if (sequence[currentPersonIndex] === EAST_DIRECTION_CHAR) {
            initialMetric++;
        }
    }
    return initialMetric;
};

let currentMetricValue = computeInitialMetric(directionSequence);
let overallMinimumMetric = currentMetricValue;

// Iterate through all possible leader positions, starting from index 1.
// The 'leaderPosition' variable represents the current person considered as the leader.
for (let leaderPosition = 1; leaderPosition < sequenceLength; leaderPosition++) {
    // When the leader shifts from (leaderPosition - 1) to leaderPosition:
    // The person at (leaderPosition - 1) is now to the left of the new leader.
    // If this person was facing WEST, they contribute positively to the metric.
    const personToLeftOfLeader = directionSequence[leaderPosition - 1];
    if (personToLeftOfLeader === WEST_DIRECTION_CHAR) {
        currentMetricValue++;
    }

    // The person at leaderPosition is now the leader.
    // If this person was facing EAST, they no longer contribute to the 'right-facing-EAST' count.
    const personAtLeaderPosition = directionSequence[leaderPosition];
    if (personAtLeaderPosition === EAST_DIRECTION_CHAR) {
        currentMetricValue--;
    }

    // Update the overall minimum metric value found across all leader positions.
    overallMinimumMetric = Math.min(overallMinimumMetric, currentMetricValue);
}

console.log(overallMinimumMetric);
