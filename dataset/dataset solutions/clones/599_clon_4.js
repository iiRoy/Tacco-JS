const fs = require('fs');

const packet = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const totalReadings = packet.shift();
const echoRange = packet.shift();
const chronology = packet.slice(0, totalReadings);

const recentFrequencies = new Set();

let distortionExists = false;
let timelinePosition = 0;

while (timelinePosition < chronology.length) {
    const currentFrequency = chronology[timelinePosition];

    if (recentFrequencies.has(currentFrequency)) {
        distortionExists = true;
        break;
    }

    recentFrequencies.add(currentFrequency);

    if (timelinePosition >= echoRange) {
        const expiredFrequency =
            chronology[timelinePosition - echoRange];

        recentFrequencies.delete(expiredFrequency);
    }

    timelinePosition++;
}

if (distortionExists) {
    console.log('ECO TEMPORAL');
} else {
    console.log('LÍNEA TEMPORAL ESTABLE');
}