const rawInputBytes = require('node:fs').readFileSync(0, 'utf8');

function identifySoleSurvivor(numPeople, stepCount, initialTarget) {
    let participantList = Array.from({ length: numPeople }, (_, k) => k + 1);
    let eliminationPointer = participantList.indexOf(initialTarget);

    participantList.splice(eliminationPointer, 1); // Perform the first elimination

    // Adjust the pointer for the subsequent counting, wrapping if necessary
    if (eliminationPointer >= participantList.length) {
        eliminationPointer = 0;
    }

    while (participantList.length > 1) {
        // Calculate the index of the next participant to be removed
        // The count starts from the current eliminationPointer and advances 'stepCount' positions
        eliminationPointer = (eliminationPointer + stepCount - 1) % participantList.length;
        participantList.splice(eliminationPointer, 1);
    }
    return participantList[0];
}

const validEntries = rawInputBytes
    .trim()
    .split('\n')
    .filter(segment => segment !== '0 0 0' && segment.length > 0);

const finalOutputs = [];

for (const currentEntry of validEntries) {
    const parsedNumbers = currentEntry.split(' ').map(Number);
    const numPeople = parsedNumbers[0];
    const stepCount = parsedNumbers[1];
    const initialTarget = parsedNumbers[2];

    const loneSurvivor = identifySoleSurvivor(numPeople, stepCount, initialTarget);
    finalOutputs.push(loneSurvivor);
}

for (const ultimateVictor of finalOutputs) {
    console.log(ultimateVictor);
}