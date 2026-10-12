((rawData) => {
  // Split the entire input string into an array of lines.
  const linesOfText = rawData.split('\n');

  // Process the first line to extract key parameters.
  const initialParams = linesOfText[0].split(' ').map(Number);

  // 'capacity' represents the maximum number of passengers per trip.
  const capacity = initialParams[1];

  // 'timeWindow' defines the maximum allowed time difference for passengers on the same trip.
  const timeWindow = initialParams[2];

  // Parse the remaining lines as numbers, sort them, and store in 'sortedTimes'.
  let sortedTimes = linesOfText.slice(1).map(Number).sort((a, b) => a - b);

  // Initialize a counter for the number of required bus trips.
  let busTrips = 0;

  // Continue processing as long as there are passengers waiting.
  while (sortedTimes.length > 0) {
    // Determine the latest departure time for the current bus trip.
    // This is based on the earliest passenger's arrival time plus the time window.
    const timeThreshold = sortedTimes[0] + timeWindow;

    // 'lastPassengerIndex' will track the index of the last passenger included in the current trip.
    let lastPassengerIndex = 0;

    // Iterate through potential passengers for the current trip, up to the bus's capacity.
    for (let currentPassenger = 1; currentPassenger <= capacity; currentPassenger++) {
      // If there are no more passengers or the current passenger arrived too late,
      // then stop adding passengers to this trip.
      if (sortedTimes[currentPassenger] === undefined || sortedTimes[currentPassenger] >= timeThreshold) {
        break;
      }
      // If the passenger can be included, update the last passenger index.
      lastPassengerIndex = currentPassenger;
    }

    // Remove the passengers who just boarded the bus from the waiting list.
    // The slice operation creates a new array starting from the next unboarded passenger.
    sortedTimes = sortedTimes.slice(lastPassengerIndex);

    // Increment the count of bus trips.
    busTrips += 1;
  }

  // Output the final calculated number of bus trips.
  console.log(busTrips);

})(require("fs").readFileSync("/dev/stdin", "utf8"));
