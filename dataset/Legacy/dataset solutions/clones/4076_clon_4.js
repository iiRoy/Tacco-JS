function main(inputString) {
    const journeySegments = inputString.trim().split("\n");
    // The first line contains N, which is not used in the original logic for validation.
    // We discard it by slicing from the second element.
    const movementRecords = journeySegments.slice(1).map(lineData => lineData.split(" ").map(Number));

    const finalJourneyOutcome = movementRecords.reduce((currentStatus, nextWaypoint) => {
        // If the journey is already deemed invalid, propagate the invalid status
        // without further checks for efficiency, mirroring the original's behavior.
        if (!currentStatus.isFeasible) {
            return currentStatus;
        }

        const [destinationTime, destinationX, destinationY] = nextWaypoint;

        const horizontalShift = Math.abs(destinationX - currentStatus.lastKnownX);
        const verticalShift = Math.abs(destinationY - currentStatus.lastKnownY);
        const timeElapsed = destinationTime - currentStatus.lastKnownTime;

        // Condition 1: Manhattan distance must be less than or equal to time elapsed.
        const distanceWithinReach = (horizontalShift + verticalShift <= timeElapsed);

        // Condition 2: Parity of total time must match parity of total distance.
        // This ensures that the traveler can reach the point by moving one unit per second.
        const parityCoincides = ((destinationTime % 2) === ((horizontalShift + verticalShift) % 2));

        const segmentIsValid = distanceWithinReach && parityCoincides;

        return {
            lastKnownTime: destinationTime,
            lastKnownX: destinationX,
            lastKnownY: destinationY,
            isFeasible: currentStatus.isFeasible && segmentIsValid
        };
    }, { lastKnownTime: 0, lastKnownX: 0, lastKnownY: 0, isFeasible: true });

    console.log(finalJourneyOutcome.isFeasible ? "Yes" : "No");
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
