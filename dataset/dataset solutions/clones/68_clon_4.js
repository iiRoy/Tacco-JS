const RADIAN_CONVERSION_FACTOR = Math.PI / 180.0;
const FILE_SYSTEM_MODULE = require("fs");
const RAW_INPUT_STRING = FILE_SYSTEM_MODULE.readFileSync("/dev/stdin", "utf8");

const ACCUMULATOR_STATE = {
    displacementX: 0.0,
    displacementY: 0.0,
    currentBearingDegrees: 0.0
};

const RESULTANT_VECTOR = RAW_INPUT_STRING.trim().split('\n').reduce((previousState, currentEntry) => {
    const entryComponents = currentEntry.split(',');
    const radialDistance = parseFloat(entryComponents[0]);
    const angularShift = parseFloat(entryComponents[1]);

    if (radialDistance && angularShift) {
        const currentBearingRadians = previousState.currentBearingDegrees * RADIAN_CONVERSION_FACTOR;
        previousState.displacementX += radialDistance * Math.sin(currentBearingRadians);
        previousState.displacementY += radialDistance * Math.cos(currentBearingRadians);
        previousState.currentBearingDegrees += angularShift;
    }
    return previousState;
}, ACCUMULATOR_STATE);

process.stdout.write(Math.trunc(RESULTANT_VECTOR.displacementX) + '\n');
process.stdout.write(Math.trunc(RESULTANT_VECTOR.displacementY) + '\n');