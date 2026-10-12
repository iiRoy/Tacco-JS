var fileSystem = require('fs');
var inputDataBuffer = fileSystem.readFileSync(process.stdin.fd);
var inputDataLines = inputDataBuffer.toString('utf8').split('\n');

executePrimaryLogic();

function executePrimaryLogic(){
  var finalWaitDurations = computeSeatingTimes();
  for(var queryIndex = 0, queryCount = inputDataLines.length - 1; queryIndex < queryCount; queryIndex++){
    console.log(finalWaitDurations[parseInt(inputDataLines[queryIndex], 10)]);
  }
}

function computeSeatingTimes(){
    const groupSizeConfiguration = [2, 5, 2, 2, 2];
    const mealDurationConfiguration = [19, 39, 25, 36, 22, 42];
    const totalRestaurantSeats = 17;
    const targetGroupCount = 100;

    // Array indicating the minute each seat becomes available.
    // Initialized to 0, meaning all seats are free at minute 0.
    const seatAvailabilityTimestamps = Array(totalRestaurantSeats).fill(0);

    // Array to store the calculated wait time for each group.
    const groupArrivalDelay = Array(targetGroupCount).fill(0);

    let currentSimulationClock = 0;
    let activeGroupCandidate = -1; // Represents the group currently trying to get seated (similar to original's headGroup)
    let groupsProcessedCount = 0;

    while (groupsProcessedCount < targetGroupCount) {
        // Phase 1: Determine if a new group becomes the active candidate
        // A group becomes active if no group is currently active, and it's an arrival minute for a new group.
        if (activeGroupCandidate === -1 && currentSimulationClock % 5 === 0 && (currentSimulationClock / 5) < targetGroupCount) {
            activeGroupCandidate = currentSimulationClock / 5;
        }

        // Phase 2: Attempt to seat the active group candidate
        let groupSeatedInThisCycle = false;
        if (activeGroupCandidate !== -1) {
            const requiredSeatQuantity = groupSizeConfiguration[activeGroupCandidate % groupSizeConfiguration.length];
            let foundStartingSeatIndex = -1;
            let consecutiveFreeSeats = 0;

            for (let seatIterator = 0; seatIterator < totalRestaurantSeats; seatIterator++) {
                if (seatAvailabilityTimestamps[seatIterator] <= currentSimulationClock) { // Seat is free at or before current time
                    consecutiveFreeSeats++;
                    if (consecutiveFreeSeats === requiredSeatQuantity) {
                        foundStartingSeatIndex = seatIterator - (requiredSeatQuantity - 1);
                        break;
                    }
                } else { // Seat is occupied
                    consecutiveFreeSeats = 0;
                }
            }

            if (foundStartingSeatIndex !== -1) {
                // Seat the group
                groupArrivalDelay[activeGroupCandidate] = currentSimulationClock - (activeGroupCandidate * 5);
                const currentMealDuration = mealDurationConfiguration[activeGroupCandidate % mealDurationConfiguration.length];

                for (let seatOccupier = foundStartingSeatIndex; seatOccupier < (requiredSeatQuantity + foundStartingSeatIndex); seatOccupier++) {
                    seatAvailabilityTimestamps[seatOccupier] = currentSimulationClock + currentMealDuration;
                }

                groupsProcessedCount++;
                groupSeatedInThisCycle = true;

                // Update activeGroupCandidate based on original logic:
                // Try to advance to the next group if its arrival time has passed.
                const potentialNextGroup = activeGroupCandidate + 1;
                if ((potentialNextGroup * 5) <= currentSimulationClock && potentialNextGroup < targetGroupCount) {
                    activeGroupCandidate = potentialNextGroup;
                } else {
                    activeGroupCandidate = -1;
                }

                if (groupsProcessedCount === targetGroupCount) {
                    return groupArrivalDelay;
                }
                // If a group was seated, immediately re-evaluate at the *same minute*
                // to try seating the next eligible group. This mimics the original's inner while loop.
                continue;
            }
        }

        // Phase 3: If no group was seated in this cycle, or no group was active, advance time.
        if (!groupSeatedInThisCycle) {
            let nextSignificantMoment = Infinity;

            // Calculate time for the next group arrival (if activeGroupCandidate is -1)
            // The next group to potentially become active is `(Math.floor(currentSimulationClock / 5) + 1)`.
            const nextPotentialGroupIndex = (Math.floor(currentSimulationClock / 5) + 1);
            if (nextPotentialGroupIndex < targetGroupCount) {
                const arrivalTimeForNextPotentialGroup = nextPotentialGroupIndex * 5;
                nextSignificantMoment = Math.min(nextSignificantMoment, arrivalTimeForNextPotentialGroup);
            }

            // Calculate earliest seat release time
            const earliestSeatRelease = Math.min(...seatAvailabilityTimestamps.filter(ts => ts > currentSimulationClock));
            if (earliestSeatRelease !== Infinity) {
                nextSignificantMoment = Math.min(nextSignificantMoment, earliestSeatRelease);
            }

            if (nextSignificantMoment === Infinity) {
                // This implies no more events and not all groups seated, which shouldn't happen given problem constraints.
                break;
            }
            currentSimulationClock = nextSignificantMoment;
        }
    }
    return groupArrivalDelay;
}
