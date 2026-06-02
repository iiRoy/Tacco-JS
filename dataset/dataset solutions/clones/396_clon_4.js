var fs = require('fs');
var inputData = fs.readFileSync(process.stdin.fd, 'utf8').split('\n');

function runRestaurantSimulation() {
    const partyGroupSizes = Object.freeze([2, 5, 2, 2, 2]);
    const groupMealDurations = Object.freeze([19, 39, 25, 36, 22, 42]);

    let simulationState = {
        seatOccupancyTimes: Array(17).fill(0),
        currentIncomingPartyId: -1,
        simulationClock: 0,
        partyArrivalWaitTimes: Array(100).fill(0),
        remainingPartiesToSeat: 100
    };

    while (simulationState.remainingPartiesToSeat > 0) {
        simulationState = processOneMinute(simulationState, partyGroupSizes, groupMealDurations);
    }

    for (let k = 0; k < (inputData.length - 1); k++) {
        console.log(simulationState.partyArrivalWaitTimes[parseInt(inputData[k], 10)]);
    }
}

function processOneMinute(currentState, groupSizes, mealDurations) {
    let { seatOccupancyTimes, currentIncomingPartyId, simulationClock, partyArrivalWaitTimes, remainingPartiesToSeat } = currentState;

    const updatedSeatOccupancy = seatOccupancyTimes.map(occupancyTime => Math.max(0, occupancyTime - 1));

    let nextPartyCandidateId = currentIncomingPartyId;
    if (nextPartyCandidateId === -1 && simulationClock % 5 === 0) {
        nextPartyCandidateId = simulationClock / 5;
    }

    if (nextPartyCandidateId !== -1) {
        const requiredSeatCount = groupSizes[nextPartyCandidateId % 5];
        const seatingResult = findAvailableContiguousSeats(updatedSeatOccupancy, requiredSeatCount);

        if (seatingResult.found) {
            const startingSeatIndex = seatingResult.startIndex;

            partyArrivalWaitTimes[nextPartyCandidateId] = simulationClock - (nextPartyCandidateId * 5);

            for (let s = 0; s < requiredSeatCount; s++) {
                updatedSeatOccupancy[startingSeatIndex + s] = mealDurations[nextPartyCandidateId % 6];
            }

            remainingPartiesToSeat--;

            if (remainingPartiesToSeat === 0) {
                return {
                    seatOccupancyTimes: updatedSeatOccupancy,
                    currentIncomingPartyId: nextPartyCandidateId,
                    simulationClock: simulationClock + 1,
                    partyArrivalWaitTimes: partyArrivalWaitTimes,
                    remainingPartiesToSeat: 0
                };
            }

            if (((nextPartyCandidateId + 1) * 5) <= simulationClock) {
                nextPartyCandidateId++;
            } else {
                nextPartyCandidateId = -1;
            }
        }
    }

    return {
        seatOccupancyTimes: updatedSeatOccupancy,
        currentIncomingPartyId: nextPartyCandidateId,
        simulationClock: simulationClock + 1,
        partyArrivalWaitTimes: partyArrivalWaitTimes,
        remainingPartiesToSeat: remainingPartiesToSeat
    };
}

function findAvailableContiguousSeats(currentSeatStatus, neededSeats) {
    let currentEmptyRun = 0;
    let potentialStartIndex = -1;

    const foundBlock = currentSeatStatus.some((seatTime, index) => {
        if (seatTime === 0) {
            currentEmptyRun++;
            if (currentEmptyRun === neededSeats) {
                potentialStartIndex = index - (neededSeats - 1);
                return true;
            }
        } else {
            currentEmptyRun = 0;
        }
        return false;
    });

    return { found: foundBlock, startIndex: potentialStartIndex };
}

runRestaurantSimulation();
