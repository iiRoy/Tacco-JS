"use strict";

// Helper function to parse a single line of station schedule data
// Each line describes a segment of the journey: [travel_time_to_next, departure_time_from_this, interval_at_this]
const parseJourneySegment = (lineText) => {
  const components = lineText.split(' ').map(valStr => Number.parseInt(valStr, 10));
  // A robust check for valid numeric input.
  if (components.length < 3 || components.some(isNaN)) {
    throw new Error(`Corrupted segment data encountered: ${lineText}`);
  }
  return {
    travelTime: components[0],           // Duration required to reach the subsequent station
    firstDeparture: components[1],       // The earliest scheduled departure time from the current station
    departureFrequency: components[2]    // The fixed interval between consecutive departures from this station
  };
};

// Core function to compute travel durations for various starting points
function computeTravelDurations(rawScheduleInput) {
  // Pre-process the input string: remove leading/trailing whitespace, then split into individual lines
  const scheduleLines = rawScheduleInput.trim().split('\n');

  // The very first line of the input usually contains a count (N) which, in this problem's logic,
  // is often redundant as the number of segments can be derived from the array length.
  // We explicitly remove and discard it here.
  scheduleLines.shift(); 

  // Transform the raw text lines into a structured array of segment objects for easier access and readability
  const segmentDetails = scheduleLines.map(parseJourneySegment);

  const calculatedOutcomes = []; // An array to accumulate the total travel times for each starting point

  // The outer loop iterates through each possible starting segment (representing a station).
  // For each starting station, a full journey simulation to the final destination is performed.
  for (let currentStartingPoint = 0; currentStartingPoint < segmentDetails.length; ++currentStartingPoint) {
    let accumulatedJourneyDuration = 0; // This variable tracks the total time elapsed from the current starting point
                                        // up to the arrival at the current processing station in the inner loop.

    // The inner loop simulates the journey sequence from the 'currentStartingPoint' to the end.
    for (let segmentIterator = currentStartingPoint; segmentIterator < segmentDetails.length; ++segmentIterator) {
      const activeSegment = segmentDetails[segmentIterator];

      // Step 1: Determine the actual moment of departure from the current station.
      // We must wait if our arrival at the current station (accumulatedJourneyDuration)
      // is earlier than the station's first scheduled departure (activeSegment.firstDeparture).
      let actualDepartureMoment = Math.max(accumulatedJourneyDuration, activeSegment.firstDeparture);
      
      // Step 2: Ensure the departure moment aligns with the station's departure frequency.
      // If the 'actualDepartureMoment' does not fall on an exact multiple of 'departureFrequency',
      // we must wait until the next available departure slot.
      const remainderAfterDivision = actualDepartureMoment % activeSegment.departureFrequency;
      if (remainderAfterDivision !== 0) {
        actualDepartureMoment += (activeSegment.departureFrequency - remainderAfterDivision);
      }
      
      // Step 3: Update the accumulated duration.
      // 'accumulatedJourneyDuration' now reflects the time of departure from the current station,
      // before considering the travel time to the next station.
      accumulatedJourneyDuration = actualDepartureMoment;

      // Step 4: Add the travel time required to reach the next station.
      // This updates 'accumulatedJourneyDuration' to the arrival time at the next station.
      accumulatedJourneyDuration += activeSegment.travelTime;
    }
    // After simulating the journey from 'currentStartingPoint' to the end, store the total duration.
    calculatedOutcomes.push(accumulatedJourneyDuration);
  }

  // According to common problem specifications, the travel duration from the final station to itself is zero.
  // This value is appended to the results array.
  calculatedOutcomes.push(0);

  // Finally, join all calculated durations with newline characters to form the complete output string.
  return calculatedOutcomes.join('\n');
}

// Main execution wrapper function for the environment, handling file I/O.
const runApplication = (inputSourcePath) => {
  // Read the entire file content synchronously from the specified path.
  const fileData = require("fs").readFileSync(inputSourcePath, "utf8");
  // Process the raw file data using the core logic to get the final result string.
  const finalResultString = computeTravelDurations(fileData);
  // Output the final string to standard output.
  console.log(finalResultString);
};

// Invoke the application's entry point, typically reading from standard input.
runApplication("/dev/stdin");