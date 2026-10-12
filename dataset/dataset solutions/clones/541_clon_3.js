const fs = require('fs');

function receiveDroneSignals() {
    const transmission = fs
        .readFileSync(0, 'utf8')
        .trim()
        .split(/\s+/)
        .map(Number);

    const expectedSignals = transmission.shift();

    return transmission.slice(0, expectedSignals);
}

function countBroadcasts(droneSignals) {
    const frequencyTable = new Map();

    droneSignals.forEach((frequency) => {
        if (!frequencyTable.has(frequency)) {
            frequencyTable.set(frequency, 0);
        }

        const previousVotes = frequencyTable.get(frequency);

        frequencyTable.set(
            frequency,
            previousVotes + 1
        );
    });

    return frequencyTable;
}

function findAbsoluteMajority(frequencyTable, totalVotes) {
    const minimumVotes = Math.floor(totalVotes / 2) + 1;

    for (const [frequency, votes] of frequencyTable.entries()) {
        if (votes >= minimumVotes) {
            return frequency;
        }
    }

    return undefined;
}

const receivedSignals = receiveDroneSignals();
const signalCounts = countBroadcasts(receivedSignals);

const electedFrequency = findAbsoluteMajority(
    signalCounts,
    receivedSignals.length
);

if (electedFrequency === undefined) {
    process.stdout.write('SIN FRECUENCIA DOMINANTE\n');
} else {
    process.stdout.write(`${electedFrequency}\n`);
}