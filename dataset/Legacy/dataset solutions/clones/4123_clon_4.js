"use strict";

const determineDeparture = (arrivalMoment, initialDeparture, departureInterval) =>
  (arrivalMoment <= initialDeparture)
    ? initialDeparture
    : (arrivalMoment <= initialDeparture + departureInterval)
      ? initialDeparture + departureInterval
      : arrivalMoment;

const computeTravelDuration = (startingPointIndex, totalPointsCount, segmentDetailsList) => {
  if (startingPointIndex === totalPointsCount - 1) {
    return 0;
  }

  const firstLeg = segmentDetailsList[startingPointIndex];
  let currentAccumulatedTime = firstLeg.start + firstLeg.cost;

  const remainingLegs = segmentDetailsList.slice(startingPointIndex + 1, totalPointsCount - 1);

  return remainingLegs.reduce((accumulatedTime, currentSegment) => {
    const nextDepartureMoment = determineDeparture(accumulatedTime, currentSegment.start, currentSegment.freq);
    return nextDepartureMoment + currentSegment.cost;
  }, currentAccumulatedTime);
};

const parseInputData = (rawInputString) => {
  const inputLines = rawInputString.trim().split('\n');
  const totalStations = parseInt(inputLines[0], 10);

  const routeSegments = inputLines.slice(1, totalStations).map(lineContent => {
    const numericParts = lineContent.split(' ').map(Number);
    return { cost: numericParts[0], start: numericParts[1], freq: numericParts[2] };
  });

  return { totalStations, routeSegments };
};

const executeScheduleCalculation = (inputSource) => {
  const { totalStations, routeSegments } = parseInputData(inputSource);

  const finalArrivalTimes = Array.from({ length: totalStations }, (_, stationIndex) =>
    computeTravelDuration(stationIndex, totalStations, routeSegments)
  );

  return finalArrivalTimes.join('\n');
};

const programEntry = (inputPayload) => {
  console.log(executeScheduleCalculation(inputPayload));
};

programEntry(require('fs').readFileSync('/dev/stdin', 'utf8'));
