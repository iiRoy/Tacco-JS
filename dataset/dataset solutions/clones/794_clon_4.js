const fs = require('fs');

const transmission = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const totalIncantations = transmission.shift();
const totalRelations = transmission.shift();

const dependents = Array.from(
    { length: totalIncantations + 1 },
    () => []
);

const pendingRequirements =
    new Array(totalIncantations + 1).fill(0);

for (
    let relation = 0;
    relation < totalRelations;
    relation++
) {
    const incantation = transmission.shift();
    const prerequisite = transmission.shift();

    dependents[prerequisite].push(incantation);
    pendingRequirements[incantation]++;
}

const availableIncantations = [];

for (
    let incantation = 1;
    incantation <= totalIncantations;
    incantation++
) {
    if (pendingRequirements[incantation] === 0) {
        availableIncantations.push(incantation);
    }
}

let queuePosition = 0;
let resolvedCount = 0;

while (queuePosition < availableIncantations.length) {
    const resolvedSpell =
        availableIncantations[queuePosition++];

    resolvedCount++;

    for (
        const dependentSpell of dependents[resolvedSpell]
    ) {
        pendingRequirements[dependentSpell]--;

        if (pendingRequirements[dependentSpell] === 0) {
            availableIncantations.push(dependentSpell);
        }
    }
}

const paradoxExists =
    resolvedCount !== totalIncantations;

if (paradoxExists) {
    console.log('PARADOJA DETECTADA');
} else {
    console.log('SISTEMA ARCANO ESTABLE');
}