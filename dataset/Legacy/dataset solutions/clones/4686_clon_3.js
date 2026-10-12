"use strict";

function parseSpaceSeparatedNumbers(lineContent) {
  return lineContent.trim().split(' ').map(Number);
}

function processBusSchedule(rawInputData) {
  const inputLines = rawInputData.trim().split('\n');

  const initialParameters = parseSpaceSeparatedNumbers(inputLines[0]);
  const totalPassengers = initialParameters[0];
  const busCapacityLimit = initialParameters[1];
  const maxDepartureDelay = initialParameters[2];

  const passengerArrivalTimes = inputLines.slice(1).map(Number);
  passengerArrivalTimes.sort((timeA, timeB) => timeA - timeB);

  let currentBusOccupancy = 0;
  let currentBusFirstPassengerTime = null;
  let requiredBusCount = 1;

  for (let passengerIndex = 0; passengerIndex < totalPassengers; passengerIndex++) {
    currentBusOccupancy++;

    if (currentBusFirstPassengerTime === null) {
      currentBusFirstPassengerTime = passengerArrivalTimes[passengerIndex];
    }

    let shouldDispatchCurrentBus = false;

    if (currentBusOccupancy === busCapacityLimit) {
      shouldDispatchCurrentBus = true;
    }

    const nextPassengerIndex = passengerIndex + 1;
    const nextPassengerArrivalTime = nextPassengerIndex < totalPassengers ? passengerArrivalTimes[nextPassengerIndex] : undefined;

    if (nextPassengerArrivalTime !== undefined) {
      const earliestDepartureForNext = currentBusFirstPassengerTime + maxDepartureDelay;
      if (earliestDepartureForNext < nextPassengerArrivalTime) {
        shouldDispatchCurrentBus = true;
      }
    }

    if (shouldDispatchCurrentBus) {
      requiredBusCount++;
      currentBusOccupancy = 0;
      currentBusFirstPassengerTime = null;
    }
  }

  console.log(requiredBusCount);
}

processBusSchedule(require("fs").readFileSync("/dev/stdin", "utf8"));
