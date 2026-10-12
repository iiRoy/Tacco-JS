const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineData = rawInput.trim().split("\n");

let lineCursor = 0;

while (true) {
    const [countPeople, stepSize, startPos] = lineData[lineCursor++].split(" ").map(Number);

    if (countPeople === 0 && stepSize === 0 && startPos === 0) {
        break;
    }

    const activeParticipants = Array.from({ length: countPeople }, (_, idx) => idx + 1);

    let eliminationIndex = startPos - 1;

    while (activeParticipants.length > 1) {
        eliminationIndex = eliminationIndex % activeParticipants.length;

        activeParticipants.splice(eliminationIndex, 1);

        eliminationIndex = (eliminationIndex + stepSize - 1);
    }

    console.log(activeParticipants[0]);
}
