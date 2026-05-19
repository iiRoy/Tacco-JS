"use strict";
const fs = require("fs");
const rawData = fs.readFileSync("/dev/stdin", "utf-8");
const lines = rawData.split("\n");

const humanSequence = lines[1];
const sequenceLength = humanSequence.length;

if (sequenceLength === 0) {
    console.log(0);
} else {
    // Pre-calculate the number of 'W's to the left of each position (exclusive)
    // westwardCountsLeft[i] stores the count of 'W's in humanSequence[0...i-1]
    const westwardCountsLeft = Array(sequenceLength).fill(0);
    for (let currentPosition = 1; currentPosition < sequenceLength; currentPosition++) {
        westwardCountsLeft[currentPosition] = westwardCountsLeft[currentPosition - 1] + (humanSequence[currentPosition - 1] === "W" ? 1 : 0);
    }

    // Pre-calculate the number of 'E's to the right of each position (exclusive)
    // eastwardCountsRight[i] stores the count of 'E's in humanSequence[i+1...sequenceLength-1]
    const eastwardCountsRight = Array(sequenceLength).fill(0);
    for (let currentPosition = sequenceLength - 2; currentPosition >= 0; currentPosition--) {
        eastwardCountsRight[currentPosition] = eastwardCountsRight[currentPosition + 1] + (humanSequence[currentPosition + 1] === "E" ? 1 : 0);
    }

    let minimumRotations = Infinity;

    // Iterate through each person, considering them as the potential leader
    // The leader does not need to change direction.
    // People to the left must face 'E', people to the right must face 'W'.
    for (let leaderIndex = 0; leaderIndex < sequenceLength; leaderIndex++) {
        const rotationsForCurrentLeader = westwardCountsLeft[leaderIndex] + eastwardCountsRight[leaderIndex];
        if (rotationsForCurrentLeader < minimumRotations) {
            minimumRotations = rotationsForCurrentLeader;
        }
    }
    console.log(minimumRotations);
}
