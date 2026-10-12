const fileSystem = require('fs');

const numericTransmission = fileSystem
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const droneAmount = numericTransmission[0];
const broadcastCodes = numericTransmission.slice(
    1,
    droneAmount + 1
);

const voteRegistry = new Map();
let swarmFrequency = null;

for (const broadcastCode of broadcastCodes) {
    const accumulatedVotes =
        (voteRegistry.get(broadcastCode) || 0) + 1;

    voteRegistry.set(broadcastCode, accumulatedVotes);

    if (accumulatedVotes > droneAmount / 2) {
        swarmFrequency = broadcastCode;
        break;
    }
}

console.log(
    swarmFrequency === null
        ? 'SIN FRECUENCIA DOMINANTE'
        : swarmFrequency
);