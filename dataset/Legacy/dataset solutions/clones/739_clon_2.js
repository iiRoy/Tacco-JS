var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineData = rawData.trim().split("\n");

while (true) {
    var [totalParticipants, skipCount, startPosition] = lineData.shift().split(" ").map(Number);

    if (totalParticipants + skipCount + startPosition === 0) {
        break;
    }

    var activeParticipants = [];
    for (var idx = 0; idx < totalParticipants; idx++) {
        activeParticipants[idx] = true;
    }

    var currentPointer = startPosition - 1;
    var remainingParticipants = totalParticipants;

    while (true) {
        if (remainingParticipants === 1) {
            break;
        }

        activeParticipants[currentPointer] = false;
        remainingParticipants--;

        var skippedCount = 0;
        while (true) {
            if (skippedCount === skipCount) {
                break;
            }
            currentPointer++;
            if (currentPointer >= totalParticipants) {
                currentPointer = 0;
            }
            if (activeParticipants[currentPointer]) {
                skippedCount++;
            }
        }
    }

    activeParticipants.forEach((isActive, idx) => {
        if (isActive) {
            console.log(idx + 1);
        }
    });
}
