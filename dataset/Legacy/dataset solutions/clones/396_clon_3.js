const fileSystemModule = require('fs');

function readStdinContent() {
    const fileDescriptor = process.stdin.fd;
    const stats = fileSystemModule.fstatSync(fileDescriptor);
    const fileSize = stats.size;

    if (fileSize === 0) {
        return [];
    }

    const dataBuffer = Buffer.alloc(fileSize);
    const actualBytesRead = fileSystemModule.readSync(fileDescriptor, dataBuffer, 0, fileSize, 0);
    const rawInputString = dataBuffer.toString('utf8', 0, actualBytesRead);
    return rawInputString.split('\n').filter(line => line.length > 0);
}

function simulateRestaurant() {
    const inputLines = readStdinContent();

    const restaurantSeats = new Array(17).fill(0);
    const groupSizes = [2, 5, 2, 2, 2];
    const eatingDurations = [19, 39, 25, 36, 22, 42];

    let currentGroupIndex = -1;
    let elapsedMinutes = 0;
    const groupWaitTimes = new Array(100).fill(0);
    let remainingGroupsToSeat = 100;

    function attemptToSeatGroup(groupIdx) {
        const requiredConsecutiveSeats = groupSizes[groupIdx % groupSizes.length];
        let currentConsecutiveEmptySeats = 0;
        let startSeatIndex = -1;

        for (let seatIdx = 0; seatIdx < restaurantSeats.length; seatIdx++) {
            if (restaurantSeats[seatIdx] === 0) {
                currentConsecutiveEmptySeats++;
            } else {
                currentConsecutiveEmptySeats = 0;
            }

            if (currentConsecutiveEmptySeats === requiredConsecutiveSeats) {
                startSeatIndex = seatIdx - (requiredConsecutiveSeats - 1);
                groupWaitTimes[groupIdx] = elapsedMinutes - (groupIdx * 5);
                const duration = eatingDurations[groupIdx % eatingDurations.length];

                for (let fillIdx = startSeatIndex; fillIdx < (requiredConsecutiveSeats + startSeatIndex); fillIdx++) {
                    restaurantSeats[fillIdx] = duration;
                }
                return true;
            }
        }
        return false;
    }

    while (true) {
        for (let seatIdx = 0; seatIdx < restaurantSeats.length; seatIdx++) {
            restaurantSeats[seatIdx] = Math.max(0, restaurantSeats[seatIdx] - 1);
        }

        if (currentGroupIndex === -1 && elapsedMinutes % 5 === 0) {
            currentGroupIndex = elapsedMinutes / 5;
        }

        while (currentGroupIndex !== -1 && remainingGroupsToSeat > 0) {
            const wasSeated = attemptToSeatGroup(currentGroupIndex);

            if (wasSeated) {
                remainingGroupsToSeat--;

                if (remainingGroupsToSeat === 0) {
                    break;
                }

                const nextGroupArrivalTime = (currentGroupIndex + 1) * 5;
                if (nextGroupArrivalTime <= elapsedMinutes) {
                    currentGroupIndex++;
                } else {
                    currentGroupIndex = -1;
                }
            } else {
                break;
            }
        }

        if (remainingGroupsToSeat === 0) {
            break;
        }

        elapsedMinutes++;
    }

    for (let inputLineIndex = 0; inputLineIndex < inputLines.length; inputLineIndex++) {
        const requestedGroupIndex = parseInt(inputLines[inputLineIndex], 10);
        console.log(groupWaitTimes[requestedGroupIndex]);
    }
}

simulateRestaurant();
