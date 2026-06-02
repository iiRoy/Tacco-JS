"use strict";

function initializeLastSeenMap(sizeLimit, initialMarker) {
  const mapContainer = new Array(sizeLimit);
  for (let idx = 0; idx < sizeLimit; idx++) {
    mapContainer[idx] = initialMarker;
  }
  return mapContainer;
}

function calculateColoringWays(rawData) {
  const cleanedInputString = rawData.trim();
  const inputStringParts = cleanedInputString.split(/\s+/);
  const numericStoneValues = inputStringParts.map(valueStr => Number(valueStr));

  const totalStoneCount = numericStoneValues.shift();
  const MODULO_VALUE = 10 ** 9 + 7;

  const UNSEEN_MARKER = -1; // Using -1 as a distinct marker for unseen colors
  const lastKnownColorPosition = initializeLastSeenMap(2000000, UNSEEN_MARKER);

  // Initialize for the very first stone (index 0)
  lastKnownColorPosition[numericStoneValues[0]] = 0;

  const dynamicProgrammingResults = [1]; // dp[0] is 1 way

  for (let currentStonePosition = 1; currentStonePosition < totalStoneCount; currentStonePosition++) {
    const currentStoneColor = numericStoneValues[currentStonePosition];
    const previousStonePosition = currentStonePosition - 1;

    const isColorPreviouslySeen = lastKnownColorPosition[currentStoneColor] !== UNSEEN_MARKER;
    const wasColorImmediatelyBefore = lastKnownColorPosition[currentStoneColor] === previousStonePosition;

    if (!isColorPreviouslySeen || wasColorImmediatelyBefore) {
      // If the color is new or was just before, it simply extends the previous sequence
      dynamicProgrammingResults[currentStonePosition] = dynamicProgrammingResults[previousStonePosition];
    } else {
      // If the color was seen before, but not immediately before,
      // we add ways from the previous state and ways from the last occurrence of this color
      const waysFromPriorState = dynamicProgrammingResults[previousStonePosition];
      const waysFromLastOccurrence = dynamicProgrammingResults[lastKnownColorPosition[currentStoneColor]];
      dynamicProgrammingResults[currentStonePosition] = (waysFromPriorState + waysFromLastOccurrence) % MODULO_VALUE;
    }

    // Update the last known position for the current color
    lastKnownColorPosition[currentStoneColor] = currentStonePosition;
  }

  // The final result is the last computed value in the DP array
  return dynamicProgrammingResults.pop();
}

const fileInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const finalCalculatedWays = calculateColoringWays(fileInputContent);
console.log(finalCalculatedWays);
