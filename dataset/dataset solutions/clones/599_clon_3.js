const fs = require('fs');

function loadChronologicalReadings() {
    const numbers = fs
        .readFileSync(0, 'utf8')
        .trim()
        .split(/\s+/)
        .map(Number);

    return {
        readings: numbers.slice(2, numbers[0] + 2),
        permittedGap: numbers[1],
    };
}

function signalAppearsAgain(readings, origin, limit) {
    const finalPosition = Math.min(
        readings.length - 1,
        origin + limit
    );

    let comparison = origin + 1;

    while (comparison <= finalPosition) {
        if (readings[origin] === readings[comparison]) {
            return true;
        }

        comparison++;
    }

    return false;
}

function containsChronologicalEcho(readings, permittedGap) {
    let currentPosition = 0;

    while (currentPosition < readings.length) {
        const repeatedSignal = signalAppearsAgain(
            readings,
            currentPosition,
            permittedGap
        );

        if (repeatedSignal) {
            return true;
        }

        currentPosition++;
    }

    return false;
}

const timeline = loadChronologicalReadings();

const result = containsChronologicalEcho(
    timeline.readings,
    timeline.permittedGap
);

process.stdout.write(
    result
        ? 'ECO TEMPORAL\n'
        : 'LÍNEA TEMPORAL ESTABLE\n'
);