const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataSegments = fileContent.trim().split("\n");
let segmentPointer = 0;

while (true) {
    const currentSegment = dataSegments[segmentPointer++];
    if (currentSegment === "0 0 0") break;

    const [totalParticipants, eliminationInterval, initialParticipant] = currentSegment.split(" ").map(Number);

    const activeParticipants = new Set();
    for (let participantId = 1; participantId <= totalParticipants; participantId++) {
        activeParticipants.add(participantId);
    }

    activeParticipants.delete(initialParticipant);

    let lastProcessedParticipant = initialParticipant;
    let intervalCounter = 0;

    while (activeParticipants.size > 1) {
        let nextConsideredParticipant = lastProcessedParticipant;
        do {
            nextConsideredParticipant = (nextConsideredParticipant % totalParticipants) + 1;
        } while (!activeParticipants.has(nextConsideredParticipant));

        intervalCounter++;

        if (intervalCounter === eliminationInterval) {
            activeParticipants.delete(nextConsideredParticipant);
            intervalCounter = 0;
        }
        lastProcessedParticipant = nextConsideredParticipant;
    }

    console.log([...activeParticipants][0]);
}
