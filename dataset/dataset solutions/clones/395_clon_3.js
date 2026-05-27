const fileSystemModule = require('fs');
const fileSize = fileSystemModule.fstatSync(process.stdin.fd).size;
const inputBuffer = Buffer.alloc(fileSize);
const readBytesCount = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, fileSize, 0);
const inputLines = inputBuffer.toString('utf8', 0, readBytesCount).split('\n');

processSimulation();

function processSimulation() {
  const groupWaitDurations = simulateRestaurantActivity();
  const radixTen = 10;

  for (let lineIdx = 0; lineIdx < inputLines.length - 1; lineIdx++) {
    const groupIdentifier = parseInt(inputLines[lineIdx], radixTen);
    console.log(groupWaitDurations[groupIdentifier]);
  }
}

function findConsecutiveFreeSeats(seatOccupancyArray, requiredCount) {
  let currentConsecutiveFree = 0;
  for (let k = 0; k < seatOccupancyArray.length; k++) {
    if (seatOccupancyArray[k] === 0) {
      currentConsecutiveFree++;
      if (currentConsecutiveFree === requiredCount) {
        return k - requiredCount + 1;
      }
    } else {
      currentConsecutiveFree = 0;
    }
  }
  return -1;
}

function simulateRestaurantActivity() {
  const totalSeats = 17;
  const restaurantSeats = Array(totalSeats).fill(0);

  const groupSizePatterns = [2, 5, 2, 2, 2];
  const eatingDurationPatterns = [19, 39, 25, 36, 22, 42];
  const groupArrivalIntervalMinutes = 5;

  let currentGroupIndex = -1;
  let elapsedMinutes = 0;
  const maxGroupsToTrack = 101;
  const groupWaitTimes = Array(maxGroupsToTrack).fill(0);
  let remainingGroupsToProcess = 100;

  while (true) {
    for (let seatIdx = 0; seatIdx < restaurantSeats.length; seatIdx++) {
      restaurantSeats[seatIdx] = Math.max(0, restaurantSeats[seatIdx] - 1);
    }

    if (currentGroupIndex === -1 && elapsedMinutes % groupArrivalIntervalMinutes === 0) {
      currentGroupIndex = elapsedMinutes / groupArrivalIntervalMinutes;
    }

    while (currentGroupIndex !== -1) {
      const groupSize = groupSizePatterns[currentGroupIndex % groupSizePatterns.length];
      const potentialSeatStartIndex = findConsecutiveFreeSeats(restaurantSeats, groupSize);

      if (potentialSeatStartIndex !== -1) {
        groupWaitTimes[currentGroupIndex] = elapsedMinutes - (currentGroupIndex * groupArrivalIntervalMinutes);

        const groupEatingDuration = eatingDurationPatterns[currentGroupIndex % eatingDurationPatterns.length];
        for (let fillSeatIdx = potentialSeatStartIndex; fillSeatIdx < potentialSeatStartIndex + groupSize; fillSeatIdx++) {
          restaurantSeats[fillSeatIdx] = groupEatingDuration;
        }

        const nextGroupCandidateIndex = currentGroupIndex + 1;
        if ((nextGroupCandidateIndex * groupArrivalIntervalMinutes) <= elapsedMinutes) {
          currentGroupIndex = nextGroupCandidateIndex;
        } else {
          currentGroupIndex = -1;
        }

        if (--remainingGroupsToProcess === 0) {
          return groupWaitTimes;
        }
      } else {
        break;
      }
    }

    elapsedMinutes++;
  }
}
