function travelEvaluator(sourceData) {
    const rawSegments = sourceData.split('\n');
    const specificSegments = rawSegments.slice(1);

    const parsedWaypoints = specificSegments.reduce((accumulated, currentLine) => {
        if (currentLine.trim() === '') return accumulated;
        const numericParts = currentLine.split(' ').map(str => Number(str));
        if (numericParts.length === 3) {
            accumulated.push({
                moment: numericParts[0],
                coordX: numericParts[1],
                coordY: numericParts[2]
            });
        }
        return accumulated;
    }, []);

    const startingPoint = { moment: 0, coordX: 0, coordY: 0 };

    const determineFeasibility = (currentStepIndex, currentWaypoint, allWaypoints) => {
        if (currentStepIndex >= allWaypoints.length) {
            return true;
        }

        const nextWaypoint = allWaypoints[currentStepIndex];

        const elapsedSpan = nextWaypoint.moment - currentWaypoint.moment;
        const deltaX = Math.abs(nextWaypoint.coordX - currentWaypoint.coordX);
        const deltaY = Math.abs(nextWaypoint.coordY - currentWaypoint.coordY);

        if (elapsedSpan < deltaX + deltaY) {
            return false;
        }

        if ((elapsedSpan % 2) === ((deltaX + deltaY) % 2)) {
            return false;
        }

        return determineFeasibility(currentStepIndex + 1, nextWaypoint, allWaypoints);
    };

    const finalResult = determineFeasibility(0, startingPoint, parsedWaypoints);
    outputDecision(finalResult ? 'Yes' : 'No');
}

function outputDecision(decisionMessage) {
    console.log(decisionMessage);
}

const inputProvider = require('node:fs').readFileSync;
const inputSource = '/dev/stdin';
const encodingType = 'utf8';

travelEvaluator(inputProvider(inputSource, encodingType));