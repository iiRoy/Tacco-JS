var libIO = require('fs');
var dataStreamDescriptor = process.stdin.fd;
var dataExtent = libIO.fstatSync(dataStreamDescriptor).size;
var dataStorage = Buffer.alloc(dataExtent);
var actualReadBytes = libIO.readSync(dataStreamDescriptor, dataStorage, 0, dataExtent, 0);
var queryPayload = dataStorage.toString('utf8', 0, actualReadBytes).split('\n');

function manageDiningEstablishment() {
    const establishmentCapacity = 17;
    const clientGroupSizes = [2, 5, 2, 2, 2];
    const diningDurations = [19, 39, 25, 36, 22, 42];
    const totalClientGroups = 100;
    const groupArrivalInterval = 5;

    let clockTick = 0;
    let seatingLayout = Array.from({ length: establishmentCapacity }, () => 0); // 0 means currently free, otherwise holds the clockTick when it becomes free
    let inboundClientQueue = [];
    let recordedClientDelays = new Map();
    let seatedClientCounter = 0;
    let nextScheduledGroupIndex = 0;

    const allClientGroups = Array.from({ length: totalClientGroups }, (_, idx) => {
        const clientIdentifier = idx;
        const groupSize = clientGroupSizes[idx % clientGroupSizes.length];
        const mealDuration = diningDurations[idx % diningDurations.length];
        const scheduledArrivalMoment = idx * groupArrivalInterval;
        return {
            refId: clientIdentifier,
            occupancy: groupSize,
            consumptionPeriod: mealDuration,
            scheduledArrival: scheduledArrivalMoment
        };
    });

    const locateVacantSpan = (requiredSize) => {
        let currentFreeCount = 0;
        let potentialStart = -1;

        for (let idx = 0; idx < establishmentCapacity; idx++) {
            if (seatingLayout[idx] <= clockTick) {
                if (currentFreeCount === 0) {
                    potentialStart = idx;
                }
                currentFreeCount++;
                if (currentFreeCount === requiredSize) {
                    return potentialStart;
                }
            } else {
                currentFreeCount = 0;
                potentialStart = -1;
            }
        }
        return -1;
    };

    while (seatedClientCounter < totalClientGroups) {
        while (nextScheduledGroupIndex < totalClientGroups &&
               allClientGroups[nextScheduledGroupIndex].scheduledArrival <= clockTick) {
            inboundClientQueue.push(allClientGroups[nextScheduledGroupIndex]);
            nextScheduledGroupIndex++;
        }

        let groupSeatedThisCycle = true;
        while (groupSeatedThisCycle && inboundClientQueue.length > 0) {
            groupSeatedThisCycle = false;
            let groupToSeatIndex = -1;

            for (let i = 0; i < inboundClientQueue.length; i++) {
                const currentClientGroup = inboundClientQueue[i];
                const startPosition = locateVacantSpan(currentClientGroup.occupancy);

                if (startPosition !== -1) {
                    groupToSeatIndex = i;
                    recordedClientDelays.set(currentClientGroup.refId, clockTick - currentClientGroup.scheduledArrival);
                    seatedClientCounter++;
                    groupSeatedThisCycle = true;

                    for (let j = 0; j < currentClientGroup.occupancy; j++) {
                        seatingLayout[startPosition + j] = clockTick + currentClientGroup.consumptionPeriod;
                    }

                    inboundClientQueue.splice(groupToSeatIndex, 1);
                    break;
                }
            }
        }

        clockTick++;
    }
    return recordedClientDelays;
}

var simulationResultMap = manageDiningEstablishment();

for (let k = 0; k < queryPayload.length - 1; k++) {
    const targetGroupRef = parseInt(queryPayload[k], 10);
    console.log(simulationResultMap.get(targetGroupRef));
}