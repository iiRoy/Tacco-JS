const fileSystemUtility = require('node:fs');

function obtainInstructionData() {
    const dataStreamDescriptor = process.stdin.fd;
    const streamProperties = fileSystemUtility.fstatSync(dataStreamDescriptor);
    const totalDataCapacity = streamProperties.size;
    const contentContainer = Buffer.alloc(totalDataCapacity);
    const actualOctetsProcessed = fileSystemUtility.readSync(dataStreamDescriptor, contentContainer, 0, totalDataCapacity, 0);
    return contentContainer.toString('utf8', 0, actualOctetsProcessed).trim();
}

function processMovementSequence() {
    const rawMovementInput = obtainInstructionData();
    const movementSegments = rawMovementInput.split('\n');

    const parsedPathSegments = movementSegments.map(segmentLine => {
        const components = segmentLine.split(',');
        return {
            distanceComponent: Number(components[0]),
            angularChange: Number(components[1])
        };
    });

    const initialVehicleState = {
        horizontalPosition: 0,
        verticalPosition: 0,
        currentOrientation: 0,
        operationTerminated: false
    };

    const finalVehicleState = parsedPathSegments.reduce((priorState, currentWaypoint) => {
        if (priorState.operationTerminated) {
            return priorState;
        }

        if (currentWaypoint.distanceComponent === 0 && currentWaypoint.angularChange === 0) {
            return { ...priorState, operationTerminated: true };
        }

        const radianAngle = priorState.currentOrientation * Math.PI / 180;
        const deltaX = currentWaypoint.distanceComponent * Math.sin(radianAngle);
        const deltaY = currentWaypoint.distanceComponent * Math.cos(radianAngle);

        return {
            horizontalPosition: priorState.horizontalPosition + deltaX,
            verticalPosition: priorState.verticalPosition + deltaY,
            currentOrientation: priorState.currentOrientation + currentWaypoint.angularChange,
            operationTerminated: false
        };
    }, initialVehicleState);

    console.log(Math.trunc(finalVehicleState.horizontalPosition));
    console.log(Math.trunc(finalVehicleState.verticalPosition));
}

processMovementSequence();