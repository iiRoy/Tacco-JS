const fs = require('fs');

const packet = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const registeredZones = packet.shift();
const activationEnergy = packet.shift();
const magneticReadings = packet.slice(0, registeredZones);

const previousEnergyLevels = new Set([0]);

let totalEnergySoFar = 0;
let portalSignalDetected = false;

for (const magneticChange of magneticReadings) {
    totalEnergySoFar += magneticChange;

    const necessaryPreviousLevel =
        totalEnergySoFar - activationEnergy;

    if (previousEnergyLevels.has(necessaryPreviousLevel)) {
        portalSignalDetected = true;
        break;
    }

    previousEnergyLevels.add(totalEnergySoFar);
}

if (portalSignalDetected) {
    console.log('PULSO ENCONTRADO');
} else {
    console.log('PULSO INEXISTENTE');
}