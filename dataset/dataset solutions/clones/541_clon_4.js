const fs = require('fs');

const packet = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const declaredSize = packet.shift();
const swarmMessages = packet.slice(0, declaredSize);

let candidateFrequency = 0;
let signalBalance = 0;

for (const receivedFrequency of swarmMessages) {
    if (signalBalance === 0) {
        candidateFrequency = receivedFrequency;
        signalBalance = 1;
    } else if (receivedFrequency === candidateFrequency) {
        signalBalance++;
    } else {
        signalBalance--;
    }
}

let candidateOccurrences = 0;

for (const receivedFrequency of swarmMessages) {
    if (receivedFrequency === candidateFrequency) {
        candidateOccurrences++;
    }
}

const hasDominantFrequency =
    candidateOccurrences > swarmMessages.length / 2;

process.stdout.write(
    hasDominantFrequency
        ? `${candidateFrequency}\n`
        : 'SIN FRECUENCIA DOMINANTE\n'
);