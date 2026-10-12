((inputData) => {
  const inputLines = inputData.split('\n');
  const configurationParameters = inputLines[0].split(' ').map(Number);
  const busMaximumCapacity = configurationParameters[1];
  const timeWindowAllowance = configurationParameters[2];
  const sortedPassengerArrivals = inputLines.slice(1).map(Number).sort((a, b) => a - b);

  function* planBusRoutes(arrivalsList, maxSeats, timeLimit) {
    let currentProcessingIndex = 0;
    const totalArrivalEntries = arrivalsList.length;

    while (currentProcessingIndex < totalArrivalEntries) {
      const initialPassengerTime = arrivalsList[currentProcessingIndex];
      const busDepartureCutoff = initialPassengerTime + timeLimit;

      // Determine the count of passengers who can board based on their arrival time.
      // This loop finds the relative index of the first passenger whose arrival time
      // is at or beyond the busDepartureCutoff.
      let firstUnsuitableRelativeIndex = -1;
      for (let k = 0; k < totalArrivalEntries - currentProcessingIndex; k++) {
        if (arrivalsList[currentProcessingIndex + k] >= busDepartureCutoff) {
          firstUnsuitableRelativeIndex = k;
          break;
        }
      }

      // Calculate how many passengers are eligible by time.
      // If no passenger is found to be unsuitable by time, all remaining passengers are eligible.
      const eligibleByTimeCount = firstUnsuitableRelativeIndex === -1
        ? (totalArrivalEntries - currentProcessingIndex)
        : firstUnsuitableRelativeIndex;

      // The actual number of passengers boarding this bus is constrained by both
      // the bus's maximum capacity and the number of passengers eligible by time.
      const passengersBoardingThisBus = Math.min(maxSeats, eligibleByTimeCount);

      // A bus is considered dispatched.
      yield 1;

      // Advance the processing index past the passengers who have just boarded this bus.
      currentProcessingIndex += passengersBoardingThisBus;
    }
  }

  const busTripIterator = planBusRoutes(sortedPassengerArrivals, busMaximumCapacity, timeWindowAllowance);
  let finalBusCount = 0;
  for (const tripIncrement of busTripIterator) {
    finalBusCount += tripIncrement;
  }

  console.log(finalBusCount);

})(require("fs").readFileSync("/dev/stdin", "utf8"));
