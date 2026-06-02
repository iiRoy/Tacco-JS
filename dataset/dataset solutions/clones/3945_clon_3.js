"use strict";

const IS_DEBUG = false;
const initialInputString = IS_DEBUG
  ? "2\n1 19"
  : require("fs")
      .readFileSync("/dev/stdin", "utf8")
      .trim();

const getAbsoluteDifference = (valA, valB) => Math.abs(valA - valB);

const calculateTravelPlans = inputDataString => {
  const parsedLines = inputDataString.split("\n");
  const numLocations = parseInt(parsedLines[0], 10);

  const rawLocationStrings = parsedLines[1].split(" ");
  const intermediateLocations = rawLocationStrings.map(Number);
  const extendedLocations = [];
  extendedLocations.push(0);
  extendedLocations.push(...intermediateLocations);
  extendedLocations.push(0);

  let overallJourneyLength = 0;
  for (let k = 1; k < extendedLocations.length; k++) {
    overallJourneyLength += getAbsoluteDifference(extendedLocations[k], extendedLocations[k - 1]);
  }

  for (let k = 1; k < numLocations + 1; k++) {
    const prevLocation = extendedLocations[k - 1];
    const omittedLocation = extendedLocations[k];
    const nextLocation = extendedLocations[k + 1];

    const removedSegmentLength = getAbsoluteDifference(omittedLocation, prevLocation) + getAbsoluteDifference(omittedLocation, nextLocation);
    const addedSegmentLength = getAbsoluteDifference(prevLocation, nextLocation);

    console.log(overallJourneyLength - removedSegmentLength + addedSegmentLength);
  }
};

calculateTravelPlans(initialInputString);
