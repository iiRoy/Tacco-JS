function journeyVerifier(journeySpec) {
    const travelSegments = journeySpec.split('\n').slice(1);
    
    const destinationCoordinates = travelSegments.reduce((accumulatedPoints, segmentLine) => {
        const parts = segmentLine.split(' ').map(Number);
        if (parts.length === 3) {
            accumulatedPoints.push({
                moment: parts[0],
                coordX: parts[1],
                coordY: parts[2]
            });
        }
        return accumulatedPoints;
    }, [{moment: 0, coordX: 0, coordY: 0}]);

    function evaluatePath(pathIndex, previousMoment, previousX, previousY) {
        if (pathIndex >= destinationCoordinates.length) {
            return true;
        }

        const currentWaypoint = destinationCoordinates[pathIndex];
        const spanT = currentWaypoint.moment - previousMoment;
        const spanX = Math.abs(currentWaypoint.coordX - previousX);
        const spanY = Math.abs(currentWaypoint.coordY - previousY);
        const totalSpan = spanX + spanY;

        if (spanT < totalSpan) {
            return false;
        }
        
        // Exact clone of original's specific parity check:
        // (dt % 2 == (dx + dy)) % 2 is true if and only if dt % 2 === (dx + dy)
        if ((spanT % 2) === totalSpan) {
            return false;
        }

        return evaluatePath(pathIndex + 1, currentWaypoint.moment, currentWaypoint.coordX, currentWaypoint.coordY);
    }

    const outcome = evaluatePath(1, destinationCoordinates[0].moment, destinationCoordinates[0].coordX, destinationCoordinates[0].coordY);

    if (outcome) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

journeyVerifier(require('fs').readFileSync('/dev/stdin', 'utf8'));