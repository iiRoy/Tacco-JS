const { readFileSync } = require('fs');

(function initiateSimulation() {
    const processedInputLines = readFileSync('/dev/stdin', 'utf8').trim().split('\n');

    const calculatedGroupWaitDurations = determineGroupServiceTimes();

    for (let inputLineIndex = 0; inputLineIndex < processedInputLines.length; inputLineIndex++) {
        const targetGroupIdentifier = Number.parseInt(processedInputLines[inputLineIndex], 10);
        if (!Number.isNaN(targetGroupIdentifier)) {
            console.log(calculatedGroupWaitDurations[targetGroupIdentifier]);
        }
    }
})();

function determineGroupServiceTimes() {
    const seatingAvailability = new Int32Array(17).fill(0);
    const groupConfigurationSizes = new Int32Array([2, 5, 2, 2, 2]);
    const mealDurationOptions = new Int32Array([19, 39, 25, 36, 22, 42]);
    const groupArrivalWaitTimes = new Int32Array(100);

    let currentMomentInSimulation = 0;
    let nextGroupToEnterIdentifier = 0;
    let groupsPendingSeating = [];
    let totalGroupsSuccessfullySeated = 0;

    while (totalGroupsSuccessfullySeated < 100) {
        while (nextGroupToEnterIdentifier < 100 && currentMomentInSimulation >= nextGroupToEnterIdentifier * 5) {
            groupsPendingSeating.push({
                id: nextGroupToEnterIdentifier,
                arrival: nextGroupToEnterIdentifier * 5
            });
            nextGroupToEnterIdentifier++;
        }

        let seatingOpportunityFound = true;
        while (seatingOpportunityFound && groupsPendingSeating.length > 0) {
            seatingOpportunityFound = false;

            let groupIndexToSeat = -1;
            let startingSeatPosition = -1;
            let requiredSeatCount = -1;
            let assignedMealDuration = -1;

            for (let queuePosition = 0; queuePosition < groupsPendingSeating.length; queuePosition++) {
                const currentGroupInQueue = groupsPendingSeating[queuePosition];
                const groupMembersNeeded = groupConfigurationSizes[currentGroupInQueue.id % 5];
                let consecutiveFreeSeatsCount = 0;
                let potentialBlockStart = -1;

                for (let seatIndex = 0; seatIndex < 17; seatIndex++) {
                    if (seatingAvailability[seatIndex] <= currentMomentInSimulation) {
                        consecutiveFreeSeatsCount++;
                        if (consecutiveFreeSeatsCount === groupMembersNeeded) {
                            potentialBlockStart = seatIndex - (groupMembersNeeded - 1);
                            break;
                        }
                    } else {
                        consecutiveFreeSeatsCount = 0;
                    }
                }

                if (potentialBlockStart !== -1) {
                    groupIndexToSeat = queuePosition;
                    startingSeatPosition = potentialBlockStart;
                    requiredSeatCount = groupMembersNeeded;
                    assignedMealDuration = mealDurationOptions[currentGroupInQueue.id % 6];
                    seatingOpportunityFound = true;
                    break;
                }
            }

            if (groupIndexToSeat !== -1) {
                const seatedGroup = groupsPendingSeating[groupIndexToSeat];
                groupArrivalWaitTimes[seatedGroup.id] = currentMomentInSimulation - seatedGroup.arrival;

                for (let seatFillIndex = 0; seatFillIndex < requiredSeatCount; seatFillIndex++) {
                    seatingAvailability[startingSeatPosition + seatFillIndex] = currentMomentInSimulation + assignedMealDuration;
                }

                groupsPendingSeating.splice(groupIndexToSeat, 1);
                totalGroupsSuccessfullySeated++;

                if (totalGroupsSuccessfullySeated === 100) {
                    return groupArrivalWaitTimes;
                }
            }
        }

        let nextSignificantTimePoint = Infinity;

        if (nextGroupToEnterIdentifier < 100) {
            nextSignificantTimePoint = Math.min(nextSignificantTimePoint, nextGroupToEnterIdentifier * 5);
        }

        for (let seatCheckIndex = 0; seatCheckIndex < 17; seatCheckIndex++) {
            if (seatingAvailability[seatCheckIndex] > currentMomentInSimulation) {
                nextSignificantTimePoint = Math.min(nextSignificantTimePoint, seatingAvailability[seatCheckIndex]);
            }
        }

        if (groupsPendingSeating.length > 0 || seatingOpportunityFound) {
            currentMomentInSimulation++;
        } else if (nextSignificantTimePoint !== Infinity) {
            currentMomentInSimulation = Math.max(currentMomentInSimulation + 1, nextSignificantTimePoint);
        } else {
            currentMomentInSimulation++;
        }
    }
    return groupArrivalWaitTimes;
}
