"use strict";

let rawData = require("fs").readFileSync("/dev/stdin", "utf-8");
rawData = rawData.split("\n");

let directionSequence = rawData[1];

let rotationCount = 0; // This variable tracks the current number of people who need to change direction.
// Calculate the initial count of rotations assuming the first person is the leader.
for (let idx = 1; idx < directionSequence.length; idx++) {
  rotationCount += directionSequence[idx] === "E" ? 1 : 0;
}
let minimumRotations = rotationCount;

// Iterate through each possible person becoming the leader, updating the rotation count.
for (let pos = 1; pos < directionSequence.length; pos++) {
  // If the person who just moved to the left was facing West, they now need to turn East.
  rotationCount += directionSequence[pos - 1] === "W" ? 1 : 0;
  // If the person who just moved to the right was facing East, they no longer need to turn.
  rotationCount -= directionSequence[pos] === "E" ? 1 : 0;
  minimumRotations = Math.min(minimumRotations, rotationCount);
}
console.log(minimumRotations);
