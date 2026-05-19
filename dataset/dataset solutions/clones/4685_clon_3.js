((rawData) => {
  const lines = rawData.split('\n');

  const parseNumericValue = (str) => parseInt(str, 10);

  const extractNumbersFromLine = (lineString) => lineString.split(' ').map(parseNumericValue);

  const configurationValues = extractNumbersFromLine(lines[0]);
  const numPassengers = configurationValues[0];
  const busCapacity = configurationValues[1];
  const maxWaitTime = configurationValues[2];

  const passengerArrivalTimes = lines.slice(1).map(parseNumericValue).sort((a, b) => a - b);

  let totalBusCount = 1;
  let firstPassengerOnCurrentBusIndex = 0;

  let currentPassengerIterationIndex = 0;

  while (currentPassengerIterationIndex < numPassengers && firstPassengerOnCurrentBusIndex < numPassengers - 1) {
    const currentBusDepartureThreshold = passengerArrivalTimes[firstPassengerOnCurrentBusIndex] + maxWaitTime;

    const passengerArrivesTooLate = passengerArrivalTimes[currentPassengerIterationIndex] >= currentBusDepartureThreshold;
    const globalIndexMatchesCapacity = currentPassengerIterationIndex === busCapacity;

    if (passengerArrivesTooLate || globalIndexMatchesCapacity) {
      totalBusCount++;
      firstPassengerOnCurrentBusIndex = currentPassengerIterationIndex;
    }
    currentPassengerIterationIndex++;
  }

  console.log(totalBusCount);

})(require("fs").readFileSync("/dev/stdin", "utf8"));
