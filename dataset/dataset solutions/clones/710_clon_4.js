var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataLines = sourceData.trim().split('\n');

var currentLinePointer = 0;

while (true) {
    var rawInputSegment = dataLines[currentLinePointer++];
    if (rawInputSegment === "0 0") {
        break;
    }

    var numericParts = rawInputSegment.split(" ").map(Number);
    var participantCount = numericParts[0];
    var initialSupply = numericParts[1];

    var targetAmount = initialSupply;
    var participantPiles = Array.from({ length: participantCount }, () => 0);

    var currentSupply = initialSupply;
    var turnCounter = 0;
    var activeParticipantIndex = 0;

    while (true) {
        var actualParticipant = activeParticipantIndex % participantCount;

        if (currentSupply > 0) {
            currentSupply--;
            participantPiles[actualParticipant]++;

            if (currentSupply === 0 && participantPiles[actualParticipant] === targetAmount) {
                console.log(actualParticipant);
                break;
            }
        } else {
            currentSupply = participantPiles[actualParticipant];
            participantPiles[actualParticipant] = 0;
        }

        activeParticipantIndex++;
        turnCounter++;
        if (turnCounter > 1000000) {
            break;
        }
    }
}
