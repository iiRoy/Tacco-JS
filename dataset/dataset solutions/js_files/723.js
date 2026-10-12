const fs = require('fs');

const data = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const n = data[0];
const targetEnergy = data[1];
const fluctuations = data.slice(2, n + 2);

let pulseFound = false;

for (let start = 0; start < fluctuations.length; start++) {
    let accumulatedEnergy = 0;

    for (
        let end = start;
        end < fluctuations.length;
        end++
    ) {
        accumulatedEnergy += fluctuations[end];

        if (accumulatedEnergy === targetEnergy) {
            pulseFound = true;
            break;
        }
    }

    if (pulseFound) {
        break;
    }
}

console.log(
    pulseFound
        ? 'PULSO ENCONTRADO'
        : 'PULSO INEXISTENTE'
);