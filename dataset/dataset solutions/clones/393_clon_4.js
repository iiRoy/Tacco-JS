const ALLOCATED_SPACE_COUNT = 17;
const GUEST_PARTY_CONFIGURATIONS = [2, 5, 2, 2, 2];
const CONSUMPTION_DURATIONS = [19, 39, 25, 36, 22, 42];
const ARRIVAL_WINDOW_MINUTES = 5;
const REQUIRED_DELAY_RECORDS = 100;

function computeServiceDelays() {
    const initialSpaceOccupancy = Array.from({ length: ALLOCATED_SPACE_COUNT }, () => 0);
    const initialRecordedWaitDurations = new Map();

    function advanceSimulation(currentElapsedMoment, currentSpaceOccupancy, leadingPartyIndex, accumulatedWaitDurations) {
        if (accumulatedWaitDurations.size >= REQUIRED_DELAY_RECORDS) {
            return accumulatedWaitDurations;
        }

        const nextSpaceOccupancy = currentSpaceOccupancy.map(durationRemaining =>
            durationRemaining > 0 ? durationRemaining - 1 : 0
        );

        let currentLeadingParty = leadingPartyIndex;
        if (leadingPartyIndex === null && currentElapsedMoment % ARRIVAL_WINDOW_MINUTES === 0) {
            currentLeadingParty = currentElapsedMoment / ARRIVAL_WINDOW_MINUTES;
        }

        let spaceOccupancyAfterSeatingAttempts = nextSpaceOccupancy;
        let waitDurationsAfterSeatingAttempts = new Map(accumulatedWaitDurations);
        let partyCurrentlyAttemptingToSeat = currentLeadingParty;

        while (partyCurrentlyAttemptingToSeat !== null) {
            const currentPartyIdentifier = partyCurrentlyAttemptingToSeat;
            const partySize = GUEST_PARTY_CONFIGURATIONS[currentPartyIdentifier % GUEST_PARTY_CONFIGURATIONS.length];
            const partyConsumptionTime = CONSUMPTION_DURATIONS[currentPartyIdentifier % CONSUMPTION_DURATIONS.length];

            const locateAndFillSpaces = (currentChairs, requiredSize, fillValue) => {
                let consecutiveEmptySpaces = 0;
                let startingPosition = -1;
                for (let i = 0; i < currentChairs.length; i++) {
                    if (currentChairs[i] === 0) {
                        consecutiveEmptySpaces++;
                    } else {
                        consecutiveEmptySpaces = 0;
                    }
                    if (consecutiveEmptySpaces === requiredSize) {
                        startingPosition = i - (requiredSize - 1);
                        break;
                    }
                }

                if (startingPosition !== -1) {
                    const updatedChairs = [...currentChairs];
                    for (let i = startingPosition; i < startingPosition + requiredSize; i++) {
                        updatedChairs[i] = fillValue;
                    }
                    return updatedChairs;
                }
                return null;
            };

            const seatingResult = locateAndFillSpaces(spaceOccupancyAfterSeatingAttempts, partySize, partyConsumptionTime);

            if (seatingResult !== null) {
                spaceOccupancyAfterSeatingAttempts = seatingResult;
                const partyArrivalMoment = currentPartyIdentifier * ARRIVAL_WINDOW_MINUTES;
                waitDurationsAfterSeatingAttempts.set(currentPartyIdentifier, currentElapsedMoment - partyArrivalMoment);

                const potentialNextPartyIdentifier = currentPartyIdentifier + 1;
                if ((potentialNextPartyIdentifier * ARRIVAL_WINDOW_MINUTES) <= currentElapsedMoment) {
                    partyCurrentlyAttemptingToSeat = potentialNextPartyIdentifier;
                } else {
                    partyCurrentlyAttemptingToSeat = null;
                }
            } else {
                partyCurrentlyAttemptingToSeat = null;
            }
        }

        let nextLeadingPartyForNextMoment;
        if (currentLeadingParty === null) {
            nextLeadingPartyForNextMoment = null;
        } else {
            if (waitDurationsAfterSeatingAttempts.has(currentLeadingParty)) {
                const nextCandidateParty = currentLeadingParty + 1;
                if ((nextCandidateParty * ARRIVAL_WINDOW_MINUTES) <= currentElapsedMoment) {
                    nextLeadingPartyForNextMoment = nextCandidateParty;
                } else {
                    nextLeadingPartyForNextMoment = null;
                }
            } else {
                nextLeadingPartyForNextMoment = currentLeadingParty;
            }
        }

        return advanceSimulation(
            currentElapsedMoment + 1,
            spaceOccupancyAfterSeatingAttempts,
            nextLeadingPartyForNextMoment,
            waitDurationsAfterSeatingAttempts
        );
    }

    const finalWaitDurations = advanceSimulation(0, initialSpaceOccupancy, null, initialRecordedWaitDurations);
    return finalWaitDurations;
}

let computedServiceDelays;

function processUserInputAndOutputResults() {
    computedServiceDelays = computeServiceDelays();

    for (let i = 0; i < (userQuery.length - 1); i++) {
        const requestedIndex = parseInt(userQuery[i], 10);
        console.log(computedServiceDelays.get(requestedIndex));
    }
}

let userQuery = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    userQuery += chunk;
});
process.stdin.on('end', function() {
    userQuery = userQuery.split('\n');
    processUserInputAndOutputResults();
});