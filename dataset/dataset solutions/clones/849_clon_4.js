const fs = require('fs');

const transmission = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const observationAmount = transmission.shift();
const luminosities = transmission.slice(
    0,
    observationAmount
);

const result = new Array(observationAmount).fill(-1);
const unresolvedMeteors = [];

let position = 0;

while (position < luminosities.length) {
    const currentLuminosity = luminosities[position];

    while (
        unresolvedMeteors.length > 0 &&
        luminosities[
            unresolvedMeteors[unresolvedMeteors.length - 1]
        ] < currentLuminosity
    ) {
        const resolvedPosition = unresolvedMeteors.pop();

        result[resolvedPosition] = currentLuminosity;
    }

    unresolvedMeteors.push(position);
    position++;
}

console.log(result.join(' '));