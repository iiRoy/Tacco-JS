"use strict";

function processSchedule(rawScheduleData) {
  let scheduleLines = rawScheduleData.split(/\n/);
  const initialCount = ~~scheduleLines.shift();

  const stationRouteDetails = scheduleLines.map(line =>
    line.split(/\s/).map(val => ~~val)
  );

  const calculateSegmentJourney = (allStations, startingStationIndex) => {
    const relevantStations = allStations.slice(startingStationIndex);

    return relevantStations.reduce((currentCumulativeTime, currentStationInfo) => {
      const [travelDuration, scheduledDeparture, departureFrequency] = currentStationInfo;

      let effectiveDepartureTime;

      if (currentCumulativeTime < scheduledDeparture) {
        effectiveDepartureTime = scheduledDeparture;
      } else {
        effectiveDepartureTime = currentCumulativeTime;
        if (effectiveDepartureTime % departureFrequency !== 0) {
          effectiveDepartureTime += departureFrequency - (effectiveDepartureTime % departureFrequency);
        }
      }

      return effectiveDepartureTime + travelDuration;
    }, 0);
  };

  const allJourneyResults = Array.from({ length: stationRouteDetails.length }, (_, idx) =>
    calculateSegmentJourney(stationRouteDetails, idx)
  );

  const finalOutputString = allJourneyResults.join("\n") + "\n0";

  console.log(finalOutputString);
}

processSchedule(require("fs").readFileSync("/dev/stdin", "utf8"));
