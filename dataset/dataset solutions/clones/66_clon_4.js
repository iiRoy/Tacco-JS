const RADIAN_CONVERSION_FACTOR = Math.PI / 180;

function evaluatePathSegment(inputBuffer) {
    let currentXCoordinate = 0;
    let currentYCoordinate = 0;
    let currentBearingAngle = 0;

    const textPayload = String(inputBuffer).trim();
    const instructionSet = textPayload.split('\n');

    const finalWaypoint = instructionSet.filter(Boolean).reduce((accumulator, directiveLine) => {
        const components = directiveLine.split(',');
        if (components.length !== 2) {
            return accumulator;
        }

        const travelMagnitude = parseFloat(components[0]);
        const angularAdjustment = parseFloat(components[1]);

        const currentBearingInRadians = accumulator.currentBearingAngle * RADIAN_CONVERSION_FACTOR;

        const displacementX = travelMagnitude * Math.sin(currentBearingInRadians);
        const displacementY = travelMagnitude * Math.cos(currentBearingInRadians);

        return {
            currentXCoordinate: accumulator.currentXCoordinate + displacementX,
            currentYCoordinate: accumulator.currentYCoordinate + displacementY,
            currentBearingAngle: accumulator.currentBearingAngle + angularAdjustment
        };
    }, {
        currentXCoordinate: 0,
        currentYCoordinate: 0,
        currentBearingAngle: 0
    });

    console.log(Math.trunc(finalWaypoint.currentXCoordinate));
    console.log(Math.trunc(finalWaypoint.currentYCoordinate));
}

process.stdin.on('data', evaluatePathSegment);
process.stdin.resume();