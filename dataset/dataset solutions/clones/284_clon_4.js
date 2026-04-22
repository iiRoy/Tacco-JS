const sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const sections = sourceData.trim().split('\n');

function locateFinalParticipant(totalParticipants, eliminationInterval) {
    let activeParticipants = [];
    for (let participantIdentifier = 1; participantIdentifier <= totalParticipants; participantIdentifier++) {
        activeParticipants.push(participantIdentifier);
    }

    let currentPointer = 0; // Index within the activeParticipants array

    while (activeParticipants.length > 1) {
        // Calculate the index of the participant to remove
        // We advance (eliminationInterval - 1) positions from currentPointer
        currentPointer = (currentPointer + eliminationInterval - 1) % activeParticipants.length;

        // Remove the participant
        activeParticipants.splice(currentPointer, 1);

        // Adjust currentPointer for the next round:
        // If the removed element was the last one, currentPointer now points out of bounds.
        // It should wrap around to the beginning of the new (shorter) list.
        // This is equivalent to currentPointer % activeParticipants.length.
        currentPointer %= activeParticipants.length;
    }
    return activeParticipants[0];
}

sections.forEach(function(inputLine) {
    if (inputLine === "0 0") {
        return; // Terminate processing for this input set
    }

    const valuePair = inputLine.split(' ').map(Number);
    const countPpl = valuePair[0];
    const stepElimination = valuePair[1];

    const remainingIndividual = locateFinalParticipant(countPpl, stepElimination);
    console.log(remainingIndividual);
});