const fileSys = require('fs');

const rawInputContent = fileSys.readFileSync('/dev/stdin', 'utf8');
const lineSegments = rawInputContent.trim().split('\n');

function processMovement() {
    const initialPositionState = {
        horizontalPos: 0,
        verticalPos: 0,
        cumulativeRotation: 0,
        terminatedSequence: false
    };

    const finalPositionState = lineSegments.reduce((currentAccumulator, currentLineData) => {
        if (currentAccumulator.terminatedSequence) {
            return currentAccumulator;
        }

        const segmentComponents = currentLineData.split(',');
        const distanceMagnitude = Number(segmentComponents[0]);
        const angularIncrement = Number(segmentComponents[1]);

        if (distanceMagnitude === 0 && angularIncrement === 0) {
            return { ...currentAccumulator,
                terminatedSequence: true
            };
        }

        const currentAngleInRadians = currentAccumulator.cumulativeRotation * Math.PI / 180;

        const nextHorizontalPos = currentAccumulator.horizontalPos + distanceMagnitude * Math.sin(currentAngleInRadians);
        const nextVerticalPos = currentAccumulator.verticalPos + distanceMagnitude * Math.cos(currentAngleInRadians);
        const nextCumulativeRotation = currentAccumulator.cumulativeRotation + angularIncrement;

        return {
            horizontalPos: nextHorizontalPos,
            verticalPos: nextVerticalPos,
            cumulativeRotation: nextCumulativeRotation,
            terminatedSequence: false
        };
    }, initialPositionState);

    console.log(~~finalPositionState.horizontalPos);
    console.log(~~finalPositionState.verticalPos);
}

processMovement();
