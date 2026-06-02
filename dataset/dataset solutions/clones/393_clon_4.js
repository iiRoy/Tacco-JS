function processSimulation() {
  const totalSeats = 17;
  let seatOccupancy = Array(totalSeats).fill(0);
  const partySizes = [2, 5, 2, 2, 2];
  const mealDurations = [19, 39, 25, 36, 22, 42];

  let elapsedTime = 0;
  const partyWaitTimes = [];
  const waitingParties = [];

  const targetSeatedCount = 100;

  while (partyWaitTimes.filter(w => w !== undefined).length < targetSeatedCount) {
    seatOccupancy = seatOccupancy.map(currentSeatTime => Math.max(0, currentSeatTime - 1));

    if (elapsedTime % 5 === 0) {
      const partyIdentifier = elapsedTime / 5;
      waitingParties.push({
        id: partyIdentifier,
        size: partySizes[partyIdentifier % partySizes.length],
        arrival: elapsedTime
      });
    }

    while (waitingParties.length > 0 && waitingParties[0].arrival <= elapsedTime) {
      const currentPartyToSeat = waitingParties[0];
      const requiredSeatCount = currentPartyToSeat.size;

      let foundStartingSeat = -1;
      for (let seatIndex = 0; seatIndex <= seatOccupancy.length - requiredSeatCount; seatIndex++) {
        const potentialSeatBlock = seatOccupancy.slice(seatIndex, seatIndex + requiredSeatCount);
        if (potentialSeatBlock.every(seatStatus => seatStatus === 0)) {
          foundStartingSeat = seatIndex;
          break;
        }
      }

      if (foundStartingSeat !== -1) {
        partyWaitTimes[currentPartyToSeat.id] = elapsedTime - currentPartyToSeat.arrival;

        const duration = mealDurations[currentPartyToSeat.id % mealDurations.length];
        for (let seatIndex = foundStartingSeat; seatIndex < (requiredSeatCount + foundStartingSeat); seatIndex++) {
          seatOccupancy[seatIndex] = duration;
        }

        waitingParties.shift();
      } else {
        break;
      }
    }

    elapsedTime++;
  }

  for (let queryIndex = 0; queryIndex < (inputData.length - 1); queryIndex++) {
    console.log(partyWaitTimes[Number.parseInt(inputData[queryIndex], 10)]);
  }
}

let inputData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  inputData += chunk;
});
process.stdin.on('end', function() {
  inputData = inputData.split('\n');
  processSimulation();
});
