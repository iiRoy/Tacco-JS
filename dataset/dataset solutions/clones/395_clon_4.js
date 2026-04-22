const fileSystemUtility = require('fs');
const streamInfo = fileSystemUtility.fstatSync(process.stdin.fd);
const dataPayload = new Buffer(streamInfo.size);
const bytesAcquired = fileSystemUtility.readSync(process.stdin.fd, dataPayload, 0, streamInfo.size, 0);
const incomingDataRows = dataPayload.toString('utf8', 0, bytesAcquired).split('\n');

function processEntryPoints() {
    const calculatedDelays = calculateWaitingPeriods();
    for (let currentIdx = 0; currentIdx < incomingDataRows.length - 1; currentIdx++) {
        console.log(calculatedDelays[Number(incomingDataRows[currentIdx])]);
    }
}

function calculateWaitingPeriods() {
    const stationOccupancy = Array(17).fill(0); // 0 means empty, positive value is the time seat becomes free
    const squadSizes = [2, 5, 2, 2, 2];
    const mealDurations = [19, 39, 25, 36, 22, 42];

    const partyInformation = [];
    for (let k = 0; k < 100; k++) {
        partyInformation.push({
            identifier: k,
            membersNeeded: squadSizes[k % squadSizes.length],
            eatingDuration: mealDurations[k % mealDurations.length],
            arrivalMoment: k * 5,
            hasBeenSeated: false,
            waitingTime: 0
        });
    }

    const eventSchedule = []; // { moment: T, kind: 'arrival' | 'departure', targetPartyId?: P, seatStartIdx?: S, seatEndIdx?: E }
    for (let k = 0; k < 100; k++) {
        eventSchedule.push({
            moment: partyInformation[k].arrivalMoment,
            kind: 'arrival',
            targetPartyId: k
        });
    }

    let currentSystemTime = 0;
    let unseatedPartyCount = 100;
    const pendingSeatingQueue = [];
    const finalDelayResults = Array(100).fill(0);

    const sortEventsByTime = () => {
        eventSchedule.sort((e1, e2) => e1.moment - e2.moment);
    };
    sortEventsByTime();

    while (unseatedPartyCount > 0) {
        if (eventSchedule.length === 0) {
            break;
        }

        const nextEvent = eventSchedule.shift();
        currentSystemTime = Math.max(currentSystemTime, nextEvent.moment);

        if (nextEvent.kind === 'arrival') {
            pendingSeatingQueue.push(nextEvent.targetPartyId);
        } else if (nextEvent.kind === 'departure') {
            for (let s = nextEvent.seatStartIdx; s <= nextEvent.seatEndIdx; s++) {
                stationOccupancy[s] = 0; // Mark seats as truly empty
            }
        }

        let partySeatedThisIteration = true;
        while (partySeatedThisIteration && pendingSeatingQueue.length > 0) {
            partySeatedThisIteration = false;

            for (let qIdx = 0; qIdx < pendingSeatingQueue.length; qIdx++) {
                const currentPartyId = pendingSeatingQueue[qIdx];
                if (partyInformation[currentPartyId].hasBeenSeated) {
                    pendingSeatingQueue.splice(qIdx, 1);
                    qIdx--;
                    continue;
                }

                const requiredConsecutiveSpots = partyInformation[currentPartyId].membersNeeded;
                let availableConsecutiveSpots = 0;
                let startingPosition = -1;

                for (let seatIdx = 0; seatIdx < stationOccupancy.length; seatIdx++) {
                    if (stationOccupancy[seatIdx] <= currentSystemTime) { // Seat is available now
                        availableConsecutiveSpots++;
                    } else {
                        availableConsecutiveSpots = 0;
                    }

                    if (availableConsecutiveSpots === requiredConsecutiveSpots) {
                        startingPosition = seatIdx - (requiredConsecutiveSpots - 1);
                        break;
                    }
                }

                if (startingPosition !== -1) {
                    partyInformation[currentPartyId].hasBeenSeated = true;
                    partyInformation[currentPartyId].waitingTime = currentSystemTime - partyInformation[currentPartyId].arrivalMoment;
                    finalDelayResults[currentPartyId] = partyInformation[currentPartyId].waitingTime;
                    unseatedPartyCount--;

                    const departureMoment = currentSystemTime + partyInformation[currentPartyId].eatingDuration;
                    eventSchedule.push({
                        moment: departureMoment,
                        kind: 'departure',
                        seatStartIdx: startingPosition,
                        seatEndIdx: startingPosition + requiredConsecutiveSpots - 1
                    });

                    for (let s = startingPosition; s < startingPosition + requiredConsecutiveSpots; s++) {
                        stationOccupancy[s] = departureMoment; // Mark seats as occupied until this future time
                    }

                    pendingSeatingQueue.splice(qIdx, 1);
                    qIdx--;
                    partySeatedThisIteration = true;

                    if (unseatedPartyCount === 0) {
                        break;
                    }
                }
            }
            sortEventsByTime();
        }
    }
    return finalDelayResults;
}

processEntryPoints();