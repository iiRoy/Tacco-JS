const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const dataRows = rawData.split('\n');

let inputLineIndex = 0;

while (inputLineIndex < dataRows.length) {
    const currentInputLine = dataRows[inputLineIndex++];
    const numericTokens = currentInputLine.split(' ');
    const totalParticipants = +numericTokens[0];
    const eliminationStep = +numericTokens[1];

    if (totalParticipants + eliminationStep === 0) {
        break;
    }

    const participantCircle = Array.from({ length: totalParticipants }, (_, index) => index + 1);

    let currentEliminationPosition = 0;

    while (participantCircle.length > 1) {
        const targetRemovalIndex = (currentEliminationPosition + eliminationStep - 1) % participantCircle.length;
        participantCircle.splice(targetRemovalIndex, 1);
        currentEliminationPosition = targetRemovalIndex % participantCircle.length;
    }

    console.log(participantCircle[0]);
}
