const fileSystem = require('fs');

const numericTransmission = fileSystem
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const transmissionCount = numericTransmission[0];
const observationWindow = numericTransmission[1];
const timelineReadings = numericTransmission.slice(
    2,
    transmissionCount + 2
);

let anomalyDetected = false;

for (
    let originPosition = 0;
    originPosition < timelineReadings.length;
    originPosition++
) {
    for (
        let comparisonPosition = originPosition + 1;
        comparisonPosition < timelineReadings.length &&
        comparisonPosition - originPosition <= observationWindow;
        comparisonPosition++
    ) {
        if (
            timelineReadings[originPosition] ===
            timelineReadings[comparisonPosition]
        ) {
            anomalyDetected = true;
            break;
        }
    }

    if (anomalyDetected) {
        break;
    }
}

console.log(
    anomalyDetected
        ? 'ECO TEMPORAL'
        : 'LÍNEA TEMPORAL ESTABLE'
);