"use strict";

const parseStationLineData = (lineContent) => {
  return lineContent.split(/\s/).map(numericStr => ~~numericStr);
};

const determineNextValidDepartureTime = (currentArrivalMoment, scheduledStartTime, serviceFrequency) => {
  let departureMomentCandidate = currentArrivalMoment;

  // If current arrival is before the station's scheduled start time, wait until start time.
  if (departureMomentCandidate < scheduledStartTime) {
    departureMomentCandidate = scheduledStartTime;
  }

  // If the departure moment is not aligned with the service frequency,
  // calculate the next valid departure time.
  if (departureMomentCandidate % serviceFrequency !== 0) {
    departureMomentCandidate += serviceFrequency - (departureMomentCandidate % serviceFrequency);
  }
  return departureMomentCandidate;
};

function calculateAllJourneyTimes(rawInputContent) {
  let allInputLines = rawInputContent.split(/\n/);

  // The first line contains 'n', which is not used in the subsequent logic.
  // We slice it off to get only the relevant station data lines.
  const stationDataLines = allInputLines.slice(1);

  // Parse each line into an array of numbers representing [travel_time, start_time, frequency]
  const stationInformation = stationDataLines.map(parseStationLineData);

  // Define constants for array indices to improve readability
  const TRAVEL_DURATION_INDEX = 0;
  const STATION_START_TIME_INDEX = 1;
  const SERVICE_FREQUENCY_INDEX = 2;

  const computedJourneyResults = []; // Collect results in an array, then join

  // Outer loop: Iterate through each station as a potential starting point for a journey
  for (let currentStartStationIdx = 0; currentStartStationIdx < stationInformation.length; currentStartStationIdx++) {
    let accumulatedTime = 0; // Tracks the total time elapsed for the current journey

    // Inner loop: Calculate the time taken to travel from currentStartStationIdx to the end
    for (let segmentStationIdx = currentStartStationIdx; segmentStationIdx < stationInformation.length; segmentStationIdx++) {
      const currentSegmentStation = stationInformation[segmentStationIdx];
      const segmentTravelDuration = currentSegmentStation[TRAVEL_DURATION_INDEX];
      const segmentStationDepartureTime = currentSegmentStation[STATION_START_TIME_INDEX];
      const segmentServiceFrequency = currentSegmentStation[SERVICE_FREQUENCY_INDEX];

      // Determine the earliest time we can depart from the current segment station
      // This involves waiting if we arrive too early or if it's not a valid frequency interval.
      accumulatedTime = determineNextValidDepartureTime(
        accumulatedTime,
        segmentStationDepartureTime,
        segmentServiceFrequency
      );

      // Add the travel time to reach the next station
      accumulatedTime += segmentTravelDuration;
    }
    computedJourneyResults.push(accumulatedTime); // Store the total time for this journey
  }

  // Append the final '0' as per the original logic
  const finalOutputString = computedJourneyResults.join("\n") + "\n0";

  console.log(finalOutputString);
}

calculateAllJourneyTimes(require("fs").readFileSync("/dev/stdin", "utf8"));
