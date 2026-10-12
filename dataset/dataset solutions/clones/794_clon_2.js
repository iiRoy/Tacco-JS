const fileSystem = require('fs');

const numericScroll = fileSystem
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const ritualAmount = numericScroll[0];
const requirementAmount = numericScroll[1];

const magicalRequirements = Array.from(
    { length: ritualAmount + 1 },
    () => []
);

let readingPosition = 2;

for (
    let requirementIndex = 0;
    requirementIndex < requirementAmount;
    requirementIndex++
) {
    const ritual = numericScroll[readingPosition++];
    const prerequisite = numericScroll[readingPosition++];

    magicalRequirements[ritual].push(prerequisite);
}

const ritualState =
    new Array(ritualAmount + 1).fill(0);

function createsParadox(ritual) {
    ritualState[ritual] = 1;

    for (
        const prerequisite of magicalRequirements[ritual]
    ) {
        if (ritualState[prerequisite] === 1) {
            return true;
        }

        if (
            ritualState[prerequisite] === 0 &&
            createsParadox(prerequisite)
        ) {
            return true;
        }
    }

    ritualState[ritual] = 2;

    return false;
}

let contradictionExists = false;

for (
    let ritual = 1;
    ritual <= ritualAmount;
    ritual++
) {
    if (
        ritualState[ritual] === 0 &&
        createsParadox(ritual)
    ) {
        contradictionExists = true;
        break;
    }
}

console.log(
    contradictionExists
        ? 'PARADOJA DETECTADA'
        : 'SISTEMA ARCANO ESTABLE'
);