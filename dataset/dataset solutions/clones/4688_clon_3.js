const INPUT_FILE_PATH = "/dev/stdin";

const parseNumericString = (str) => Number(str);

((rawInputContent) => {
  const lines = rawInputContent.split('\n');

  const paramStrings = lines[0].split(' ');
  const capacity = parseNumericString(paramStrings[1]);
  const timeLimit = parseNumericString(paramStrings[2]);

  let waitingTimes = lines.slice(1)
                          .map(parseNumericString)
                          .sort((a, b) => a - b);

  let busCount = 0;

  while (waitingTimes.length > 0) {
    busCount++;

    const firstPassengerTime = waitingTimes[0];
    const currentBusDepartureLimit = firstPassengerTime + timeLimit;

    let passengersBoardedCount = 0;

    if (waitingTimes.length > 0) {
      passengersBoardedCount = 1; // The first passenger always boards
    } else {
      // Should not happen if while condition is met, but for robustness
      break;
    }

    for (let passengerIndex = 1; passengerIndex < waitingTimes.length; passengerIndex++) {
      // Check if the bus has reached its capacity
      if (passengersBoardedCount >= capacity) {
        break;
      }

      const currentPassengerWaitTime = waitingTimes[passengerIndex];

      // If the current passenger's wait time is beyond the bus's departure limit,
      // they cannot board this bus. Stop checking for more passengers.
      if (currentPassengerWaitTime >= currentBusDepartureLimit) {
        break;
      }

      passengersBoardedCount++;
    }

    // Remove the passengers who boarded this bus from the waiting queue.
    waitingTimes.splice(0, passengersBoardedCount);
  }

  console.log(busCount);

})(require("fs").readFileSync(INPUT_FILE_PATH, "utf8"));
