const fs = require('fs');

function loadMeteorReadings() {
    const readings = fs
        .readFileSync(0, 'utf8')
        .trim()
        .split(/\s+/)
        .map(Number);

    const declaredMeteors = readings.shift();

    return readings.slice(0, declaredMeteors);
}

function findBrighterMeteor(readings, origin) {
    const currentBrightness = readings[origin];

    let candidatePosition = origin + 1;

    while (candidatePosition < readings.length) {
        const candidateBrightness =
            readings[candidatePosition];

        if (candidateBrightness > currentBrightness) {
            return candidateBrightness;
        }

        candidatePosition++;
    }

    return -1;
}

const meteorReadings = loadMeteorReadings();

const brightnessReport = meteorReadings.map(
    (_, meteorPosition) => {
        return findBrighterMeteor(
            meteorReadings,
            meteorPosition
        );
    }
);

process.stdout.write(`${brightnessReport.join(' ')}\n`);