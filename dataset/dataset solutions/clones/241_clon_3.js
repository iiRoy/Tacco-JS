const fs = require('fs');

function readMissionData() {
    const tokens = fs
        .readFileSync(0, 'utf8')
        .trim()
        .split(/\s+/)
        .map(Number);

    return {
        target: tokens.shift(),
        signals: tokens,
    };
}

function searchPartner(signals, start, requiredValue) {
    let cursor = start;

    while (cursor < signals.length) {
        if (signals[cursor] === requiredValue) {
            return cursor;
        }

        cursor++;
    }

    return -1;
}

function locateSignalPair(signals, target) {
    for (let i = 0; i < signals.length; i++) {
        const missingEnergy = target - signals[i];
        const partnerIndex = searchPartner(
            signals,
            i + 1,
            missingEnergy
        );

        if (partnerIndex !== -1) {
            return [i + 1, partnerIndex + 1];
        }
    }

    return null;
}

const mission = readMissionData();
const coordinates = locateSignalPair(
    mission.signals,
    mission.target
);

if (coordinates === null) {
    console.log('SIN COINCIDENCIA');
} else {
    console.log(`${coordinates[0]} ${coordinates[1]}`);
}