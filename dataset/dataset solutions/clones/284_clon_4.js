const fileSystem = require('fs');
let rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
let lineBuffer = rawData.trim().split("\n");

while (true) {
    const pairString = lineBuffer.shift();
    if (pairString === "0 0") {
        break;
    }

    const [totalCount, stepSize] = pairString.split(" ").map(Number);

    let activeParticipants = Array.from({ length: totalCount }, (_, index) => index + 1);
    let currentPosition = 0;

    while (activeParticipants.length > 1) {
        const removalIndex = (currentPosition + stepSize - 1) % activeParticipants.length;
        activeParticipants.splice(removalIndex, 1);
        currentPosition = removalIndex % activeParticipants.length;
    }

    console.log(activeParticipants[0]);
}
