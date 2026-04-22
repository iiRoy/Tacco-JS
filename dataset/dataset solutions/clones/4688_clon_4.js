((rawData) => {
  const parsedData = rawData.split('\n');
  const configValues = parsedData[0].split(' ').map(Number);
  const busCapacity = configValues[1];
  const maxWaitTime = configValues[2];

  const arrivalTimes = parsedData.slice(1).map(Number).sort((a, b) => a - b);

  let totalBuses = 0;
  let currentPersonIndex = 0;

  while (currentPersonIndex < arrivalTimes.length) {
    totalBuses++;
    const busDepartureAnchor = arrivalTimes[currentPersonIndex];
    const busMaxArrivalTime = busDepartureAnchor + maxWaitTime;

    let nextPersonIndex = currentPersonIndex + 1;
    let passengersOnCurrentBus = 1;

    while (passengersOnCurrentBus < busCapacity && nextPersonIndex < arrivalTimes.length) {
      if (arrivalTimes[nextPersonIndex] >= busMaxArrivalTime) {
        break;
      }
      passengersOnCurrentBus++;
      nextPersonIndex++;
    }
    currentPersonIndex = nextPersonIndex;
  }

  console.log(totalBuses);
})(require("fs").readFileSync("/dev/stdin", "utf8"));