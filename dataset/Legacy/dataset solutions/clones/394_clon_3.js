var fileSystem = require('fs');

function readStandardInput() {
    var inputDescriptor = process.stdin.fd;
    var fileStats = fileSystem.fstatSync(inputDescriptor);
    var bufferSize = fileStats.size;
    var inputBuffer = new Buffer(bufferSize);
    var bytesReadCount = fileSystem.readSync(inputDescriptor, inputBuffer, 0, bufferSize, 0);
    return inputBuffer.toString('utf8', 0, bytesReadCount).split('\n');
}

var rawInputLines = readStandardInput();
processRequests();

function processRequests() {
    var simulationResults = simulateRestaurant();
    var inputLineCount = rawInputLines.length - 1;
    var RADIX_DECIMAL = 10;

    for (var lineIndex = 0; lineIndex < inputLineCount; lineIndex++) {
        var requestedGroupNumber = parseInt(rawInputLines[lineIndex], RADIX_DECIMAL);
        console.log(simulationResults[requestedGroupNumber]);
    }
}

function findMaximum(valueA, valueB) {
    var diff = (valueA - valueB);
    return valueA - (diff & (diff >> 31));
}

function simulateRestaurant() {
    var MAX_SEATS = 17;
    var GROUP_ARRIVAL_INTERVAL = 5; // minutes
    var TOTAL_GROUPS_TO_TRACK = 100;

    var seatOccupancyTimers = new Int32Array(MAX_SEATS).fill(0);
    var groupSizeConfigurations = new Int32Array([2, 5, 2, 2, 2]);
    var groupEatingDurations = new Int32Array([19, 39, 25, 36, 22, 42]);

    var currentGroupAwaitingSeating = -1;
    var currentElapsedMinutes = 0;
    var recordedWaitTimes = new Int32Array(TOTAL_GROUPS_TO_TRACK);
    var groupsRemainingToProcess = TOTAL_GROUPS_TO_TRACK;

    function findAvailableSeatBlock(requiredCount) {
        var consecutiveEmptyCount = 0;

        for (var sIdx = 0; sIdx < MAX_SEATS; sIdx++) {
            if (seatOccupancyTimers[sIdx] === 0) {
                consecutiveEmptyCount++;
            } else {
                consecutiveEmptyCount = 0;
            }

            if (consecutiveEmptyCount === requiredCount) {
                return sIdx - (requiredCount - 1);
            }
        }
        return -1;
    }

    while (true) {
        for (var seatIndex = 0; seatIndex < MAX_SEATS; seatIndex++) {
            seatOccupancyTimers[seatIndex] = findMaximum(--seatOccupancyTimers[seatIndex], 0);
        }

        var isArrivalMinute = (currentElapsedMinutes % GROUP_ARRIVAL_INTERVAL === 0);
        if (currentGroupAwaitingSeating === -1 && isArrivalMinute) {
            currentGroupAwaitingSeating = currentElapsedMinutes / GROUP_ARRIVAL_INTERVAL;
        }

        while (currentGroupAwaitingSeating !== -1) {
            var groupSize = groupSizeConfigurations[currentGroupAwaitingSeating % groupSizeConfigurations.length];
            var seatingBlockStart = findAvailableSeatBlock(groupSize);

            if (seatingBlockStart !== -1) {
                var duration = groupEatingDurations[currentGroupAwaitingSeating % groupEatingDurations.length];

                recordedWaitTimes[currentGroupAwaitingSeating] = currentElapsedMinutes - (currentGroupAwaitingSeating * GROUP_ARRIVAL_INTERVAL);

                for (var fillIdx = seatingBlockStart; fillIdx < seatingBlockStart + groupSize; fillIdx++) {
                    seatOccupancyTimers[fillIdx] = duration;
                }

                var nextGroupExpectedArrival = (currentGroupAwaitingSeating + 1) * GROUP_ARRIVAL_INTERVAL;
                if (nextGroupExpectedArrival <= currentElapsedMinutes) {
                    currentGroupAwaitingSeating++;
                } else {
                    currentGroupAwaitingSeating = -1;
                }

                groupsRemainingToProcess--;
                if (groupsRemainingToProcess === 0) {
                    return recordedWaitTimes;
                }
            } else {
                break;
            }
        }

        currentElapsedMinutes++;
    }
}
