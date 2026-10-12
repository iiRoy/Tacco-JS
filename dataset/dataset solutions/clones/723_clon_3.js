const fs = require('fs');

function readEnergyLog() {
    const input = fs
        .readFileSync(0, 'utf8')
        .trim()
        .split(/\s+/)
        .map(Number);

    const totalMeasurements = input.shift();
    const requiredEnergy = input.shift();

    return {
        requiredEnergy,
        measurements: input.slice(0, totalMeasurements),
    };
}

function pulseStartsAt(measurements, origin, requiredEnergy) {
    let energy = 0;
    let position = origin;

    while (position < measurements.length) {
        energy += measurements[position];

        if (energy === requiredEnergy) {
            return true;
        }

        position++;
    }

    return false;
}

function locatePortalPulse(measurements, requiredEnergy) {
    let startingPosition = 0;

    while (startingPosition < measurements.length) {
        if (
            pulseStartsAt(
                measurements,
                startingPosition,
                requiredEnergy
            )
        ) {
            return startingPosition;
        }

        startingPosition++;
    }

    return -1;
}

const energyLog = readEnergyLog();

const pulseBeginning = locatePortalPulse(
    energyLog.measurements,
    energyLog.requiredEnergy
);

process.stdout.write(
    pulseBeginning !== -1
        ? 'PULSO ENCONTRADO\n'
        : 'PULSO INEXISTENTE\n'
);