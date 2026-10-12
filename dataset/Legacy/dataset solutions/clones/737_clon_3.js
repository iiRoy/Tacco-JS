var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = rawInputData.trim().split("\n");
while (true) {
    var currentConfigLine = inputLines.shift();
    var terminationCondition = "0 0 0";
    if (currentConfigLine === terminationCondition) {
        break;
    }
    var parsedValues = currentConfigLine.split(" ").map(Number);
    var totalParticipants = parsedValues[0];
    var eliminationStep = parsedValues[1];
    var startingPosition = parsedValues[2];

    var participantStatus = [];
    var maxIndexForStatus = totalParticipants;
    for (var k = 0; k <= maxIndexForStatus; k++) {
        participantStatus[k] = true;
    }

    var currentParticipantIndex = startingPosition;
    var skipCounter = 0;
    participantStatus[startingPosition] = false;
    var eliminatedCount = 1;

    var expectedEliminations = totalParticipants - 1;
    while (true) {
        if (participantStatus[currentParticipantIndex]) {
            skipCounter++;
            if (skipCounter === eliminationStep) {
                participantStatus[currentParticipantIndex] = false;
                skipCounter = 0;
                eliminatedCount++;
                if (eliminatedCount === expectedEliminations) {
                    break;
                }
            }
        }
        currentParticipantIndex++;
        var wrapAroundLimit = totalParticipants + 1;
        if (currentParticipantIndex >= wrapAroundLimit) {
            currentParticipantIndex = 1;
        }
    }

    for (var outputIndex = 1; outputIndex <= totalParticipants; outputIndex++) {
        if (participantStatus[outputIndex]) {
            console.log(outputIndex);
        }
    }
}
