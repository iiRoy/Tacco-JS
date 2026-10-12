"use strict";

// This function processes the input data to calculate travel times between stations.
const processInputData = (inputContent) => {
  // Trim leading/trailing whitespace and split the input into lines.
  inputContent = inputContent.trim().split("\n");

  // The first line contains the total number of stations.
  const totalStations = parseInt(inputContent[0]);

  // Arrays to store station-specific data:
  // `connectionDurations`: Time taken to travel from station i to i+1.
  let connectionDurations = [];
  // `initialDepartureTimes`: The earliest departure time from station i.
  let initialDepartureTimes = [];
  // `departureFrequencies`: The interval at which trains depart from station i.
  let departureFrequencies = [];

  // Parse the station data from the input lines.
  // The loop starts from the second line (index 1) up to N-1 lines.
  for (let lineIndex = 1; lineIndex < totalStations; lineIndex++) {
    // Split each line by space and convert parts to integers.
    let lineSegments = inputContent[lineIndex].split(" ").map((strNum) => parseInt(strNum));

    // Store the parsed values into their respective arrays.
    connectionDurations[lineIndex - 1] = lineSegments[0];
    initialDepartureTimes[lineIndex - 1] = lineSegments[1];
    departureFrequencies[lineIndex - 1] = lineSegments[2];
  }

  // This array will store the calculated total travel time from each starting station
  // to the final destination.
  let finalTravelDurations = [];

  // Iterate through each possible starting station.
  for (let currentOriginIndex = 0; currentOriginIndex < totalStations; currentOriginIndex++) {
    // Initialize the current accumulated travel time for this journey.
    let currentJourneyTime = 0;

    // If this is the last station, the travel time to itself is 0.
    if (currentOriginIndex === totalStations - 1) {
      finalTravelDurations.push(0);
      // No further calculations needed for the last station.
      break;
    }

    // Calculate the time to reach the first subsequent station.
    // This is the initial departure time from the current station plus the travel duration to the next.
    currentJourneyTime += initialDepartureTimes[currentOriginIndex] + connectionDurations[currentOriginIndex];

    // Iterate through the subsequent stations to calculate the total travel time.
    // The loop goes from the station *after* the current one up to the second-to-last station.
    for (let nextStopIndex = parseInt(currentOriginIndex) + 1; nextStopIndex < totalStations - 1; nextStopIndex++) {
      // Check if the current arrival time aligns perfectly with the next station's departure schedule.
      if (currentJourneyTime === initialDepartureTimes[nextStopIndex]) {
        // If it aligns, just add the travel duration to the next station.
        currentJourneyTime += connectionDurations[nextStopIndex];
      } else {
        // If not aligned, we need to wait for the next available departure.
        // Increment time until it's greater than or equal to the next station's start time
        // and is a multiple of its frequency (relative to the start time).
        while (initialDepartureTimes[nextStopIndex] + departureFrequencies[nextStopIndex] > currentJourneyTime) {
          currentJourneyTime++;
        }

        // Once a valid departure time is found, add the travel duration to the next station.
        currentJourneyTime += connectionDurations[nextStopIndex];
      }
    }

    // Store the total calculated travel time for this starting station.
    finalTravelDurations.push(currentJourneyTime);
  }

  // Output the calculated travel times, each on a new line.
  console.log(finalTravelDurations.join("\n"));
};

// Read input from standard input and pass it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
